package com.handsome.summary.rag.service;

import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagEmbeddingOptions;
import com.handsome.summary.rag.model.RagSearchResult;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RagAiService {

    Mono<List<float[]>> embedValues(List<String> texts, String modelName,
        RagEmbeddingOptions options);

    Mono<float[]> embedQuery(String text, String modelName);

    Mono<List<RagSearchResult>> rerank(String query, List<RagSearchResult> candidates,
        String modelName, int topN);

    Mono<RagAnswer> generateAnswer(String question, List<RagSearchResult> sources,
        String modelName, String systemPrompt, int maxContextCharacters);

    Flux<RagChatStreamEvent> streamAnswer(String question, List<RagSearchResult> sources,
        String modelName, String systemPrompt, int maxContextCharacters);
}
