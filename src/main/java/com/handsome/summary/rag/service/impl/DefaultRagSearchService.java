package com.handsome.summary.rag.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.RagAiService;
import com.handsome.summary.rag.service.RagIndexService;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.rag.store.RagVectorStore;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultRagSearchService implements RagSearchService {

    private static final int RRF_K = 60;

    private final ReactiveExtensionClient client;
    private final SettingConfigGetter settingConfigGetter;
    private final RagAiService ragAiService;
    private final RagVectorStore ragVectorStore;

    @Override
    public Mono<List<RagSearchResult>> search(String knowledgeBase, String query, Integer limit) {
        if (!StringUtils.hasText(query)) {
            return Mono.just(List.of());
        }
        return Mono.zip(settingConfigGetter.getBasicConfig(), settingConfigGetter.getRagConfig())
            .flatMap(tuple -> {
                var basicConfig = tuple.getT1();
                var ragConfig = tuple.getT2();
                if (!enabled(ragConfig.getEnableRag(), true)) {
                    return Mono.just(List.<RagSearchResult>of());
                }
                var finalLimit = normalizedInt(limit, normalizedInt(ragConfig.getRerankTopN(), 8, 1,
                    30), 1, 30);
                return resolveKnowledgeBases(knowledgeBase)
                    .flatMapMany(Flux::fromIterable)
                    .flatMap(kb -> searchKnowledgeBase(kb, query, ragConfig)
                        .flatMapMany(Flux::fromIterable))
                    .collectList()
                    .flatMap(results -> rerankIfNeeded(query, results, basicConfig, ragConfig,
                        finalLimit));
            });
    }

    private Mono<List<RagSearchResult>> searchKnowledgeBase(RagKnowledgeBase knowledgeBase,
        String query, SettingConfigGetter.RagConfig ragConfig) {
        var status = knowledgeBase.getStatus();
        if (status == null || !RagKnowledgeBase.IndexState.READY.name().equals(status.getIndexState())
            || !StringUtils.hasText(status.getIndexVersion())) {
            return Mono.just(List.of());
        }
        var vectorTopK = normalizedInt(ragConfig.getVectorTopK(), 20, 1, 100);
        var keywordTopK = normalizedInt(ragConfig.getKeywordTopK(), 20, 1, 100);
        var hybrid = enabled(ragConfig.getEnableHybridSearch(), true);
        var kbName = knowledgeBase.getMetadata().getName();
        var indexVersion = status.getIndexVersion();
        return ragAiService.embedQuery(query, status.getEmbeddingModelName())
            .flatMap(vector -> {
                var vectorSearch = ragVectorStore.vectorSearch(kbName, indexVersion, vector,
                    vectorTopK);
                var keywordSearch = hybrid
                    ? ragVectorStore.keywordSearch(kbName, indexVersion, query, keywordTopK)
                    : Mono.just(List.<RagSearchResult>of());
                return Mono.zip(vectorSearch, keywordSearch)
                    .map(tuple -> fuse(tuple.getT1(), tuple.getT2()));
            });
    }

    private Mono<List<RagSearchResult>> rerankIfNeeded(String query, List<RagSearchResult> results,
        SettingConfigGetter.BasicConfig basicConfig, SettingConfigGetter.RagConfig ragConfig,
        int finalLimit) {
        var fused = dedupeAndSort(results).stream()
            .limit(Math.max(finalLimit, normalizedInt(ragConfig.getRerankTopN(), 8, 1, 30)))
            .toList();
        if (fused.isEmpty()) {
            return Mono.just(List.of());
        }
        if (!enabled(ragConfig.getEnableRerank(), true)) {
            return Mono.just(fused.stream().limit(finalLimit).toList());
        }
        return ragAiService.rerank(query, fused, basicConfig.getRerankModelName(), finalLimit)
            .map(reranked -> reranked.stream().limit(finalLimit).toList())
            .onErrorResume(error -> {
                log.warn("RAG rerank failed, fallback to fused order: {}", error.getMessage());
                return Mono.just(fused.stream().limit(finalLimit).toList());
            });
    }

    private List<RagSearchResult> fuse(List<RagSearchResult> vectorResults,
        List<RagSearchResult> keywordResults) {
        var fusions = new LinkedHashMap<String, Fusion>();
        addRanked(fusions, vectorResults, true);
        addRanked(fusions, keywordResults, false);
        return fusions.values().stream()
            .map(Fusion::toResult)
            .sorted(Comparator.comparingDouble(RagSearchResult::getScore).reversed())
            .toList();
    }

    private void addRanked(Map<String, Fusion> fusions, List<RagSearchResult> results,
        boolean vector) {
        if (results == null) {
            return;
        }
        for (var i = 0; i < results.size(); i++) {
            var result = results.get(i);
            var key = result.getKnowledgeBase() + ":" + result.getId();
            var fusion = fusions.computeIfAbsent(key, ignored -> new Fusion(result));
            fusion.score += 1.0d / (RRF_K + i + 1);
            if (vector) {
                fusion.vectorScore = result.getVectorScore();
            } else {
                fusion.keywordScore = result.getKeywordScore();
            }
        }
    }

    private List<RagSearchResult> dedupeAndSort(List<RagSearchResult> results) {
        var byId = new LinkedHashMap<String, RagSearchResult>();
        for (var result : results) {
            var key = result.getKnowledgeBase() + ":" + result.getId();
            byId.merge(key, result, (left, right) -> left.getScore() >= right.getScore() ? left : right);
        }
        return new ArrayList<>(byId.values()).stream()
            .sorted(Comparator.comparingDouble(RagSearchResult::getScore).reversed())
            .toList();
    }

    private Mono<List<RagKnowledgeBase>> resolveKnowledgeBases(String knowledgeBase) {
        if (StringUtils.hasText(knowledgeBase)) {
            return client.fetch(RagKnowledgeBase.class, knowledgeBase.strip())
                .filter(this::enabledAndReady)
                .map(List::of)
                .defaultIfEmpty(List.of());
        }
        var options = ListOptions.builder()
            .fieldQuery(equal("spec.enabled", "true"))
            .build();
        return client.listAll(RagKnowledgeBase.class, options, Sort.unsorted())
            .filter(this::enabledAndReady)
            .collectList();
    }

    private boolean enabledAndReady(RagKnowledgeBase knowledgeBase) {
        return knowledgeBase != null
            && knowledgeBase.getSpec() != null
            && enabled(knowledgeBase.getSpec().getEnabled(), true)
            && knowledgeBase.getStatus() != null
            && RagKnowledgeBase.IndexState.READY.name().equals(knowledgeBase.getStatus().getIndexState());
    }

    private int normalizedInt(Integer value, int defaultValue, int min, int max) {
        if (value == null) {
            return defaultValue;
        }
        return Math.min(Math.max(value, min), max);
    }

    private boolean enabled(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }

    private static final class Fusion {
        private final RagSearchResult result;
        private double score;
        private Double vectorScore;
        private Double keywordScore;

        private Fusion(RagSearchResult result) {
            this.result = result;
            this.vectorScore = result.getVectorScore();
            this.keywordScore = result.getKeywordScore();
        }

        private RagSearchResult toResult() {
            return result.toBuilder()
                .score(score)
                .vectorScore(vectorScore)
                .keywordScore(keywordScore)
                .build();
        }
    }
}
