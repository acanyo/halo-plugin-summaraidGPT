package com.handsome.summary.rag.model;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RagIndexedChunk {
    String id;
    String knowledgeBase;
    String knowledgeBaseDisplayName;
    String knowledgeBaseDescription;
    String documentName;
    String sourceType;
    String sourceName;
    String title;
    String url;
    String content;
    int chunkIndex;
    List<String> tags;
    List<String> categories;
    float[] vector;
}
