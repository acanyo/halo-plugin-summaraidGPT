package com.handsome.summary.reading.extension;

import static com.handsome.summary.reading.extension.ArticleReading.KIND;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.ArrayList;
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
    version = Constant.VERSION, singular = "articlereading", plural = "articlereadings")
@EqualsAndHashCode(callSuper = true)
public class ArticleReading extends AbstractExtension {

    public static final String KIND = "ArticleReading";

    private Spec spec;

    @Data
    public static class Spec {
        @Schema(description = "Post metadata.name")
        private String postMetadataName;

        @Schema(description = "Post display title")
        private String postTitle;

        @Schema(description = "Post public URL")
        private String postUrl;

        @Schema(description = "Normalized article content SHA-256 hash")
        private String contentHash;

        @Schema(description = "Insight graph schema version")
        private Integer schemaVersion = 4;

        @Schema(description = "AI model metadata.name")
        private String modelName;

        @Schema(description = "Generated time")
        private Instant generatedAt;

        private InsightNode root = new InsightNode();

        private List<InsightNode> nodes = new ArrayList<>();

        private List<InsightEdge> edges = new ArrayList<>();
    }

    @Data
    public static class InsightNode {
        private String id;

        private String title;

        private String kind;

        private String summary;

        private SourceRange sourceRange;

        private InsightPayload payload = new InsightPayload();
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public static class InsightPayload {
        private List<String> items = new ArrayList<>();
    }

    @Data
    public static class SourceRange {
        private Integer startParagraph;

        private Integer endParagraph;

        private String anchor;
    }

    @Data
    public static class InsightEdge {
        private String from;

        private String to;

        private String type;
    }
}
