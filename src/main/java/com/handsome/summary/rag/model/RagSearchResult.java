package com.handsome.summary.rag.model;

import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class RagSearchResult {
    String id;
    String knowledgeBase;
    String documentName;
    String sourceType;
    String sourceName;
    String title;
    String url;
    String content;
    Integer chunkIndex;
    double score;
    Double vectorScore;
    Double keywordScore;
    Double rerankScore;
    Map<String, Object> metadata;
}
