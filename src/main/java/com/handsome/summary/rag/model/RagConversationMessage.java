package com.handsome.summary.rag.model;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RagConversationMessage {
    String role;
    String content;
    Instant createdAt;
}
