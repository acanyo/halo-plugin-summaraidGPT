package com.handsome.summary.rag.service;

import com.handsome.summary.rag.model.RagSearchResult;
import java.util.List;
import java.util.function.Function;
import reactor.core.publisher.Mono;

public interface RagSearchService {

    Mono<List<RagSearchResult>> search(String knowledgeBase, String query, Integer limit);

    /** Apply an access filter before candidates are sent to the reranking model. */
    Mono<List<RagSearchResult>> searchFiltered(String knowledgeBase, String query, Integer limit,
        Function<List<RagSearchResult>, Mono<List<RagSearchResult>>> candidateFilter);
}
