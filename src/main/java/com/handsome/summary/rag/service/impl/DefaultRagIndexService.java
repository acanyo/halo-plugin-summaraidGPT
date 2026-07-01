package com.handsome.summary.rag.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.rag.model.RagEmbeddingOptions;
import com.handsome.summary.rag.model.RagIndexedChunk;
import com.handsome.summary.rag.model.RagIndexSummary;
import com.handsome.summary.rag.service.RagAiService;
import com.handsome.summary.rag.service.RagContentService;
import com.handsome.summary.rag.service.RagIndexService;
import com.handsome.summary.rag.store.RagVectorStore;
import com.handsome.summary.service.SettingConfigGetter;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultRagIndexService implements RagIndexService {

    private static final String CHUNKER_VERSION = "chunker-v2";
    private static final Duration LUCENE_REBUILD_MIN_TIMEOUT = Duration.ofMinutes(2);
    private static final Duration LUCENE_REBUILD_MAX_TIMEOUT = Duration.ofMinutes(30);

    private final ReactiveExtensionClient client;
    private final SettingConfigGetter settingConfigGetter;
    private final RagContentService ragContentService;
    private final RagAiService ragAiService;
    private final RagVectorStore ragVectorStore;

    @Override
    public Mono<RagKnowledgeBase> ensureKnowledgeBase(String knowledgeBase) {
        var name = normalizeKnowledgeBase(knowledgeBase);
        return client.fetch(RagKnowledgeBase.class, name)
            .switchIfEmpty(Mono.defer(() -> client.create(defaultKnowledgeBase(name))));
    }

    @Override
    public Mono<RagIndexSummary> rebuild(String knowledgeBase) {
        return rebuild(knowledgeBase, ProgressListener.noop());
    }

    @Override
    public Mono<RagIndexSummary> rebuild(String knowledgeBase, ProgressListener progressListener) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        var startedAt = System.currentTimeMillis();
        var progress = progressListener == null ? ProgressListener.noop() : progressListener;
        return Mono.zip(settingConfigGetter.getBasicConfig(), settingConfigGetter.getRagConfig())
            .flatMap(tuple -> {
                var basicConfig = tuple.getT1();
                var ragConfig = tuple.getT2();
                if (!enabled(ragConfig.getEnableRag(), true)) {
                    return Mono.error(new IllegalStateException("RAG 知识库未启用"));
                }
                return progress.update(5, "准备重建索引")
                    .then(markIndexing(kbName))
                    .flatMap(kb -> progress.update(15, "读取知识库文档")
                        .then(listDocuments(kbName))
                        .flatMap(documents -> progress.update(25, "清洗并分块文档")
                            .thenReturn(documents))
                        .flatMap(documents -> buildAndStore(kb, documents, basicConfig,
                            ragConfig, startedAt, progress)));
            })
            .onErrorResume(error -> markError(kbName, error).then(Mono.error(error)));
    }

    private Mono<RagIndexSummary> buildAndStore(RagKnowledgeBase knowledgeBase,
        List<RagDocument> documents,
        SettingConfigGetter.BasicConfig basicConfig, SettingConfigGetter.RagConfig ragConfig,
        long startedAt, ProgressListener progressListener) {
        var knowledgeBaseName = knowledgeBaseName(knowledgeBase);
        var chunkSize = normalizedInt(ragConfig.getChunkSize(), 900, 200, 3000);
        var chunkOverlap = normalizedInt(ragConfig.getChunkOverlap(), 120, 0, Math.min(800,
            chunkSize / 2));
        var chunkInputs = new ArrayList<ChunkInput>();
        for (var document : documents) {
            var spec = document.getSpec();
            if (spec == null || !enabled(spec.getEnabled(), true)
                || !StringUtils.hasText(spec.getContent())) {
                continue;
            }
            var chunks = ragContentService.split(spec.getTitle(), spec.getContent(), chunkSize,
                chunkOverlap);
            for (var i = 0; i < chunks.size(); i++) {
                chunkInputs.add(new ChunkInput(document, chunks.get(i), i));
            }
        }

        if (chunkInputs.isEmpty()) {
            return progressListener.update(80, "清空空知识库索引")
                .then(ragVectorStore.rebuild(knowledgeBaseName, "empty", List.of()))
                .then(updateKnowledgeBaseReady(knowledgeBaseName, documents.size(), 0,
                    basicConfig.getEmbeddingModelName(), 0, "empty", startedAt,
                    RagKnowledgeBase.IndexState.EMPTY.name()))
                .thenReturn(RagIndexSummary.builder()
                    .documentCount(documents.size())
                    .chunkCount(0)
                    .embeddingDimensions(0)
                    .indexVersion("empty")
                    .durationMillis(System.currentTimeMillis() - startedAt)
                    .build());
        }

        var texts = chunkInputs.stream().map(ChunkInput::content).toList();
        var embeddingModelName = basicConfig.getEmbeddingModelName();
        var embeddingOptions = embeddingOptions(ragConfig);
        return progressListener.update(45, "调用 AI 基座生成 Embedding")
            .then(ragAiService.embedValues(texts, embeddingModelName, embeddingOptions))
            .flatMap(vectors -> {
                validateEmbeddings(vectors, chunkInputs.size());
                var dimensions = vectors.getFirst().length;
                var indexVersion = indexVersion(embeddingModelName, dimensions, chunkSize,
                    chunkOverlap);
                var indexedChunks = new ArrayList<RagIndexedChunk>();
                for (var i = 0; i < chunkInputs.size(); i++) {
                    indexedChunks.add(toIndexedChunk(knowledgeBase, chunkInputs.get(i), vectors.get(i)));
                }
                return progressListener.update(75, "写入 Lucene 向量索引")
                    .then(writeLuceneIndex(knowledgeBaseName, indexVersion, indexedChunks, dimensions))
                    .then(progressListener.update(85, "Lucene 向量索引写入完成"))
                    .then(progressListener.update(90, "更新知识库索引状态"))
                    .then(updateDocumentStatuses(documents, chunkInputs))
                    .then(updateKnowledgeBaseReady(knowledgeBaseName, documents.size(),
                        indexedChunks.size(), embeddingModelName, dimensions, indexVersion, startedAt,
                        RagKnowledgeBase.IndexState.READY.name()))
                    .thenReturn(RagIndexSummary.builder()
                        .documentCount(documents.size())
                        .chunkCount(indexedChunks.size())
                        .embeddingDimensions(dimensions)
                        .indexVersion(indexVersion)
                        .durationMillis(System.currentTimeMillis() - startedAt)
                        .build());
            });
    }

    private Mono<Void> writeLuceneIndex(String knowledgeBase, String indexVersion,
        List<RagIndexedChunk> indexedChunks, int dimensions) {
        var startedAt = System.currentTimeMillis();
        var timeout = luceneRebuildTimeout(indexedChunks.size());
        log.info("RAG Lucene index write requested: kb={}, version={}, chunks={}, dimensions={}",
            knowledgeBase, indexVersion, indexedChunks.size(), dimensions);
        return ragVectorStore.rebuild(knowledgeBase, indexVersion, indexedChunks)
            .timeout(timeout)
            .doOnSuccess(ignored -> log.info("RAG Lucene index write completed: kb={}, "
                    + "version={}, chunks={}, durationMs={}",
                knowledgeBase, indexVersion, indexedChunks.size(),
                System.currentTimeMillis() - startedAt))
            .doOnError(error -> log.error("RAG Lucene index write failed: kb={}, version={}, "
                    + "chunks={}, durationMs={}",
                knowledgeBase, indexVersion, indexedChunks.size(),
                System.currentTimeMillis() - startedAt, error))
            .onErrorMap(TimeoutException.class, error -> new IllegalStateException(
                "写入 Lucene 向量索引超时，请检查 Lucene 运行时或减少单次重建内容", error));
    }

    private Duration luceneRebuildTimeout(int chunkCount) {
        var minutes = Math.max(LUCENE_REBUILD_MIN_TIMEOUT.toMinutes(), 2 + chunkCount / 1000L);
        return Duration.ofMinutes(Math.min(minutes, LUCENE_REBUILD_MAX_TIMEOUT.toMinutes()));
    }

    private Mono<List<RagDocument>> listDocuments(String knowledgeBase) {
        var options = ListOptions.builder()
            .fieldQuery(equal("spec.knowledgeBase", knowledgeBase))
            .build();
        return client.listAll(RagDocument.class, options, Sort.unsorted())
            .filter(document -> document.getSpec() != null && enabled(document.getSpec().getEnabled(), true))
            .collectList();
    }

    private RagIndexedChunk toIndexedChunk(RagKnowledgeBase knowledgeBase, ChunkInput input,
        float[] vector) {
        var document = input.document();
        var spec = document.getSpec();
        return RagIndexedChunk.builder()
            .id(document.getMetadata().getName() + "#" + input.chunkIndex())
            .knowledgeBase(knowledgeBaseName(knowledgeBase))
            .knowledgeBaseDisplayName(knowledgeBaseDisplayName(knowledgeBase))
            .knowledgeBaseDescription(knowledgeBaseDescription(knowledgeBase))
            .documentName(document.getMetadata().getName())
            .sourceType(spec.getSourceType())
            .sourceName(spec.getSourceName())
            .title(spec.getTitle())
            .url(spec.getUrl())
            .content(input.content())
            .chunkIndex(input.chunkIndex())
            .tags(spec.getTags())
            .categories(spec.getCategories())
            .vector(vector)
            .build();
    }

    private Mono<Void> updateDocumentStatuses(List<RagDocument> documents, List<ChunkInput> chunkInputs) {
        var counts = new java.util.HashMap<String, Integer>();
        for (var document : documents) {
            counts.put(document.getMetadata().getName(), 0);
        }
        for (var input : chunkInputs) {
            counts.merge(input.document().getMetadata().getName(), 1, Integer::sum);
        }
        return reactor.core.publisher.Flux.fromIterable(counts.entrySet())
            .flatMap(entry -> client.fetch(RagDocument.class, entry.getKey())
                .flatMap(document -> {
                    var status = document.getStatus() == null ? new RagDocument.Status()
                        : document.getStatus();
                    status.setChunkCount(entry.getValue());
                    status.setLastIndexedAt(Instant.now());
                    status.setErrorMessage(null);
                    document.setStatus(status);
                    return client.update(document);
                }))
            .then();
    }

    private Mono<RagKnowledgeBase> markIndexing(String knowledgeBase) {
        return ensureKnowledgeBase(knowledgeBase)
            .flatMap(kb -> {
                var status = kb.getStatus() == null ? new RagKnowledgeBase.Status() : kb.getStatus();
                status.setIndexState(RagKnowledgeBase.IndexState.INDEXING.name());
                status.setErrorMessage(null);
                kb.setStatus(status);
                return client.update(kb);
            });
    }

    private Mono<RagKnowledgeBase> updateKnowledgeBaseReady(String knowledgeBase, int documentCount,
        int chunkCount, String embeddingModelName, int dimensions, String indexVersion, long startedAt,
        String state) {
        return ensureKnowledgeBase(knowledgeBase)
            .flatMap(kb -> {
                var status = kb.getStatus() == null ? new RagKnowledgeBase.Status() : kb.getStatus();
                status.setIndexState(state);
                status.setDocumentCount(documentCount);
                status.setChunkCount(chunkCount);
                status.setEmbeddingModelName(embeddingModelName);
                status.setEmbeddingDimensions(dimensions);
                status.setIndexVersion(indexVersion);
                status.setIndexDurationMillis(System.currentTimeMillis() - startedAt);
                status.setLastIndexedAt(Instant.now());
                status.setErrorMessage(null);
                kb.setStatus(status);
                return client.update(kb);
            });
    }

    private Mono<RagKnowledgeBase> markError(String knowledgeBase, Throwable error) {
        return ensureKnowledgeBase(knowledgeBase)
            .flatMap(kb -> {
                var status = kb.getStatus() == null ? new RagKnowledgeBase.Status() : kb.getStatus();
                status.setIndexState(RagKnowledgeBase.IndexState.ERROR.name());
                status.setErrorMessage(errorMessage(error));
                kb.setStatus(status);
                return client.update(kb);
            })
            .onErrorResume(updateError -> {
                log.warn("Failed to update RAG knowledge base error status", updateError);
                return Mono.empty();
            });
    }

    private RagKnowledgeBase defaultKnowledgeBase(String name) {
        var knowledgeBase = new RagKnowledgeBase();
        var metadata = new Metadata();
        metadata.setName(name);
        knowledgeBase.setMetadata(metadata);
        var spec = new RagKnowledgeBase.Spec();
        spec.setDisplayName("默认知识库");
        spec.setEnabled(true);
        spec.setSourceTypes(List.of("POST", "MANUAL"));
        knowledgeBase.setSpec(spec);
        knowledgeBase.setStatus(new RagKnowledgeBase.Status());
        return knowledgeBase;
    }

    private void validateEmbeddings(List<float[]> vectors, int expectedSize) {
        if (vectors == null || vectors.size() != expectedSize) {
            throw new IllegalStateException("Embedding 返回数量与分块数量不一致");
        }
        var dimensions = vectors.getFirst() == null ? 0 : vectors.getFirst().length;
        if (dimensions <= 0) {
            throw new IllegalStateException("Embedding 向量维度为空");
        }
        for (var vector : vectors) {
            if (vector == null || vector.length != dimensions) {
                throw new IllegalStateException("Embedding 向量维度不一致");
            }
        }
    }

    private String indexVersion(String modelName, int dimensions, int chunkSize, int chunkOverlap) {
        var key = defaultString(modelName) + ":" + dimensions + ":" + chunkSize + ":"
            + chunkOverlap + ":" + CHUNKER_VERSION;
        return "v1-" + ragContentService.hash(key).substring(0, 16);
    }

    private int normalizedInt(Integer value, int defaultValue, int min, int max) {
        if (value == null) {
            return defaultValue;
        }
        return Math.min(Math.max(value, min), max);
    }

    private RagEmbeddingOptions embeddingOptions(SettingConfigGetter.RagConfig ragConfig) {
        return new RagEmbeddingOptions(
            normalizedInt(ragConfig.getEmbeddingBatchSize(), 1, 1, 64),
            normalizedInt(ragConfig.getEmbeddingParallelCalls(), 1, 1, 8),
            normalizedInt(ragConfig.getEmbeddingMaxRetries(), 0, 0, 5),
            normalizedInt(ragConfig.getEmbeddingTimeoutSeconds(), 180, 30, 1800)
        );
    }

    private boolean enabled(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String knowledgeBaseName(RagKnowledgeBase knowledgeBase) {
        return knowledgeBase != null && knowledgeBase.getMetadata() != null
            ? defaultString(knowledgeBase.getMetadata().getName())
            : DEFAULT_KNOWLEDGE_BASE;
    }

    private String knowledgeBaseDisplayName(RagKnowledgeBase knowledgeBase) {
        var spec = knowledgeBase == null ? null : knowledgeBase.getSpec();
        if (spec != null && StringUtils.hasText(spec.getDisplayName())) {
            return spec.getDisplayName().strip();
        }
        return knowledgeBaseName(knowledgeBase);
    }

    private String knowledgeBaseDescription(RagKnowledgeBase knowledgeBase) {
        var spec = knowledgeBase == null ? null : knowledgeBase.getSpec();
        return spec != null && StringUtils.hasText(spec.getDescription())
            ? spec.getDescription().strip()
            : "";
    }

    private String errorMessage(Throwable error) {
        var current = error;
        while (current != null && current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        if (current == null || !StringUtils.hasText(current.getMessage())) {
            return error == null ? "Unknown error" : error.toString();
        }
        return current.getMessage();
    }

    private String normalizeKnowledgeBase(String knowledgeBase) {
        return StringUtils.hasText(knowledgeBase) ? knowledgeBase.strip() : DEFAULT_KNOWLEDGE_BASE;
    }

    private record ChunkInput(RagDocument document, String content, int chunkIndex) {
    }
}
