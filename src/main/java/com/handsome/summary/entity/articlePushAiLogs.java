package com.handsome.summary.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

@Data
@EqualsAndHashCode(callSuper = true)
@GVK(kind = "articlePushAiLogs", group = "handsome.lik.cc",
    version = "v1alpha1", singular = "articlepushailogs", plural = "articlepushailogs")
@AllArgsConstructor
@NoArgsConstructor
public class articlePushAiLogs extends AbstractExtension {
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
    private TokenSub.Spec spec;

    @Data
    @Schema(name = "articlePushAiLogsSpec")
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Spec {
        @Schema(requiredMode = REQUIRED)
        private String articleTitle;
        @Schema(requiredMode = REQUIRED)
        private String articleMeta;
        @Schema(requiredMode = REQUIRED)
        private String summary;
    }
}
