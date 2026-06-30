package com.handsome.summary.ai.extension;

import static com.handsome.summary.ai.extension.AiCallLog.KIND;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.Map;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import run.halo.app.core.extension.content.Constant;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@ToString(callSuper = true)
@GVK(kind = KIND, group = "summaraidgpt.lik.cc",
    version = Constant.VERSION, singular = "aicalllog", plural = "aicalllogs")
@EqualsAndHashCode(callSuper = true)
public class AiCallLog extends AbstractExtension {

    public static final String KIND = "AiCallLog";

    private Spec spec;

    @Data
    public static class Spec {
        @Schema(description = "AI provider name")
        private String provider = "AI Foundation";

        @Schema(description = "Operation name, such as rag-embed-values")
        private String operation;

        @Schema(description = "Model type, such as language, embedding, rerank")
        private String modelType;

        @Schema(description = "AiModel metadata.name or <default>")
        private String modelName;

        @Schema(description = "Whether the call completed successfully")
        private Boolean success;

        @Schema(description = "Call start time")
        private Instant startedAt;

        @Schema(description = "Duration in milliseconds")
        private Long durationMillis;

        @Schema(description = "Input item count")
        private Integer inputCount;

        @Schema(description = "Total input characters")
        private Long inputChars;

        @Schema(description = "Max input item characters")
        private Integer maxInputChars;

        @Schema(description = "Output item count")
        private Integer outputCount;

        @Schema(description = "Total output characters")
        private Long outputChars;

        @Schema(description = "Max output item characters")
        private Integer maxOutputChars;

        @Schema(description = "Candidate count for rerank/RAG calls")
        private Integer candidateCount;

        @Schema(description = "Source count for RAG generation calls")
        private Integer sourceCount;

        @Schema(description = "Error class simple name")
        private String errorType;

        @Schema(description = "Sanitized root error message")
        private String errorMessage;

        @Schema(description = "Additional non-sensitive diagnostics")
        private Map<String, String> metadata;
    }
}
