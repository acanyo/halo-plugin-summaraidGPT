package com.handsome.summary.annotation;

import com.handsome.summary.annotation.PostProcess;
import com.handsome.summary.annotation.PostProcess.Phase;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
@Slf4j
public class PostProcessAspect {

    private final Map<Phase, CompletableFuture<Object>> phaseResults = new ConcurrentHashMap<>();

    @Around("@annotation(postProcess)")
    public Object handlePostProcess(ProceedingJoinPoint joinPoint, PostProcess postProcess) throws Throwable {
        Phase currentPhase = postProcess.phase();  // 使用导入的 Phase
        String methodName = joinPoint.getSignature().getName();

        try {
            if (currentPhase == Phase.HANDLE) {  // 使用导入的 Phase
                log.debug("执行处理阶段: {}", methodName);
                Object result = joinPoint.proceed();
                CompletableFuture<Object> future = new CompletableFuture<>();
                phaseResults.put(Phase.HANDLE, future);  // 使用导入的 Phase

                if (result instanceof Mono) {
                    return ((Mono<?>) result)
                        .doOnSuccess(value -> {
                            future.complete(value);
                            log.debug("处理阶段完成: {}", methodName);
                        })
                        .doOnError(error -> {
                            future.completeExceptionally(error);
                            log.error("处理阶段失败: {}", methodName, error);
                        });
                } else {
                    future.complete(result);
                    return result;
                }
            } else {
                log.debug("执行处理后阶段: {}", methodName);
                CompletableFuture<Object> handleFuture = phaseResults.get(Phase.HANDLE);  // 使用导入的 Phase

                if (handleFuture == null || !handleFuture.isDone()) {
                    String error = "Handle phase not completed before processing";
                    log.error(error);
                    throw new IllegalStateException(error);
                }

                if (handleFuture.isCompletedExceptionally()) {
                    String error = "Handle phase completed with error";
                    log.error(error);
                    throw new IllegalStateException(error);
                }

                return joinPoint.proceed();
            }
        } catch (Exception e) {
            log.error("PostProcess execution failed: {}", methodName, e);
            throw e;
        }
    }

    @AfterReturning("@annotation(postProcess)")
    public void cleanup(PostProcess postProcess) {
        if (postProcess.phase() == Phase.PROCESS) {  // 使用导入的 Phase
            phaseResults.clear();
            log.debug("清理阶段结果完成");
        }
    }
}