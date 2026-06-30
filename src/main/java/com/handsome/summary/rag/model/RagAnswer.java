package com.handsome.summary.rag.model;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class RagAnswer {
    String answer;
    List<RagSourceReference> sources;
    String conversationId;
}
