package com.handsome.summary.extension;


import static com.handsome.summary.extension.Summary.KIND;
import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import run.halo.app.core.extension.attachment.Constant;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@ToString(callSuper = true)
@GVK(kind = KIND, group = "summaraidgpt.lik.cc",
    version = Constant.VERSION, singular = "summary", plural = "summary")
@EqualsAndHashCode(callSuper = true)
public class Summary extends AbstractExtension {

    public static final String KIND = "Summary";
    @Schema(requiredMode = REQUIRED)
    private SummarySpec summarySpec;
    @Data
    public static class SummarySpec {
        @Schema(requiredMode = REQUIRED)
        private String postMetadataName;
        @Schema(requiredMode = REQUIRED)
        private String postUrl;
        @Schema(requiredMode = REQUIRED)
        private String postSummary;
    }
}
