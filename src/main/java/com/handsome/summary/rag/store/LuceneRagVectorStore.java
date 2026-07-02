package com.handsome.summary.rag.store;

import com.handsome.summary.rag.model.RagIndexedChunk;
import com.handsome.summary.rag.model.RagSearchResult;
import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.lucene.analysis.cjk.CJKAnalyzer;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.KnnFloatVectorField;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexNotFoundException;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.VectorSimilarityFunction;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.KnnFloatVectorQuery;
import org.apache.lucene.store.FSDirectory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.plugin.PluginsRootGetter;

@Slf4j
@Service
@RequiredArgsConstructor
public class LuceneRagVectorStore implements RagVectorStore {

    private static final String FIELD_ID = "id";
    private static final String FIELD_KNOWLEDGE_BASE = "knowledgeBase";
    private static final String FIELD_KNOWLEDGE_BASE_DISPLAY_NAME = "knowledgeBaseDisplayName";
    private static final String FIELD_KNOWLEDGE_BASE_DESCRIPTION = "knowledgeBaseDescription";
    private static final String FIELD_DOCUMENT_NAME = "documentName";
    private static final String FIELD_SOURCE_TYPE = "sourceType";
    private static final String FIELD_SOURCE_NAME = "sourceName";
    private static final String FIELD_TITLE = "title";
    private static final String FIELD_URL = "url";
    private static final String FIELD_CONTENT = "content";
    private static final String FIELD_CHUNK_INDEX = "chunkIndex";
    private static final String FIELD_VECTOR = "vector";
    private static final String FIELD_TAGS = "tags";
    private static final String FIELD_CATEGORIES = "categories";

    private final PluginsRootGetter pluginsRootGetter;

    @Override
    public Mono<Void> rebuild(String knowledgeBase, String indexVersion, List<RagIndexedChunk> chunks) {
        return Mono.fromRunnable(() -> {
            var basePath = knowledgeBasePath(knowledgeBase);
            var targetPath = indexPath(knowledgeBase, indexVersion);
            var stagingPath = stagingPath(knowledgeBase, indexVersion);
            var startedAt = System.currentTimeMillis();
            var dimensions = vectorDimensions(chunks);
            log.info(
                "RAG Lucene rebuild start kb={} version={} chunks={} dimensions={} targetPath={} "
                    + "stagingPath={} runtime={}",
                knowledgeBase, indexVersion, chunks.size(), dimensions, targetPath, stagingPath,
                LuceneRuntimeDiagnostics.describe()
            );
            try {
                deleteDirectory(stagingPath);
                Files.createDirectories(stagingPath);
                try (var directory = FSDirectory.open(stagingPath);
                    var analyzer = new CJKAnalyzer()) {
                    var config = new IndexWriterConfig(analyzer);
                    config.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
                    config.setCodec(new SummaraidGptLuceneCodec());
                    try (var writer = new IndexWriter(directory, config)) {
                        for (var chunk : chunks) {
                            writer.addDocument(toDocument(chunk));
                        }
                        writer.commit();
                    }
                }
                deleteDirectory(basePath);
                Files.createDirectories(targetPath.getParent());
                moveDirectory(stagingPath, targetPath);
                log.info("RAG Lucene rebuild success kb={} version={} chunks={} dimensions={} "
                        + "durationMs={}",
                    knowledgeBase, indexVersion, chunks.size(), dimensions,
                    System.currentTimeMillis() - startedAt);
            } catch (IOException e) {
                safeDeleteDirectory(stagingPath);
                throw new IllegalStateException("Failed to rebuild RAG Lucene index", e);
            } catch (RuntimeException e) {
                safeDeleteDirectory(stagingPath);
                throw e;
            } catch (LinkageError e) {
                safeDeleteDirectory(stagingPath);
                throw new IllegalStateException("Failed to initialize RAG Lucene runtime: "
                    + LuceneRuntimeDiagnostics.describe(), e);
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    @Override
    public Mono<Void> replaceDocuments(String knowledgeBase, String indexVersion,
        List<String> documentNames, List<RagIndexedChunk> chunks) {
        return Mono.fromRunnable(() -> {
            var names = documentNames(documentNames, chunks);
            if (names.isEmpty() && (chunks == null || chunks.isEmpty())) {
                return;
            }
            var targetPath = indexPath(knowledgeBase, indexVersion);
            var startedAt = System.currentTimeMillis();
            var safeChunks = defaultChunks(chunks);
            var dimensions = vectorDimensions(safeChunks);
            log.info("RAG Lucene replace documents start kb={} version={} documents={} chunks={} "
                    + "dimensions={} targetPath={} runtime={}",
                knowledgeBase, indexVersion, names.size(), safeChunks.size(), dimensions,
                targetPath, LuceneRuntimeDiagnostics.describe());
            try {
                Files.createDirectories(targetPath);
                try (var directory = FSDirectory.open(targetPath);
                    var analyzer = new CJKAnalyzer()) {
                    var config = new IndexWriterConfig(analyzer);
                    config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
                    config.setCodec(new SummaraidGptLuceneCodec());
                    try (var writer = new IndexWriter(directory, config)) {
                        for (var documentName : names) {
                            writer.deleteDocuments(new Term(FIELD_DOCUMENT_NAME, documentName));
                        }
                        for (var chunk : safeChunks) {
                            writer.addDocument(toDocument(chunk));
                        }
                        writer.commit();
                    }
                }
                log.info("RAG Lucene replace documents success kb={} version={} documents={} "
                        + "chunks={} durationMs={}",
                    knowledgeBase, indexVersion, names.size(), safeChunks.size(),
                    System.currentTimeMillis() - startedAt);
            } catch (IOException e) {
                throw new IllegalStateException("Failed to replace RAG Lucene documents", e);
            } catch (LinkageError e) {
                throw new IllegalStateException("Failed to initialize RAG Lucene runtime: "
                    + LuceneRuntimeDiagnostics.describe(), e);
            }
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    @Override
    public Mono<Void> clear(String knowledgeBase) {
        return Mono.fromRunnable(() -> deleteDirectory(knowledgeBasePath(knowledgeBase)))
            .subscribeOn(Schedulers.boundedElastic())
            .then();
    }

    @Override
    public Mono<List<RagSearchResult>> vectorSearch(String knowledgeBase, String indexVersion,
        float[] queryVector, int topK) {
        return Mono.fromCallable(() -> {
            if (queryVector == null || queryVector.length == 0 || topK <= 0) {
                return List.<RagSearchResult>of();
            }
            var startedAt = System.currentTimeMillis();
            log.debug("RAG Lucene vector search start kb={} version={} dimensions={} topK={}",
                knowledgeBase, indexVersion, queryVector.length, topK);
            try (var directory = FSDirectory.open(indexPath(knowledgeBase, indexVersion));
                var reader = DirectoryReader.open(directory)) {
                var searcher = new IndexSearcher(reader);
                var query = new KnnFloatVectorQuery(FIELD_VECTOR, queryVector, topK);
                var topDocs = searcher.search(query, topK);
                var results = new ArrayList<RagSearchResult>();
                for (var scoreDoc : topDocs.scoreDocs) {
                    var document = searcher.storedFields().document(scoreDoc.doc);
                    results.add(toSearchResult(document, scoreDoc.score, (double) scoreDoc.score, null));
                }
                log.debug("RAG Lucene vector search success kb={} version={} results={} "
                        + "durationMs={}",
                    knowledgeBase, indexVersion, results.size(),
                    System.currentTimeMillis() - startedAt);
                return results;
            } catch (IndexNotFoundException e) {
                log.debug("RAG Lucene index not found: kb={}, version={}", knowledgeBase, indexVersion);
                return List.<RagSearchResult>of();
            } catch (LinkageError e) {
                throw new IllegalStateException("Failed to initialize RAG Lucene runtime: "
                    + LuceneRuntimeDiagnostics.describe(), e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Mono<List<RagSearchResult>> keywordSearch(String knowledgeBase, String indexVersion,
        String queryText, int topK) {
        return Mono.fromCallable(() -> {
            if (!StringUtils.hasText(queryText) || topK <= 0) {
                return List.<RagSearchResult>of();
            }
            var startedAt = System.currentTimeMillis();
            log.debug("RAG Lucene keyword search start kb={} version={} queryChars={} topK={}",
                knowledgeBase, indexVersion, queryText.length(), topK);
            try (var directory = FSDirectory.open(indexPath(knowledgeBase, indexVersion));
                var reader = DirectoryReader.open(directory);
                var analyzer = new CJKAnalyzer()) {
                var searcher = new IndexSearcher(reader);
                var parser = new MultiFieldQueryParser(
                    new String[] {
                        FIELD_TITLE,
                        FIELD_CONTENT,
                        FIELD_TAGS,
                        FIELD_CATEGORIES,
                        FIELD_SOURCE_NAME,
                        FIELD_SOURCE_TYPE,
                        FIELD_KNOWLEDGE_BASE_DISPLAY_NAME,
                        FIELD_KNOWLEDGE_BASE_DESCRIPTION
                    },
                    analyzer,
                    Map.of(
                        FIELD_TITLE, 2.4f,
                        FIELD_CONTENT, 1.0f,
                        FIELD_TAGS, 1.8f,
                        FIELD_CATEGORIES, 1.6f,
                        FIELD_SOURCE_NAME, 1.2f,
                        FIELD_SOURCE_TYPE, 1.1f,
                        FIELD_KNOWLEDGE_BASE_DISPLAY_NAME, 1.25f,
                        FIELD_KNOWLEDGE_BASE_DESCRIPTION, 0.8f
                    )
                );
                var query = parser.parse(QueryParser.escape(queryText));
                var topDocs = searcher.search(query, topK);
                var maxScore = topDocs.scoreDocs.length == 0 ? 1.0f : topDocs.scoreDocs[0].score;
                var results = new ArrayList<RagSearchResult>();
                for (var scoreDoc : topDocs.scoreDocs) {
                    var normalizedScore = maxScore > 0 ? scoreDoc.score / maxScore : scoreDoc.score;
                    var document = searcher.storedFields().document(scoreDoc.doc);
                    results.add(toSearchResult(document, normalizedScore, null, (double) normalizedScore));
                }
                log.debug("RAG Lucene keyword search success kb={} version={} results={} "
                        + "durationMs={}",
                    knowledgeBase, indexVersion, results.size(),
                    System.currentTimeMillis() - startedAt);
                return results;
            } catch (IndexNotFoundException e) {
                log.debug("RAG Lucene index not found: kb={}, version={}", knowledgeBase, indexVersion);
                return List.<RagSearchResult>of();
            } catch (LinkageError e) {
                throw new IllegalStateException("Failed to initialize RAG Lucene runtime: "
                    + LuceneRuntimeDiagnostics.describe(), e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private org.apache.lucene.document.Document toDocument(RagIndexedChunk chunk) {
        validateVector(chunk);
        var document = new org.apache.lucene.document.Document();
        document.add(new StringField(FIELD_ID, chunk.getId(), Field.Store.YES));
        document.add(new StringField(FIELD_KNOWLEDGE_BASE, chunk.getKnowledgeBase(), Field.Store.YES));
        document.add(new TextField(FIELD_KNOWLEDGE_BASE_DISPLAY_NAME,
            defaultString(chunk.getKnowledgeBaseDisplayName()), Field.Store.YES));
        document.add(new TextField(FIELD_KNOWLEDGE_BASE_DESCRIPTION,
            defaultString(chunk.getKnowledgeBaseDescription()), Field.Store.YES));
        document.add(new StringField(FIELD_DOCUMENT_NAME, chunk.getDocumentName(), Field.Store.YES));
        document.add(new TextField(FIELD_SOURCE_TYPE, defaultString(chunk.getSourceType()), Field.Store.YES));
        document.add(new TextField(FIELD_SOURCE_NAME, defaultString(chunk.getSourceName()), Field.Store.YES));
        document.add(new TextField(FIELD_TITLE, defaultString(chunk.getTitle()), Field.Store.YES));
        document.add(new StoredField(FIELD_URL, defaultString(chunk.getUrl())));
        document.add(new TextField(FIELD_CONTENT, defaultString(chunk.getContent()), Field.Store.YES));
        document.add(new StoredField(FIELD_CHUNK_INDEX, chunk.getChunkIndex()));
        document.add(new TextField(FIELD_TAGS, joinList(chunk.getTags()), Field.Store.YES));
        document.add(new TextField(FIELD_CATEGORIES, joinList(chunk.getCategories()), Field.Store.YES));
        document.add(new KnnFloatVectorField(FIELD_VECTOR, chunk.getVector(),
            VectorSimilarityFunction.COSINE));
        return document;
    }

    private void validateVector(RagIndexedChunk chunk) {
        var vector = chunk.getVector();
        if (vector == null || vector.length == 0) {
            throw new IllegalStateException("RAG chunk vector is empty: " + chunk.getId());
        }
        for (var value : vector) {
            if (!Float.isFinite(value)) {
                throw new IllegalStateException("RAG chunk vector contains non-finite value: "
                    + chunk.getId());
            }
        }
    }

    private RagSearchResult toSearchResult(org.apache.lucene.document.Document document, double score,
        Double vectorScore, Double keywordScore) {
        var chunkIndex = chunkIndex(document);
        return RagSearchResult.builder()
            .id(document.get(FIELD_ID))
            .knowledgeBase(document.get(FIELD_KNOWLEDGE_BASE))
            .documentName(document.get(FIELD_DOCUMENT_NAME))
            .sourceType(document.get(FIELD_SOURCE_TYPE))
            .sourceName(document.get(FIELD_SOURCE_NAME))
            .title(document.get(FIELD_TITLE))
            .url(document.get(FIELD_URL))
            .content(document.get(FIELD_CONTENT))
            .chunkIndex(chunkIndex)
            .score(score)
            .vectorScore(vectorScore)
            .keywordScore(keywordScore)
            .metadata(metadata(document, chunkIndex))
            .build();
    }

    private Map<String, Object> metadata(org.apache.lucene.document.Document document,
        Integer chunkIndex) {
        var metadata = new LinkedHashMap<String, Object>();
        metadata.put("documentName", defaultString(document.get(FIELD_DOCUMENT_NAME)));
        metadata.put("documentTitle", defaultString(document.get(FIELD_TITLE)));
        metadata.put("chunkIndex", chunkIndex == null ? "" : chunkIndex);
        metadata.put("sourceType", defaultString(document.get(FIELD_SOURCE_TYPE)));
        metadata.put("sourceName", defaultString(document.get(FIELD_SOURCE_NAME)));
        metadata.put("knowledgeBase", defaultString(document.get(FIELD_KNOWLEDGE_BASE)));
        metadata.put("knowledgeBaseDisplayName",
            defaultString(document.get(FIELD_KNOWLEDGE_BASE_DISPLAY_NAME)));
        metadata.put("knowledgeBaseDescription",
            defaultString(document.get(FIELD_KNOWLEDGE_BASE_DESCRIPTION)));
        metadata.put("tags", splitStoredList(document.get(FIELD_TAGS)));
        metadata.put("categories", splitStoredList(document.get(FIELD_CATEGORIES)));
        return Map.copyOf(metadata);
    }

    private Path indexPath(String knowledgeBase, String indexVersion) {
        return knowledgeBasePath(knowledgeBase).resolve(safePathName(indexVersion));
    }

    private Path stagingPath(String knowledgeBase, String indexVersion) {
        return knowledgeBasePath("_staging")
            .resolve(safePathName(knowledgeBase))
            .resolve(safePathName(indexVersion) + "-" + System.nanoTime());
    }

    private Path knowledgeBasePath(String knowledgeBase) {
        return pluginsRootGetter.get().getParent()
            .resolve("indices")
            .resolve("summaraidgpt-rag")
            .resolve(safePathName(knowledgeBase));
    }

    private void deleteDirectory(Path path) {
        if (!Files.exists(path)) {
            return;
        }
        try (var stream = Files.walk(path)) {
            stream.sorted(Comparator.reverseOrder()).forEach(item -> {
                try {
                    Files.deleteIfExists(item);
                } catch (IOException e) {
                    throw new IllegalStateException("Failed to delete RAG index path " + item, e);
                }
            });
        } catch (IOException e) {
            throw new IllegalStateException("Failed to clean RAG index path " + path, e);
        }
    }

    private void safeDeleteDirectory(Path path) {
        try {
            deleteDirectory(path);
        } catch (RuntimeException e) {
            log.warn("Failed to clean RAG staging index path: {}", path, e);
        }
    }

    private void moveDirectory(Path source, Path target) throws IOException {
        try {
            Files.move(source, target, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException e) {
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private String safePathName(String value) {
        var text = StringUtils.hasText(value) ? value : "default";
        return text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "-");
    }

    private List<String> defaultList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private List<RagIndexedChunk> defaultChunks(List<RagIndexedChunk> chunks) {
        return chunks == null ? List.of() : chunks;
    }

    private List<String> documentNames(List<String> documentNames, List<RagIndexedChunk> chunks) {
        var names = new ArrayList<String>();
        if (documentNames != null) {
            documentNames.stream()
                .filter(StringUtils::hasText)
                .map(String::strip)
                .forEach(names::add);
        }
        if (chunks != null) {
            chunks.stream()
                .map(RagIndexedChunk::getDocumentName)
                .filter(StringUtils::hasText)
                .map(String::strip)
                .forEach(names::add);
        }
        return names.stream().distinct().toList();
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String joinList(List<String> values) {
        return String.join("\n", defaultList(values).stream()
            .filter(StringUtils::hasText)
            .map(String::strip)
            .toList());
    }

    private List<String> splitStoredList(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        return value.lines()
            .map(String::strip)
            .filter(StringUtils::hasText)
            .toList();
    }

    private Integer chunkIndex(org.apache.lucene.document.Document document) {
        var field = document.getField(FIELD_CHUNK_INDEX);
        if (field == null || field.numericValue() == null) {
            return null;
        }
        return field.numericValue().intValue();
    }

    private int vectorDimensions(List<RagIndexedChunk> chunks) {
        return chunks.stream()
            .map(RagIndexedChunk::getVector)
            .filter(vector -> vector != null && vector.length > 0)
            .map(vector -> vector.length)
            .findFirst()
            .orElse(0);
    }
}
