package com.handsome.summary.service.impl;

import static run.halo.app.extension.MetadataUtil.nullSafeAnnotations;
import static run.halo.app.extension.index.query.Queries.and;
import static run.halo.app.extension.index.query.Queries.equal;
import static run.halo.app.extension.index.query.Queries.isNull;


import com.handsome.summary.extension.Summary;
import com.handsome.summary.service.AiConfigService;
import com.handsome.summary.service.AiServiceUtils;

import com.handsome.summary.service.ArticleSummaryService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.router.selector.FieldSelector;
import reactor.core.scheduler.Schedulers;

/**
 * 文章摘要服务实现类
 * 负责文章摘要的生成、存储和更新，支持多种AI服务提供商。
 * @author handsome
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleSummaryServiceImpl implements ArticleSummaryService {

    // 依赖注入
    private final AiConfigService aiConfigService;
    private final PostContentService postContentService;
    private final ReactiveExtensionClient client;

    // 常量定义
    public static final String AI_SUMMARY_UPDATED = "summary.lik.cc/ai-summary-updated";
    public static final String ENABLE_BLACK_LIST = "summary.xhhao.com/enable-black-list";
    public static final String UPDATE_SUMMARY = "summary.xhhao.com/update-summary";
    public static final String DEFAULT_AI_SYSTEM_PROMPT = "你是专业摘要助手，请为以下文章生成简明摘要：";
    public static final String DEFAULT_SUMMARY_ERROR_MESSAGE = "文章摘要生成异常：";

    // 进度状态变量
    private final java.util.concurrent.atomic.AtomicInteger total = new java.util.concurrent.atomic.AtomicInteger();
    private final java.util.concurrent.atomic.AtomicInteger finished = new java.util.concurrent.atomic.AtomicInteger();

    /**
     * 获取指定文章的AI摘要
     * 
     * @param post 文章对象
     * @return 摘要内容
     */
    @Override
    public Mono<String> getSummary(Post post) {
        return Mono.zip(
                aiConfigService.getAiConfigForFunction("summary"),
                aiConfigService.getAiServiceForFunction("summary")
        )
        .flatMap(tuple -> generateSummaryWithAiConfig(post, tuple.getT1(), tuple.getT2()))
        .map(AiServiceUtils::extractContentFromResponse)
        .flatMap(summary -> {
            // 检查是否是错误信息，如果是则不保存到数据库
            if (AiServiceUtils.isErrorMessage(summary)) {
                return Mono.error(new RuntimeException(summary));
            }
            return saveSummaryToDatabase(summary, post).thenReturn(summary);
        })
        .onErrorResume(this::handleSummaryGenerationError);
    }

    /**
     * 根据文章名称查询摘要
     * @param postMetadataName 文章元数据名称
     * @return 摘要列表
     */
    @Override
    public Flux<Summary> findSummaryByPostName(String postMetadataName) {
        var listOptions = new ListOptions();
        listOptions.setFieldSelector(FieldSelector.of(
            and(equal("summarySpec.postMetadataName", postMetadataName),
                isNull("summarySpec.postSummary").not())
        ));
        return client.listAll(Summary.class, listOptions, Sort.unsorted());
    }

    /**
     * 更新文章内容并返回摘要信息
     * @param postMetadataName 文章元数据名称
     * @return 更新结果
     */
    @Override
    public Mono<Map<String, Object>> updatePostContentWithSummary(String postMetadataName) {
        return findSummaryByPostName(postMetadataName)
            .hasElements()
            .flatMap(hasElements -> {
                if (!hasElements) {
                    log.info("未找到摘要数据，文章: {}", postMetadataName);
                    return Mono.just(buildResponse(false, "未找到摘要内容", "未找到摘要内容", false));
                }
                return processUpdateRequest(postMetadataName);
            })
            .onErrorResume(e -> handleUpdateError(e, postMetadataName));
    }

    @Override
    public Mono<Void> syncAllSummariesAsync() {
        total.set(0);
        finished.set(0);
        return client.listAll(Post.class, new ListOptions(), Sort.unsorted())
            .doOnNext(post -> total.incrementAndGet())
            .filter(post -> {
                var annotations = nullSafeAnnotations(post);
                var newPostNotified = annotations.getOrDefault(AI_SUMMARY_UPDATED, "false");
                return Objects.equals(newPostNotified, "false");
            })
            .flatMap(post -> {
                log.info("开始摘要同步，文章: {}", post.getMetadata().getName());
                return getSummary(post)
                    .doOnSuccess(s -> finished.incrementAndGet())
                    .onErrorResume(e -> {
                        log.error("摘要同步失败，文章: {}，错误: {}", post.getMetadata().getName(), e.getMessage());
                        finished.incrementAndGet();
                        return Mono.empty();
                    });
            }, 3) // 并发数
            .subscribeOn(Schedulers.boundedElastic()) // 在后台线程池执行
            .then();
    }

    @Override
    public Mono<Map<String, Integer>> getSyncProgress() {
        Map<String, Integer> progress = new HashMap<>();
        progress.put("total", total.get());
        progress.put("finished", finished.get());
        return Mono.just(progress);
    }

    /**
     * 使用新的AI配置生成摘要
     */
    private Mono<String> generateSummaryWithAiConfig(Post post, SettingConfigGetter.AiConfigResult aiConfig, 
                                                    com.handsome.summary.service.AiService aiService) {
        return postContentService.getReleaseContent(post.getMetadata().getName())
            .flatMap(contentWrapper -> {
                String aiSystem = aiConfig.getSystemPrompt() != null ? aiConfig.getSystemPrompt() : DEFAULT_AI_SYSTEM_PROMPT;
                String prompt = aiSystem + "\n" + contentWrapper.getRaw();
                
                log.info("开始生成摘要，AI类型: {}, 文章: {}", aiConfig.getAiType(), post.getMetadata().getName());
                
                // 创建兼容的BasicConfig
                var compatibleConfig = aiConfigService.createCompatibleBasicConfig(aiConfig);
                return Mono.fromCallable(() -> aiService.chatCompletionRaw(prompt, compatibleConfig));
            });
    }


    


    /**
     * 保存摘要到数据库
     */
    private Mono<Void> saveSummaryToDatabase(String summary, Post post) {
        String postMetadataName = post.getMetadata().getName();
        var summaryFlux = findSummaryByPostName(postMetadataName);
        
        return summaryFlux
            .collectList()
            .flatMap(list -> {
                if (!list.isEmpty()) {
                    return updateExistingSummary(list.getFirst(), summary, postMetadataName);
                } else {
                    return createNewSummary(summary, post, postMetadataName);
                }
            });
    }

    /**
     * 更新现有摘要
     */
    private Mono<Void> updateExistingSummary(Summary existing, String summary, String postMetadataName) {
        existing.getSummarySpec().setPostSummary(summary);
        return client.update(existing)
            .doOnSuccess(s -> log.info("摘要已更新到数据库，文章: {}", postMetadataName))
            .doOnError(e -> log.error("更新摘要到数据库失败，文章: {}, 错误: {}", postMetadataName, e.getMessage(), e))
            .then();
    }

    /**
     * 创建新摘要
     */
    private Mono<Void> createNewSummary(String summary, Post post, String postMetadataName) {
        Summary summaryEntity = new Summary();
        summaryEntity.setMetadata(new Metadata());
        summaryEntity.getMetadata().setGenerateName("summary-");
        
        Summary.SummarySpec summarySpec = new Summary.SummarySpec();
        summarySpec.setPostSummary(summary);
        summarySpec.setPostMetadataName(postMetadataName);
        summarySpec.setPostUrl(post.getStatus().getPermalink());
        summaryEntity.setSummarySpec(summarySpec);
        
        return client.create(summaryEntity)
            .doOnSuccess(s -> log.info("摘要已保存到数据库，文章: {}", postMetadataName))
            .doOnError(e -> log.error("保存摘要到数据库失败，文章: {}, 错误: {}", postMetadataName, e.getMessage(), e))
            .then();
    }

    /**
     * 处理摘要生成错误
     */
    private Mono<String> handleSummaryGenerationError(Throwable e) {
        log.error("摘要生成失败: {}", e.getMessage(), e);
        return Mono.just(DEFAULT_SUMMARY_ERROR_MESSAGE + e.getMessage());
    }

    /**
     * 处理更新请求
     */
    private Mono<Map<String, Object>> processUpdateRequest(String postMetadataName) {
        return findSummaryByPostName(postMetadataName)
            .next()
            .flatMap(summary -> {
                String summaryContent = summary.getSummarySpec().getPostSummary();
                log.info("找到摘要内容，文章: {}, 长度: {}", postMetadataName, 
                    summaryContent != null ? summaryContent.length() : 0);
                
                return client.fetch(Post.class, postMetadataName)
                    .flatMap(post -> updatePostWithSummary(post, summaryContent, postMetadataName))
                    .onErrorResume(e -> handlePostUpdateError(e, summaryContent));
            });
    }

    /**
     * 处理文章更新错误
     */
    private Mono<Map<String, Object>> handlePostUpdateError(Throwable e, String summaryContent) {
        log.error("更新文章摘要时发生错误: {}", e.getMessage(), e);
        return Mono.just(buildResponse(false, "更新文章摘要时发生错误: " + e.getMessage(), summaryContent, false));
    }

    /**
     * 处理更新操作错误
     */
    private Mono<Map<String, Object>> handleUpdateError(Throwable e, String postMetadataName) {
        log.error("更新操作异常，文章: {}, 错误: {}", postMetadataName, e.getMessage(), e);
        return Mono.just(buildResponse(false, "未找到摘要内容", "未找到摘要内容", false));
    }

    /**
     * 更新文章摘要
     */
    private Mono<Map<String, Object>> updatePostWithSummary(Post post, String summaryContent, String postMetadataName) {
        log.info("开始更新文章摘要，文章: {}, 摘要长度: {}", postMetadataName, 
            summaryContent != null ? summaryContent.length() : 0);
        
        var annotations = nullSafeAnnotations(post);
        boolean blackList = Boolean.parseBoolean(annotations.getOrDefault(ENABLE_BLACK_LIST, "false"));
        
        // 黑名单检查
        if (blackList) {
            log.info("文章在黑名单中，跳过更新，文章: {}", postMetadataName);
            return Mono.just(buildResponse(false, "文章在黑名单中，不进行摘要更新", summaryContent, true));
        }
        
        // 手动更新摘要检查（用户手动设置后不再覆盖）
        boolean manualUpdate = Boolean.parseBoolean(annotations.getOrDefault(UPDATE_SUMMARY, "false"));
        if (manualUpdate) {
            log.info("文章已手动更新摘要，跳过AI更新，文章: {}", postMetadataName);
            return Mono.just(buildResponse(false, "文章已手动更新摘要，跳过AI更新", summaryContent, false));
        }
        
        // 获取当前文章的摘要内容
        String currentSummary = post.getSpec().getExcerpt().getRaw();
        log.info("当前文章摘要: [{}], 新生成摘要: [{}]", 
            currentSummary != null ? currentSummary : "暂无摘要", 
            summaryContent != null ? summaryContent : "暂无摘要");
        
        // 检查摘要内容是否发生变化
        boolean summaryChanged = !Objects.equals(currentSummary, summaryContent);
        
        if (!summaryChanged) {
            log.info("文章摘要内容未发生变化，跳过更新，文章: {}", postMetadataName);
            return Mono.just(buildResponse(false, "摘要内容未发生变化，无需更新", summaryContent, false));
        }
        
        log.info("文章摘要内容发生变化，执行更新，文章: {}", postMetadataName);
        return performPostUpdate(post, summaryContent, postMetadataName, annotations);
    }

    /**
     * 执行文章更新
     */
    private Mono<Map<String, Object>> performPostUpdate(Post post, String summaryContent, 
                                                       String postMetadataName, Map<String, String> annotations) {
        // 更新文章摘要
        post.getSpec().getExcerpt().setRaw(summaryContent);
        post.getSpec().getExcerpt().setAutoGenerate(false);
        post.getStatus().setExcerpt(summaryContent);
        annotations.put(AI_SUMMARY_UPDATED, "true");
        
        return client.update(post)
            .doOnSuccess(p -> log.info("已将摘要写入文章正文，文章: {}", postMetadataName))
            .then(Mono.just(buildResponse(true, "成功", summaryContent, false)));
    }

    /**
     * 构建统一的响应结果
     */
    private Map<String, Object> buildResponse(boolean success, String message, String summaryContent, boolean blackList) {
        log.debug("构建响应 - success: {}, message: {}, summaryContent长度: {}, blackList: {}", 
            success, message, summaryContent != null ? summaryContent.length() : 0, blackList);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("summaryContent", summaryContent != null ? summaryContent : "");
        response.put("blackList", blackList);
        
        return response;
    }
} 