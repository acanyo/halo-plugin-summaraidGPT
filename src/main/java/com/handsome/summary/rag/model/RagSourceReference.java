package com.handsome.summary.rag.model;

import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RagSourceReference {
    String id;
    String sourceType;
    String title;
    String url;
    Double score;
    Map<String, Object> metadata;
}
