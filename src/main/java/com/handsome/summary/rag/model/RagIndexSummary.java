package com.handsome.summary.rag.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagIndexSummary {
    int documentCount;
    int chunkCount;
    int embeddingDimensions;
    String indexVersion;
    long durationMillis;
}
