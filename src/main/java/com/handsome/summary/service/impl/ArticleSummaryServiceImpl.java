package com.handsome.summary.service.impl;

import static run.halo.app.extension.MetadataUtil.nullSafeAnnotations;
import static run.halo.app.extension.index.query.QueryFactory.and;
import static run.halo.app.extension.index.query.QueryFactory.equal;
import static run.halo.app.extension.index.query.QueryFactory.isNotNull;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.extension.Summary;
import com.handsome.summary.service.AiServiceFactory;
import com.handsome.summary.service.ArticleSummaryService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.HashMap;
import java.util.Map;
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
    private final AiServiceFactory aiServiceFactory;
    private final SettingConfigGetter settingConfigGetter;
    private final PostContentService postContentService;
    private final ReactiveExtensionClient client;

    // 常量定义
    public static final String AI_SUMMARY_UPDATED = "summary.lik.cc/ai-summary-updated";
    public static final String ENABLE_BLACK_LIST = "summary.lik.cc/enable-black-list";
    public static final String DEFAULT_AI_SYSTEM_PROMPT = "你是专业摘要助手，请为以下文章生成简明摘要：";
    public static final String DEFAULT_SUMMARY_ERROR_MESSAGE = "文章摘要生成异常：";

    /**
     * 获取指定文章的AI摘要
     * 
     * @param post 文章对象
     * @return 摘要内容
     */
    @Override
    public Mono<String> getSummary(Post post) {
        return settingConfigGetter.getBasicConfig()
            .flatMap(config -> generateSummaryWithConfig(post, config))
            .map(this::extractContentFromJson)
            .flatMap(summary -> saveSummaryToDatabase(summary, post).thenReturn(summary))
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
                isNotNull("summarySpec.postSummary"))
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


    /**
     * 使用配置生成摘要
     */
    private Mono<String> generateSummaryWithConfig(Post post, SettingConfigGetter.BasicConfig config) {
        return postContentService.getReleaseContent(post.getMetadata().getName())
            .flatMap(contentWrapper -> {
                String aiSystem = config.getAiSystem() != null ? config.getAiSystem() : DEFAULT_AI_SYSTEM_PROMPT;
                var aiService = aiServiceFactory.getService(config.getModelType());
                String prompt = aiSystem + "\n" + contentWrapper.getRaw();
                return Mono.fromCallable(() -> aiService.chatCompletionRaw(prompt, config));
            });
    }

    /**
     * 从AI返回的JSON中提取内容
     */
    private String extractContentFromJson(String summaryJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(summaryJson);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode content = choices.get(0).path("message").path("content");
                if (!content.isMissingNode()) {
                    return content.asText();
                }
            }
        } catch (Exception e) {
            log.error("解析AI摘要JSON失败: {}", e.getMessage(), e);
        }
        return summaryJson;
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
        var aiSummaryUpdated = annotations.getOrDefault(AI_SUMMARY_UPDATED, "false");
        boolean blackList = Boolean.parseBoolean(annotations.getOrDefault(ENABLE_BLACK_LIST, "false"));
        boolean enabled = !(Boolean.parseBoolean(String.valueOf(aiSummaryUpdated)) || blackList);
        
        log.info("文章状态 - AI_SUMMARY_UPDATED: {}, ENABLE_BLACK_LIST: {}, enabled: {}", 
            aiSummaryUpdated, blackList, enabled);
        
        if (!enabled) {
            log.info("文章摘要已更新或在黑名单中，跳过更新，文章: {}", postMetadataName);
            return Mono.just(buildResponse(false, "文章摘要已更新或在黑名单中", summaryContent, blackList));
        }
        
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