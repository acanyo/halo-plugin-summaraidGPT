package com.handsome.summary.rag.service;

import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.rag.model.RagIndexSummary;
import reactor.core.publisher.Mono;

public interface RagIndexService {

    String DEFAULT_KNOWLEDGE_BASE = "default";

    Mono<RagKnowledgeBase> ensureKnowledgeBase(String knowledgeBase);

    Mono<RagIndexSummary> rebuild(String knowledgeBase);

    Mono<RagIndexSummary> rebuild(String knowledgeBase, ProgressListener progressListener);

    @FunctionalInterface
    interface ProgressListener {
        Mono<Void> update(int progress, String message);

        static ProgressListener noop() {
            return (progress, message) -> Mono.empty();
        }
    }
}
