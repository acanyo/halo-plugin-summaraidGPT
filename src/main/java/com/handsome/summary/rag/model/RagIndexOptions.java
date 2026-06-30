package com.handsome.summary.rag.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RagIndexOptions {
    String embeddingModelName;
    int chunkSize;
    int chunkOverlap;
}
