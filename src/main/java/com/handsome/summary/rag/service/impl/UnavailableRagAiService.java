package com.handsome.summary.rag.service.impl;

import com.handsome.summary.ai.ConditionalOnMissingHaloAiFoundation;
import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagEmbeddingOptions;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.RagAiService;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@ConditionalOnMissingHaloAiFoundation
public class UnavailableRagAiService implements RagAiService {

    @Override
    public Mono<List<float[]>> embedValues(List<String> texts, String modelName,
        RagEmbeddingOptions options) {
        return unavailable();
    }

    @Override
    public Mono<float[]> embedQuery(String text, String modelName) {
        return unavailable();
    }

    @Override
    public Mono<List<RagSearchResult>> rerank(String query, List<RagSearchResult> candidates,
        String modelName, int topN) {
        return unavailable();
    }

    @Override
    public Mono<RagAnswer> generateAnswer(String question, List<RagSearchResult> sources,
        String modelName, String systemPrompt, int maxContextCharacters) {
        return unavailable();
    }

    @Override
    public Flux<RagChatStreamEvent> streamAnswer(String question, List<RagSearchResult> sources,
        String modelName, String systemPrompt, int maxContextCharacters) {
        return Flux.error(new IllegalStateException("AI Foundation 插件未安装或未启用"));
    }

    private <T> Mono<T> unavailable() {
        return Mono.error(new IllegalStateException("AI Foundation 插件未安装或未启用"));
    }
}
