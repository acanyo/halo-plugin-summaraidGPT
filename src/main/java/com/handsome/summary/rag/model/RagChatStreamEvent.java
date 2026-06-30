package com.handsome.summary.rag.model;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RagChatStreamEvent {
    String type;
    String delta;
    List<RagSourceReference> sources;
    String error;
    String conversationId;

    public static RagChatStreamEvent conversation(String conversationId) {
        return RagChatStreamEvent.builder()
            .type("conversation")
            .conversationId(conversationId)
            .build();
    }

    public static RagChatStreamEvent sources(List<RagSourceReference> sources) {
        return RagChatStreamEvent.builder()
            .type("sources")
            .sources(sources == null ? List.of() : sources)
            .build();
    }

    public static RagChatStreamEvent delta(String delta) {
        return RagChatStreamEvent.builder()
            .type("delta")
            .delta(delta)
            .build();
    }

    public static RagChatStreamEvent done() {
        return RagChatStreamEvent.builder()
            .type("done")
            .build();
    }

    public static RagChatStreamEvent error(String error) {
        return RagChatStreamEvent.builder()
            .type("error")
            .error(error)
            .build();
    }
}
