package com.handsome.summary.rag.model;

public record RagEmbeddingOptions(
    int batchSize,
    int maxParallelCalls,
    int maxRetries,
    int timeoutSeconds
) {
}
