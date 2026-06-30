package com.handsome.summary.rag.store;

import com.handsome.summary.rag.model.RagIndexedChunk;
import com.handsome.summary.rag.model.RagSearchResult;
import java.util.List;
import reactor.core.publisher.Mono;

public interface RagVectorStore {

    Mono<Void> rebuild(String knowledgeBase, String indexVersion, List<RagIndexedChunk> chunks);

    Mono<Void> clear(String knowledgeBase);

    Mono<List<RagSearchResult>> vectorSearch(String knowledgeBase, String indexVersion,
        float[] queryVector, int topK);

    Mono<List<RagSearchResult>> keywordSearch(String knowledgeBase, String indexVersion,
        String query, int topK);
}
