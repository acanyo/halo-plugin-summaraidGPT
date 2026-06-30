package com.handsome.summary.rag.service;

import com.handsome.summary.rag.model.RagSearchResult;
import java.util.List;
import reactor.core.publisher.Mono;

public interface RagSearchService {

    Mono<List<RagSearchResult>> search(String knowledgeBase, String query, Integer limit);
}
