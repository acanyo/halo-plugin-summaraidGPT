package com.handsome.summary.rag.extension;

import static com.handsome.summary.rag.extension.RagKnowledgeBase.KIND;

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
    version = Constant.VERSION, singular = "ragknowledgebase", plural = "ragknowledgebases")
@EqualsAndHashCode(callSuper = true)
public class RagKnowledgeBase extends AbstractExtension {

    public static final String KIND = "RagKnowledgeBase";

    private Spec spec;

    private Status status;

    @Data
    public static class Spec {
        @Schema(description = "Display name")
        private String displayName;

        @Schema(description = "Description")
        private String description;

        @Schema(description = "Whether this knowledge base is enabled")
        private Boolean enabled = true;

        @Schema(description = "Source types included in this knowledge base")
        private List<String> sourceTypes = List.of("POST", "MANUAL");
    }

    @Data
    public static class Status {
        private String indexState = IndexState.EMPTY.name();
        private Integer documentCount = 0;
        private Integer chunkCount = 0;
        private String embeddingModelName;
        private Integer embeddingDimensions;
        private String indexVersion;
        private Long indexDurationMillis;
        private Instant lastIndexedAt;
        private String errorMessage;
    }

    public enum IndexState {
        EMPTY,
        INDEXING,
        READY,
        ERROR
    }
}
