package com.handsome.summary.rag.extension;

import static com.handsome.summary.rag.extension.RagDocument.KIND;

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
    version = Constant.VERSION, singular = "ragdocument", plural = "ragdocuments")
@EqualsAndHashCode(callSuper = true)
public class RagDocument extends AbstractExtension {

    public static final String KIND = "RagDocument";

    private Spec spec;

    private Status status;

    @Data
    public static class Spec {
        @Schema(description = "Knowledge base metadata.name")
        private String knowledgeBase;

        @Schema(description = "Source type, such as POST")
        private String sourceType;

        @Schema(description = "Source metadata.name or stable external id")
        private String sourceName;

        @Schema(description = "Display title")
        private String title;

        @Schema(description = "Public URL")
        private String url;

        @Schema(description = "Normalized text content")
        private String content;

        @Schema(description = "Content SHA-256 hash")
        private String contentHash;

        @Schema(description = "Whether this document is indexed")
        private Boolean enabled = true;

        private List<String> tags;

        private List<String> categories;
    }

    @Data
    public static class Status {
        private Instant lastImportedAt;
        private Instant lastIndexedAt;
        private Integer chunkCount = 0;
        private String errorMessage;
    }
}
