package com.handsome.summary.rag.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.rag.extension.RagIndexTask;
import com.handsome.summary.rag.model.RagIndexSummary;
import com.handsome.summary.rag.service.RagIndexService;
import com.handsome.summary.rag.service.RagIndexTaskService;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultRagIndexTaskService implements RagIndexTaskService {

    private static final int DEFAULT_LIMIT = 20;
    private static final Duration STALE_TASK_AFTER = Duration.ofMinutes(30);
    private static final Duration STALE_INDEX_WRITE_AFTER = Duration.ofMinutes(2);

    private final ReactiveExtensionClient client;
    private final RagIndexService ragIndexService;

    @Override
    public Mono<RagIndexTask> startFullRebuild(String knowledgeBase) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        return runningTask(kbName)
            .switchIfEmpty(Mono.defer(() -> createTask(kbName)
                .doOnNext(this::runFullRebuild)));
    }

    @Override
    public Mono<RagIndexTask> get(String name) {
        return client.fetch(RagIndexTask.class, name)
            .flatMap(this::refreshStaleTask);
    }

    @Override
    public Mono<RagIndexTask> latest(String knowledgeBase) {
        return list(knowledgeBase, 1)
            .next()
            .flatMap(this::refreshStaleTask);
    }

    @Override
    public Flux<RagIndexTask> list(String knowledgeBase, int limit) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        var options = ListOptions.builder()
            .fieldQuery(equal("spec.knowledgeBase", kbName))
            .build();
        return client.listAll(RagIndexTask.class, options, Sort.unsorted())
            .sort(Comparator.comparing(this::createdAt).reversed())
            .take(Math.max(1, Math.min(limit, 100)));
    }

    private Mono<RagIndexTask> runningTask(String knowledgeBase) {
        var options = ListOptions.builder()
            .fieldQuery(equal("spec.knowledgeBase", knowledgeBase))
            .build();
        return client.listAll(RagIndexTask.class, options, Sort.unsorted())
            .filter(this::isRunning)
            .sort(Comparator.comparing(this::createdAt).reversed())
            .concatMap(this::refreshStaleTask)
            .filter(this::isRunning)
            .next();
    }

    private Mono<RagIndexTask> createTask(String knowledgeBase) {
        var task = new RagIndexTask();
        var metadata = new Metadata();
        metadata.setName("rag-task-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT));
        task.setMetadata(metadata);
        var spec = new RagIndexTask.Spec();
        spec.setTaskType(RagIndexTask.TaskType.FULL_REBUILD.name());
        spec.setKnowledgeBase(knowledgeBase);
        task.setSpec(spec);
        var status = new RagIndexTask.Status();
        status.setPhase(RagIndexTask.Phase.QUEUED.name());
        status.setProgress(0);
        status.setMessage("等待执行");
        task.setStatus(status);
        return client.create(task);
    }

    private void runFullRebuild(RagIndexTask task) {
        log.info("RAG index task started: task={}, kb={}", task.getMetadata().getName(),
            task.getSpec().getKnowledgeBase());
        updateTask(task.getMetadata().getName(), RagIndexTask.Phase.RUNNING, 5,
                "开始重建索引", null, null)
            .then(ragIndexService.rebuild(task.getSpec().getKnowledgeBase(),
                (progress, message) -> updateTask(task.getMetadata().getName(),
                    RagIndexTask.Phase.RUNNING, progress, message, null, null).then()))
            .doOnSuccess(summary -> log.info("RAG index task succeeded: task={}, kb={}, "
                    + "documents={}, chunks={}, durationMs={}",
                task.getMetadata().getName(), task.getSpec().getKnowledgeBase(),
                summary.getDocumentCount(), summary.getChunkCount(), summary.getDurationMillis()))
            .flatMap(summary -> updateTask(task.getMetadata().getName(),
                RagIndexTask.Phase.SUCCEEDED, 100, "索引重建完成", summary, null))
            .doOnError(error -> log.error("RAG index task failed: task={}, kb={}",
                task.getMetadata().getName(), task.getSpec().getKnowledgeBase(), error))
            .onErrorResume(error -> updateTask(task.getMetadata().getName(),
                RagIndexTask.Phase.FAILED, 100, "索引重建失败", null, error))
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe(
                ignored -> {
                },
                error -> log.error("RAG index task failed unexpectedly", error)
            );
    }

    private Mono<RagIndexTask> updateTask(String taskName, RagIndexTask.Phase phase, int progress,
        String message, RagIndexSummary summary, Throwable error) {
        return client.fetch(RagIndexTask.class, taskName)
            .flatMap(task -> {
                var status = task.getStatus() == null ? new RagIndexTask.Status() : task.getStatus();
                var now = Instant.now();
                status.setPhase(phase.name());
                status.setProgress(Math.max(0, Math.min(progress, 100)));
                status.setMessage(message);
                if (RagIndexTask.Phase.RUNNING.equals(phase) && status.getStartedAt() == null) {
                    status.setStartedAt(now);
                }
                status.setLastUpdatedAt(now);
                if (RagIndexTask.Phase.SUCCEEDED.equals(phase)
                    || RagIndexTask.Phase.FAILED.equals(phase)
                    || RagIndexTask.Phase.CANCELED.equals(phase)) {
                    status.setCompletedAt(now);
                }
                if (summary != null) {
                    status.setSummary(summary);
                }
                status.setErrorMessage(error == null ? null : errorMessage(error));
                task.setStatus(status);
                return client.update(task);
            })
            .onErrorResume(updateError -> {
                log.warn("Failed to update RAG index task: {}", taskName, updateError);
                return Mono.empty();
            });
    }

    private Mono<RagIndexTask> refreshStaleTask(RagIndexTask task) {
        if (!isRunning(task) || !isStale(task)) {
            return Mono.just(task);
        }
        var taskName = task.getMetadata().getName();
        var progress = currentProgress(task);
        var message = progress >= 75
            ? "写入 Lucene 向量索引长时间无进展，已自动标记失败，可重新重建索引"
            : "索引任务长时间无进展，已自动标记失败，可重新重建索引";
        log.warn("RAG index task is stale, refreshing terminal state: task={}, kb={}, progress={}",
            taskName, task.getSpec() == null ? null : task.getSpec().getKnowledgeBase(),
            progress);
        if (progress >= 75) {
            return completeFromKnowledgeBaseStatus(task)
                .switchIfEmpty(updateTask(taskName, RagIndexTask.Phase.FAILED, 100, message, null,
                    new IllegalStateException(message)));
        }
        return updateTask(taskName, RagIndexTask.Phase.FAILED, 100, message, null,
            new IllegalStateException(message));
    }

    private Mono<RagIndexTask> completeFromKnowledgeBaseStatus(RagIndexTask task) {
        var knowledgeBase = normalizeKnowledgeBase(task.getSpec() == null ? null
            : task.getSpec().getKnowledgeBase());
        return client.fetch(RagKnowledgeBase.class, knowledgeBase)
            .filter(this::indexFinished)
            .flatMap(kb -> {
                var status = kb.getStatus();
                var summary = RagIndexSummary.builder()
                    .documentCount(defaultInt(status.getDocumentCount()))
                    .chunkCount(defaultInt(status.getChunkCount()))
                    .embeddingDimensions(defaultInt(status.getEmbeddingDimensions()))
                    .indexVersion(status.getIndexVersion())
                    .durationMillis(status.getIndexDurationMillis() == null ? 0
                        : status.getIndexDurationMillis())
                    .build();
                log.info("RAG index task stale but knowledge base is ready, marking succeeded: "
                        + "task={}, kb={}",
                    task.getMetadata().getName(), knowledgeBase);
                return updateTask(task.getMetadata().getName(), RagIndexTask.Phase.SUCCEEDED,
                    100, "索引重建完成", summary, null);
            });
    }

    private boolean isRunning(RagIndexTask task) {
        var phase = task.getStatus() == null ? null : task.getStatus().getPhase();
        return RagIndexTask.Phase.QUEUED.name().equals(phase)
            || RagIndexTask.Phase.RUNNING.name().equals(phase);
    }

    private boolean isStale(RagIndexTask task) {
        var heartbeatAt = heartbeatAt(task);
        if (heartbeatAt == null) {
            return false;
        }
        var threshold = currentProgress(task) >= 75 ? STALE_INDEX_WRITE_AFTER : STALE_TASK_AFTER;
        return heartbeatAt.plus(threshold).isBefore(Instant.now());
    }

    private Instant heartbeatAt(RagIndexTask task) {
        var status = task.getStatus();
        if (status != null && status.getLastUpdatedAt() != null) {
            return status.getLastUpdatedAt();
        }
        if (status != null && status.getStartedAt() != null) {
            return status.getStartedAt();
        }
        return createdAt(task);
    }

    private int currentProgress(RagIndexTask task) {
        var progress = task.getStatus() == null ? null : task.getStatus().getProgress();
        return progress == null ? 0 : Math.max(0, Math.min(progress, 100));
    }

    private boolean indexFinished(RagKnowledgeBase knowledgeBase) {
        var state = knowledgeBase.getStatus() == null ? null
            : knowledgeBase.getStatus().getIndexState();
        return RagKnowledgeBase.IndexState.READY.name().equals(state)
            || RagKnowledgeBase.IndexState.EMPTY.name().equals(state);
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Instant createdAt(RagIndexTask task) {
        var metadata = task.getMetadata();
        return metadata == null || metadata.getCreationTimestamp() == null
            ? Instant.EPOCH
            : metadata.getCreationTimestamp();
    }

    private String normalizeKnowledgeBase(String knowledgeBase) {
        return StringUtils.hasText(knowledgeBase) ? knowledgeBase.strip()
            : RagIndexService.DEFAULT_KNOWLEDGE_BASE;
    }

    private String errorMessage(Throwable error) {
        var current = error;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return StringUtils.hasText(current.getMessage()) ? current.getMessage() : current.toString();
    }
}
