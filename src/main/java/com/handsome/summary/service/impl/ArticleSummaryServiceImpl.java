package com.handsome.summary.service.impl;

import com.handsome.summary.service.ArticleSummaryService;
import com.handsome.summary.extension.Summary;
import com.handsome.summary.service.AiServiceFactory;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import run.halo.app.content.ContentWrapper;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import run.halo.app.extension.index.query.QueryFactory;
import run.halo.app.extension.router.selector.FieldSelector;

import static run.halo.app.extension.index.query.QueryFactory.and;
import static run.halo.app.extension.index.query.QueryFactory.equal;
import static run.halo.app.extension.index.query.QueryFactory.isNotNull;
import static run.halo.app.extension.index.query.QueryFactory.isNull;

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
    /**
     * 获取指定文章的AI摘要（响应式）。
     * @param post 文章对象（包含ID、内容、标题等）
     * @return Mono包裹的AI生成的文章摘要内容（如遇异常返回错误信息）
     */
    @Override
    public Mono<String> getSummary(Post post) {
        return settingConfigGetter.getBasicConfig()
            .filter(config -> Boolean.FALSE.equals(config.getEnableAi()))
            .switchIfEmpty(Mono.error(new IllegalStateException("AI未启用或配置缺失")))
            .flatMap(config -> postContentService.getReleaseContent(post.getMetadata().getName())
                .flatMap(contentWrapper -> {
                    String aiSystem = config.getAiSystem() != null ? config.getAiSystem() : "你是专业摘要助手，请为以下文章生成简明摘要：";
                    var aiService = aiServiceFactory.getService(config.getModelType());
                    String prompt = aiSystem + "\n" + contentWrapper.getContent();
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
            // 其它AI格式可在此补充
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
        var listOptions = new ListOptions();
        listOptions.setFieldSelector(FieldSelector.of(
            and(equal("postMetadataName", postMetadataName),
                isNotNull("postSummary"))
        ));
        return client.listAll(Summary.class, listOptions, Sort.unsorted())
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
} 