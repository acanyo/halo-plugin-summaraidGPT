package com.handsome.summary.rag.extension;

import static com.handsome.summary.rag.extension.RagConversation.KIND;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import run.halo.app.core.extension.content.Constant;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@ToString(callSuper = true)
@GVK(kind = KIND, group = "summaraidgpt.lik.cc",
    version = Constant.VERSION, singular = "ragconversation", plural = "ragconversations")
@EqualsAndHashCode(callSuper = true)
public class RagConversation extends AbstractExtension {

    public static final String KIND = "RagConversation";

    private Spec spec;

    private Status status;

    @Data
    public static class Spec {
        @Schema(description = "Knowledge base metadata.name")
        private String knowledgeBase;

        @Schema(description = "Stable browser visitor id")
        private String visitorId;

        @Schema(description = "Conversation title")
        private String title;

        @Schema(description = "User agent snapshot")
        private String userAgent;

        @Schema(description = "Conversation messages")
        private List<Message> messages = List.of();
    }

    @Data
    public static class Message {
        private String id;
        private String role;
        private String content;
        private Instant createdAt;
        private List<Source> sources = List.of();
        private Boolean error = false;
    }

    @Data
    public static class Source {
        private String id;
        private String documentName;
        private String sourceName;
        private String sourceType;
        private String title;
        private String url;
        private Double score;
        private Integer chunkCount;
        private List<String> chunkIndexes = List.of();
        private List<String> sourceIds = List.of();
        private String content;
    }

    @Data
    public static class Status {
        private Integer messageCount = 0;
        private Integer userMessageCount = 0;
        private Integer assistantMessageCount = 0;
        private Integer totalInputChars = 0;
        private Integer totalOutputChars = 0;
        private Instant createdAt;
        private Instant lastMessageAt;
        private Instant lastUserMessageAt;
        private Instant lastAssistantMessageAt;
    }
}
