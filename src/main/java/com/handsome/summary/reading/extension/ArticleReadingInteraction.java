package com.handsome.summary.reading.extension;

import static com.handsome.summary.reading.extension.ArticleReadingInteraction.KIND;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import run.halo.app.core.extension.content.Constant;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@ToString(callSuper = true)
@GVK(kind = KIND, group = "summaraidgpt.lik.cc",
    version = Constant.VERSION, singular = "articlereadinginteraction",
    plural = "articlereadinginteractions")
@EqualsAndHashCode(callSuper = true)
public class ArticleReadingInteraction extends AbstractExtension {

    public static final String KIND = "ArticleReadingInteraction";

    private Spec spec;

    @Data
    public static class Spec {
        @Schema(description = "Post metadata.name")
        private String postMetadataName;

        @Schema(description = "Insight graph node id")
        private String nodeId;

        @Schema(description = "Interaction type, such as feedback or favorite")
        private String interactionType;

        @Schema(description = "Interaction value, such as useful")
        private String value;

        @Schema(description = "Visitor identifier when available")
        private String visitorId;

        @Schema(description = "Created time")
        private Instant createdAt;
    }
}
