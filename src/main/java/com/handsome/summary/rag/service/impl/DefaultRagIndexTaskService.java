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
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.Disposable;
import reactor.core.Disposables;
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
    private static final int MAX_INDEX_TASK_ATTEMPTS = 3;
    private static final Duration INDEX_RETRY_DELAY = Duration.ofSeconds(3);
    private static final Duration STALE_TASK_AFTER = Duration.ofMinutes(30);
    private static final Duration STALE_INDEX_WRITE_AFTER = Duration.ofMinutes(2);
    private static final String RAG_INDEX_TASK_TYPE = RagIndexTask.class.getName();
    private static final String LIFECYCLE_GUARD_VERSION = "rag-task-lifecycle-guard-v2";

    private final ReactiveExtensionClient client;
    private final RagIndexService ragIndexService;
    private volatile Disposable.Composite activeTasks = Disposables.composite();
    private final ConcurrentMap<String, Disposable> activeTaskDisposables =
        new ConcurrentHashMap<>();
    private final AtomicLong lifecycleVersion = new AtomicLong();
    private volatile boolean acceptingTasks = true;

    public synchronized void resumeRunningTasks() {
        acceptingTasks = true;
        if (activeTasks.isDisposed()) {
            activeTasks = Disposables.composite();
        }
        log.info("RAG index task lifecycle guard active: version={}, lifecycle={}",
            LIFECYCLE_GUARD_VERSION, lifecycleVersion.get());
    }

    public synchronized void disposeRunningTasks() {
        acceptingTasks = false;
        var lifecycle = lifecycleVersion.incrementAndGet();
        var tasks = activeTasks;
        if (tasks.size() > 0) {
            log.info("Disposing active RAG index tasks: version={}, lifecycle={}, count={}",
                LIFECYCLE_GUARD_VERSION, lifecycle, tasks.size());
        } else {
            log.info("RAG index task lifecycle stopped: version={}, lifecycle={}, count=0",
                LIFECYCLE_GUARD_VERSION, lifecycle);
        }
        tasks.dispose();
        activeTaskDisposables.clear();
        activeTasks = Disposables.composite();
    }

    @Override
    public Mono<RagIndexTask> startFullRebuild(String knowledgeBase) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        return Mono.defer(() -> {
            var lifecycle = lifecycleVersion.get();
            if (isTaskLifecycleStopped(lifecycle)) {
                return Mono.error(taskLifecycleStopped(kbName, null));
            }
            return runningTask(kbName)
                .switchIfEmpty(Mono.defer(() -> createTask(kbName,
                        RagIndexTask.TaskType.FULL_REBUILD, List.of())
                    .doOnNext(task -> runFullRebuild(lifecycle, task))));
        });
    }

    @Override
    public Mono<RagIndexTask> forceFullRebuild(String knowledgeBase) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        return Mono.defer(() -> {
            var lifecycle = lifecycleVersion.get();
            if (isTaskLifecycleStopped(lifecycle)) {
                return Mono.error(taskLifecycleStopped(kbName, null));
            }
            return runningTask(kbName)
                .flatMap(task -> cancelTask(task, "已强制停止旧索引任务，准备重新索引"))
                .then(Mono.defer(() -> createTask(kbName, RagIndexTask.TaskType.FULL_REBUILD,
                        List.of())
                    .doOnNext(task -> runFullRebuild(lifecycle, task))));
        });
    }

    @Override
    public Mono<RagIndexTask> forceStop(String knowledgeBase) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        return Mono.defer(() -> runningTask(kbName)
            .flatMap(task -> cancelTask(task, "已强制停止索引任务")));
    }

    @Override
    public Mono<RagIndexTask> startDocumentRebuild(String knowledgeBase, List<String> documentNames) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        var names = normalizedNames(documentNames);
        if (names.isEmpty()) {
            return Mono.error(new IllegalArgumentException("documentNames must not be empty"));
        }
        return Mono.defer(() -> {
            var lifecycle = lifecycleVersion.get();
            if (isTaskLifecycleStopped(lifecycle)) {
                return Mono.error(taskLifecycleStopped(kbName, null));
            }
            return runningTask(kbName)
                .switchIfEmpty(Mono.defer(() -> createTask(kbName,
                        RagIndexTask.TaskType.DOCUMENT_REBUILD, names)
                    .doOnNext(task -> runDocumentRebuild(lifecycle, task))));
        });
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

    private Mono<RagIndexTask> createTask(String knowledgeBase, RagIndexTask.TaskType taskType,
        List<String> documentNames) {
        var task = new RagIndexTask();
        var metadata = new Metadata();
        metadata.setName("rag-task-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT));
        task.setMetadata(metadata);
        var spec = new RagIndexTask.Spec();
        spec.setTaskType(taskType.name());
        spec.setKnowledgeBase(knowledgeBase);
        var names = normalizedNames(documentNames);
        spec.setDocumentNames(names);
        if (!names.isEmpty()) {
            spec.setDocumentName(names.getFirst());
        }
        task.setSpec(spec);
        var status = new RagIndexTask.Status();
        status.setPhase(RagIndexTask.Phase.QUEUED.name());
        status.setProgress(0);
        status.setMessage("等待执行");
        status.setAttempt(1);
        status.setMaxAttempts(MAX_INDEX_TASK_ATTEMPTS);
        task.setStatus(status);
        return client.create(task);
    }

    private void runFullRebuild(long lifecycle, RagIndexTask task) {
        log.info("RAG index task started: task={}, kb={}", task.getMetadata().getName(),
            task.getSpec().getKnowledgeBase());
        var taskName = task.getMetadata().getName();
        var pipeline = runWithAttempts(lifecycle, task, attempt -> updateTask(lifecycle, taskName,
                RagIndexTask.Phase.RUNNING, 5, attemptMessage(attempt, "开始重建索引"), null,
                null, attempt)
            .then(ragIndexService.rebuild(task.getSpec().getKnowledgeBase(),
                (progress, message) -> updateTask(lifecycle, taskName,
                    RagIndexTask.Phase.RUNNING, progress, attemptMessage(attempt, message),
                    null, null, attempt).then())))
            .doOnSuccess(summary -> log.info("RAG index task succeeded: task={}, kb={}, "
                    + "documents={}, chunks={}, durationMs={}",
                taskName, task.getSpec().getKnowledgeBase(),
                summary.getDocumentCount(), summary.getChunkCount(), summary.getDurationMillis()))
            .flatMap(summary -> updateTask(lifecycle, taskName,
                RagIndexTask.Phase.SUCCEEDED, 100, "索引重建完成", summary, null))
            .doOnError(error -> logIndexFailure("RAG index task failed", taskName,
                task.getSpec().getKnowledgeBase(), error))
            .onErrorResume(error -> {
                if (isLifecycleStop(error)) {
                    return Mono.error(error);
                }
                return updateTask(lifecycle, taskName,
                    RagIndexTask.Phase.FAILED, 100, terminalFailureMessage("索引重建失败", error),
                    null, error);
            })
            .subscribeOn(Schedulers.boundedElastic());
        subscribeTask(lifecycle, taskName, pipeline, "RAG index task failed unexpectedly");
    }

    private void runDocumentRebuild(long lifecycle, RagIndexTask task) {
        var documentNames = normalizedNames(task.getSpec() == null ? null
            : task.getSpec().getDocumentNames());
        log.info("RAG document index task started: task={}, kb={}, documents={}",
            task.getMetadata().getName(), task.getSpec().getKnowledgeBase(), documentNames.size());
        var taskName = task.getMetadata().getName();
        var pipeline = runWithAttempts(lifecycle, task, attempt -> updateTask(lifecycle, taskName,
                RagIndexTask.Phase.RUNNING, 5, attemptMessage(attempt, "开始增量索引"), null,
                null, attempt)
            .then(ragIndexService.indexDocuments(task.getSpec().getKnowledgeBase(), documentNames,
                (progress, message) -> updateTask(lifecycle, taskName,
                    RagIndexTask.Phase.RUNNING, progress, attemptMessage(attempt, message),
                    null, null, attempt).then())))
            .doOnSuccess(summary -> log.info("RAG document index task succeeded: task={}, kb={}, "
                    + "documents={}, chunks={}, durationMs={}",
                taskName, task.getSpec().getKnowledgeBase(),
                summary.getDocumentCount(), summary.getChunkCount(), summary.getDurationMillis()))
            .flatMap(summary -> updateTask(lifecycle, taskName,
                RagIndexTask.Phase.SUCCEEDED, 100, "增量索引完成", summary, null))
            .doOnError(error -> logIndexFailure("RAG document index task failed", taskName,
                task.getSpec().getKnowledgeBase(), error))
            .onErrorResume(error -> {
                if (isLifecycleStop(error)) {
                    return Mono.error(error);
                }
                return updateTask(lifecycle, taskName,
                    RagIndexTask.Phase.FAILED, 100, terminalFailureMessage("增量索引失败", error),
                    null, error);
            })
            .subscribeOn(Schedulers.boundedElastic());
        subscribeTask(lifecycle, taskName, pipeline,
            "RAG document index task failed unexpectedly");
    }

    private Mono<RagIndexTask> updateTask(String taskName, RagIndexTask.Phase phase, int progress,
        String message, RagIndexSummary summary, Throwable error) {
        return updateTask(lifecycleVersion.get(), taskName, phase, progress, message, summary,
            error, null);
    }

    private Mono<RagIndexTask> updateTask(long lifecycle, String taskName, RagIndexTask.Phase phase,
        int progress, String message, RagIndexSummary summary, Throwable error) {
        return updateTask(lifecycle, taskName, phase, progress, message, summary, error, null);
    }

    private Mono<RagIndexTask> updateTask(long lifecycle, String taskName, RagIndexTask.Phase phase,
        int progress, String message, RagIndexSummary summary, Throwable error, Integer attempt) {
        return Mono.defer(() -> {
            if (isTaskLifecycleStopped(lifecycle)) {
                return Mono.error(taskLifecycleStopped(taskName, null));
            }
            return client.fetch(RagIndexTask.class, taskName)
                .flatMap(task -> {
                    var status = task.getStatus() == null ? new RagIndexTask.Status()
                        : task.getStatus();
                    var now = Instant.now();
                    status.setPhase(phase.name());
                    status.setProgress(Math.max(0, Math.min(progress, 100)));
                    status.setMessage(message);
                    status.setMaxAttempts(MAX_INDEX_TASK_ATTEMPTS);
                    if (attempt != null) {
                        status.setAttempt(Math.max(1, Math.min(attempt,
                            MAX_INDEX_TASK_ATTEMPTS)));
                    }
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
                });
        })
            .onErrorResume(updateError -> {
                if (isLifecycleStop(updateError) || isTaskLifecycleStopped(lifecycle)) {
                    log.info("RAG index task update stopped by lifecycle guard: version={}, "
                            + "task={}, lifecycle={}, currentLifecycle={}, acceptingTasks={}, "
                            + "reason={}",
                        LIFECYCLE_GUARD_VERSION, taskName, lifecycle, lifecycleVersion.get(),
                        acceptingTasks, errorMessage(updateError));
                    return Mono.error(taskLifecycleStopped(taskName, updateError));
                }
                log.warn("Failed to update RAG index task after lifecycle guard check: "
                        + "version={}, task={}, lifecycle={}, currentLifecycle={}, "
                        + "acceptingTasks={}, lifecycleStopMatched=false",
                    LIFECYCLE_GUARD_VERSION, taskName, lifecycle, lifecycleVersion.get(),
                    acceptingTasks, updateError);
                return Mono.error(updateError);
            });
    }

    private Mono<RagIndexSummary> runWithAttempts(long lifecycle, RagIndexTask task,
        Function<Integer, Mono<RagIndexSummary>> attemptRunner) {
        return runAttempt(lifecycle, task, attemptRunner, 1);
    }

    private Mono<RagIndexSummary> runAttempt(long lifecycle, RagIndexTask task,
        Function<Integer, Mono<RagIndexSummary>> attemptRunner, int attempt) {
        return attemptRunner.apply(attempt)
            .onErrorResume(error -> {
                if (isLifecycleStop(error) || isTaskLifecycleStopped(lifecycle)) {
                    return Mono.error(taskLifecycleStopped(task.getMetadata().getName(), error));
                }
                if (isNonRetryableIndexError(error)) {
                    log.warn("RAG index task failed with non-retryable error, will not retry: "
                            + "task={}, attempt={}/{}",
                        task.getMetadata().getName(), attempt, MAX_INDEX_TASK_ATTEMPTS, error);
                    return Mono.error(error);
                }
                if (attempt >= MAX_INDEX_TASK_ATTEMPTS) {
                    return Mono.error(error);
                }
                var nextAttempt = attempt + 1;
                var taskName = task.getMetadata().getName();
                log.warn("RAG index task attempt failed, will retry: task={}, attempt={}/{}",
                    taskName, attempt, MAX_INDEX_TASK_ATTEMPTS, error);
                var message = "索引失败，准备第 %d/%d 次尝试：%s"
                    .formatted(nextAttempt, MAX_INDEX_TASK_ATTEMPTS, errorMessage(error));
                return updateTask(lifecycle, taskName, RagIndexTask.Phase.RUNNING, 5, message,
                        null, error, nextAttempt)
                    .then(Mono.delay(INDEX_RETRY_DELAY))
                    .then(runAttempt(lifecycle, task, attemptRunner, nextAttempt));
            });
    }

    private Mono<RagIndexTask> cancelTask(RagIndexTask task, String message) {
        var taskName = task.getMetadata().getName();
        var disposable = activeTaskDisposables.remove(taskName);
        if (disposable != null && !disposable.isDisposed()) {
            log.info("Disposing RAG index task by force: task={}, kb={}", taskName,
                task.getSpec() == null ? null : task.getSpec().getKnowledgeBase());
            disposable.dispose();
        }
        return updateTask(taskName, RagIndexTask.Phase.CANCELED, currentProgress(task), message,
            null, new CancellationException(message));
    }

    private synchronized void subscribeTask(long lifecycle, String taskName,
        Mono<RagIndexTask> pipeline, String errorMessage) {
        if (isTaskLifecycleStopped(lifecycle)) {
            log.info("RAG index task was not started because plugin lifecycle is stopping");
            return;
        }
        var disposableRef = new AtomicReference<Disposable>();
        var disposable = pipeline
            .doFinally(signalType -> {
                var current = disposableRef.get();
                if (current != null) {
                    activeTaskDisposables.remove(taskName, current);
                    activeTasks.remove(current);
                } else {
                    activeTaskDisposables.remove(taskName);
                }
            })
            .subscribe(ignored -> {
            },
            error -> {
                if (isLifecycleStop(error)) {
                    log.info("RAG index task stopped: {}", this.errorMessage(error));
                    return;
                }
                log.error(errorMessage, error);
            });
        disposableRef.set(disposable);
        activeTaskDisposables.put(taskName, disposable);
        if (disposable.isDisposed()) {
            activeTaskDisposables.remove(taskName, disposable);
        }
        if (!activeTasks.add(disposable)) {
            activeTaskDisposables.remove(taskName, disposable);
            disposable.dispose();
        }
    }

    private void logIndexFailure(String logMessage, String taskName, String knowledgeBase,
        Throwable error) {
        if (isLifecycleStop(error)) {
            log.info("{} because plugin lifecycle stopped: task={}, kb={}, reason={}", logMessage,
                taskName, knowledgeBase, errorMessage(error));
            return;
        }
        log.error("{}: task={}, kb={}", logMessage, taskName, knowledgeBase, error);
    }

    private boolean isTaskLifecycleStopped(long lifecycle) {
        return !acceptingTasks || lifecycle != lifecycleVersion.get();
    }

    private boolean isLifecycleStop(Throwable error) {
        return containsCause(error, CancellationException.class)
            || isExtensionIndexUnavailable(error);
    }

    private boolean isExtensionIndexUnavailable(Throwable error) {
        return containsErrorText(error, "No indices found for type: " + RAG_INDEX_TASK_TYPE)
            || containsErrorText(error, "No scheme found for type: " + RAG_INDEX_TASK_TYPE)
            || containsErrorText(error, "Scheme not found for type: " + RAG_INDEX_TASK_TYPE)
            || (containsErrorText(error, "RagIndexTask")
            && (containsErrorText(error, "No indices found")
            || containsErrorText(error, "No index found")
            || containsErrorText(error, "No scheme found")
            || containsErrorText(error, "Scheme not found")));
    }

    private boolean containsCause(Throwable error, Class<? extends Throwable> causeType) {
        var current = error;
        while (current != null) {
            if (causeType.isInstance(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private boolean containsErrorText(Throwable error, String fragment) {
        var current = error;
        while (current != null) {
            var message = current.getMessage();
            if (message != null && message.contains(fragment)) {
                return true;
            }
            if (String.valueOf(current).contains(fragment)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private TaskLifecycleStoppedException taskLifecycleStopped(String taskName, Throwable cause) {
        var message = "RAG index task lifecycle stopped: task=%s".formatted(taskName);
        return new TaskLifecycleStoppedException(message, cause);
    }

    private String attemptMessage(int attempt, String message) {
        return "第 %d/%d 次尝试：%s".formatted(attempt, MAX_INDEX_TASK_ATTEMPTS, message);
    }

    private String finalFailureMessage(String message) {
        return "%s，已尝试 %d 次，任务已停止".formatted(message, MAX_INDEX_TASK_ATTEMPTS);
    }

    private String terminalFailureMessage(String message, Throwable error) {
        if (isNonRetryableIndexError(error)) {
            return "%s：%s，任务已停止".formatted(message, nonRetryableIndexErrorMessage(error));
        }
        return finalFailureMessage(message);
    }

    private boolean isNonRetryableIndexError(Throwable error) {
        if (!containsErrorText(error, "embedding request failed")
            && !containsErrorText(error, "UnsupportedModel")
            && !containsErrorText(error, "UnsupportedModelCapability")) {
            return false;
        }
        return containsErrorText(error, "UnsupportedModel")
            || containsErrorText(error, "UnsupportedModelCapability")
            || containsErrorText(error, "status=400")
            || containsErrorText(error, "status=401")
            || containsErrorText(error, "status=403")
            || containsErrorText(error, "status=404");
    }

    private String nonRetryableIndexErrorMessage(Throwable error) {
        if (containsErrorText(error, "UnsupportedModel")) {
            return "知识库 Embedding 模型不支持当前请求，请选择真正的 Embedding 模型后重试";
        }
        if (containsErrorText(error, "status=401") || containsErrorText(error, "status=403")) {
            return "知识库 Embedding 认证失败，请检查 API Key、模型权限和供应商配置后重试";
        }
        if (containsErrorText(error, "status=404")) {
            return "知识库 Embedding 模型或接口不存在，请检查模型名称和 Embedding endpoint 后重试";
        }
        return "知识库 Embedding 请求参数不被当前模型接受，请检查模型能力和 RAG 配置后重试";
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

    private List<String> normalizedNames(List<String> names) {
        if (names == null) {
            return List.of();
        }
        return names.stream()
            .filter(StringUtils::hasText)
            .map(String::strip)
            .distinct()
            .toList();
    }

    private String errorMessage(Throwable error) {
        if (error == null) {
            return "Unknown error";
        }
        var current = error;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return StringUtils.hasText(current.getMessage()) ? current.getMessage() : current.toString();
    }

    private static final class TaskLifecycleStoppedException extends CancellationException {

        private TaskLifecycleStoppedException(String message, Throwable cause) {
            super(message);
            if (cause != null) {
                initCause(cause);
            }
        }
    }
}
