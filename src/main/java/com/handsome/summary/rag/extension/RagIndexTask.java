package com.handsome.summary.rag.extension;

import static com.handsome.summary.rag.extension.RagIndexTask.KIND;

import com.handsome.summary.rag.model.RagIndexSummary;
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
    version = Constant.VERSION, singular = "ragindextask", plural = "ragindextasks")
@EqualsAndHashCode(callSuper = true)
public class RagIndexTask extends AbstractExtension {

    public static final String KIND = "RagIndexTask";

    private Spec spec;

    private Status status;

    @Data
    public static class Spec {
        @Schema(description = "Task type")
        private String taskType = TaskType.FULL_REBUILD.name();

        @Schema(description = "Knowledge base metadata.name")
        private String knowledgeBase;

        @Schema(description = "Optional document metadata.name")
        private String documentName;
    }

    @Data
    public static class Status {
        private String phase = Phase.QUEUED.name();
        private Integer progress = 0;
        private String message;
        private RagIndexSummary summary;
        private String errorMessage;
        private Instant startedAt;
        private Instant lastUpdatedAt;
        private Instant completedAt;
    }

    public enum TaskType {
        FULL_REBUILD,
        DOCUMENT_REBUILD,
        DELETE
    }

    public enum Phase {
        QUEUED,
        RUNNING,
        SUCCEEDED,
        FAILED,
        CANCELED
    }
}
