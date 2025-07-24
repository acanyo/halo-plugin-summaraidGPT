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
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.Map;
import java.util.HashMap;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.router.selector.FieldSelector;

/**
 * 文章摘要服务实现。
 * <p>
 * 根据配置动态选择AI服务，获取指定文章的AI摘要（全链路响应式）。
 * </p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleSummaryServiceImpl implements ArticleSummaryService {
    private final AiServiceFactory aiServiceFactory;
    private final SettingConfigGetter settingConfigGetter;
    private final PostContentService postContentService;
    private final ReactiveExtensionClient client;
    public static final String AI_SUMMARY_UPDATED = "summary.lik.cc/ai-summary-updated";
    public static final String ENABLE_BLACK_LIST = "summary.lik.cc/enable-black-list";
    
    /**
     * 构建统一的响应结果
     */
    private Map<String, Object> buildResponse(boolean success, String message, String summaryContent, boolean blackList) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("summaryContent", summaryContent != null ? summaryContent : "");
        response.put("blackList", blackList);
        return response;
    }
    /**
     * 获取指定文章的AI摘要（响应式）。
     * @param post 文章对象（包含ID、内容、标题等）
     * @return Mono包裹的AI生成的文章摘要内容（如遇异常返回错误信息）
     */
    @Override
    public Mono<String> getSummary(Post post) {
        return settingConfigGetter.getBasicConfig()
            .flatMap(config -> postContentService.getReleaseContent(post.getMetadata().getName())
                .flatMap(contentWrapper -> {
                    String aiSystem = config.getAiSystem() != null ? config.getAiSystem() : "你是专业摘要助手，请为以下文章生成简明摘要：";
                    var aiService = aiServiceFactory.getService(config.getModelType());
                    String prompt = aiSystem + "\n" + contentWrapper.getRaw();
                    return Mono.fromCallable(() -> aiService.chatCompletionRaw(prompt, config));
                })
            )
            .map(this::extractContent)
            .flatMap(summary -> saveSummaryToTable(summary, post).thenReturn(summary))
            .onErrorResume(e -> Mono.just("[文章摘要生成异常：" + e.getMessage() + "]"));
    }

    /**
     * 提取AI返回JSON中的content字段
     */
    private String extractContent(String summaryJson) {
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
     * 将摘要保存到Summary表
     */
    private Mono<Void> saveSummaryToTable(String summary, Post post) {
        String postMetadataName = post.getMetadata().getName();
        var summaryFlux = findSummaryByPostName(postMetadataName);
        return summaryFlux
            .collectList()
            .flatMap(list -> {
                if (!list.isEmpty()) {
                    Summary existing = list.getFirst();
                    existing.getSummarySpec().setPostSummary(summary);
                    return client.update(existing)
                        .doOnSuccess(s -> log.info("摘要已更新到Summary表，文章: {}", postMetadataName))
                        .doOnError(e -> log.error("更新摘要到Summary表失败: {}", e.getMessage(), e))
                        .then();
                } else {
                    Summary summaryEntity = new Summary();
                    summaryEntity.setMetadata(new Metadata());
                    summaryEntity.getMetadata().setGenerateName("summary-");
                    Summary.SummarySpec summarySpec = new Summary.SummarySpec();
                    summarySpec.setPostSummary(summary);
                    summarySpec.setPostMetadataName(postMetadataName);
                    summarySpec.setPostUrl(post.getStatus().getPermalink());
                    summaryEntity.setSummarySpec(summarySpec);
                    return client.create(summaryEntity)
                        .doOnSuccess(s -> log.info("摘要已保存到Summary表，文章: {}", postMetadataName))
                        .doOnError(e -> log.error("保存摘要到Summary表失败: {}", e.getMessage(), e))
                        .then();
                }
            });
    }

    @Override
    public Flux<Summary> findSummaryByPostName(String postMetadataName) {
        var listOptions = new ListOptions();
        listOptions.setFieldSelector(FieldSelector.of(
            and(equal("summarySpec.postMetadataName", postMetadataName),
                isNotNull("summarySpec.postSummary"))
        ));
        return client.listAll(Summary.class, listOptions, Sort.unsorted());
    }

    @Override
    public Mono<Map<String, Object>> updatePostContentWithSummary(String postMetadataName) {
        // 1. 查找摘要 - 使用 hasElements() 来检查是否有数据
        return findSummaryByPostName(postMetadataName)
            .hasElements()
            .flatMap(hasElements -> {
                if (!hasElements) {
                    log.info("未找到摘要数据，返回错误响应");
                    return Mono.just(buildResponse(false,"未找到摘要内容","未找到摘要内容",false));
                }
                return findSummaryByPostName(postMetadataName)
                    .next()
                    .flatMap(summary -> {
                        String summaryContent = summary.getSummarySpec().getPostSummary();
                        log.info("找到摘要内容: {}", summaryContent);
                        return client.fetch(Post.class, postMetadataName)
                            .flatMap(post -> updatePostWithSummary(post, summaryContent, postMetadataName))
                            .onErrorResume(e -> {
                                log.error("更新文章摘要时发生错误: {}", e.getMessage(), e);
                                return Mono.just(buildResponse(false, "更新文章摘要时发生错误: " + e.getMessage(), summaryContent, false));
                            });
                    });
            })
            .onErrorResume(e -> {
                log.error("updatePostContentWithSummary 异常: {}", e.getMessage(), e);
                return Mono.just(buildResponse(false,"未找到摘要内容","未找到摘要内容",false));
            });
    }
    
    /**
     * 更新文章摘要的具体逻辑
     */
    private Mono<Map<String, Object>> updatePostWithSummary(Post post, String summaryContent, String postMetadataName) {
        var annotations = nullSafeAnnotations(post);
        var newPost = annotations.getOrDefault(AI_SUMMARY_UPDATED, "false");
        boolean blackList = Boolean.parseBoolean(annotations.getOrDefault(ENABLE_BLACK_LIST, "false"));
        boolean enabled = !(Boolean.parseBoolean(String.valueOf(newPost)) || blackList);
        
        if (!enabled) {
            log.info("文章摘要已更新或黑名单，跳过更新正文: {}", postMetadataName);
            return Mono.just(buildResponse(false, "文章摘要已更新或在黑名单中", summaryContent, blackList));
        }
        
        // 更新文章摘要
        post.getSpec().getExcerpt().setRaw(summaryContent);
        post.getSpec().getExcerpt().setAutoGenerate(false);
        post.getStatus().setExcerpt(summaryContent);
        annotations.put(AI_SUMMARY_UPDATED, "true");
        
        return client.update(post)
            .doOnSuccess(p -> log.info("已将摘要写入文章正文: {}", post.getStatus().getExcerpt()))
            .then(Mono.just(buildResponse(true,"成功",summaryContent,false)));
    }
} 