package com.handsome.summary.service.impl;

import com.handsome.summary.extension.Summary;
import com.handsome.summary.service.AiService;
import com.handsome.summary.service.ArticleSummaryService;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

import java.util.Optional;
import java.util.UUID;

/**
 * 文章摘要服务实现类
 * 提供根据文章内容获取摘要的功能
 *
 * @author handsome
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ArticleSummaryServiceImpl implements ArticleSummaryService {

    private final SettingConfigGetter settingConfigGetter;
    private final AiService aiService;
    private final ReactiveExtensionClient client;
    private final PostContentService postContentService;

    @Override
    public Mono<String> generateSummary(String content) {
        if (!StringUtils.hasText(content)) {
            return Mono.just("文章内容为空，无法生成摘要");
        }

        return settingConfigGetter.getBasicConfig()
            .switchIfEmpty(Mono.error(new RuntimeException("无法获取基本配置")))
            .flatMap(config -> {
                try {
                    if (Optional.ofNullable(config.getEnableAi()).orElse(false)) {
                        return Mono.just("AI功能已禁用");
                    }

                    String modelType = config.getModelType();
                    String aiSystem = config.getAiSystem();
                    
                    // 构建摘要提示词
                    String summaryPrompt = buildSummaryPrompt(content, aiSystem);
                    
                    return switch (modelType) {
                        case "openAi" -> handleOpenAISummary(config, summaryPrompt);
                        case "zhipuAi" -> handleZhipuAISummary(config, summaryPrompt);
                        case "dashScope" -> handleDashScopeSummary(config, summaryPrompt);
                        default -> {
                            String errorMsg = "不支持的模型类型: %s".formatted(modelType);
                            log.warn(errorMsg);
                            yield Mono.just("不支持的AI模型类型");
                        }
                    };
                } catch (Exception e) {
                    log.error("生成摘要时发生错误", e);
                    return Mono.just("生成摘要时发生错误: " + e.getMessage());
                }
            });
    }

    /**
     * 根据文章内容生成摘要并保存到Summary表
     *
     * @param content 文章内容
     * @param post 文章对象
     * @return 摘要内容
     */
    @Override
    public Mono<String> generateSummaryAndSave(String content, Post post) {
        return generateSummary(content)
            .flatMap(summary -> {
                log.info("为文章[{}]生成摘要: {}", post.getMetadata().getName(), summary);
                return saveSummaryToTable(summary, post)
                    .thenReturn(summary);
            });
    }

    @Override
    public Mono<String> generateSummaryByPostName(String postName) {
        if (!StringUtils.hasText(postName)) {
            return Mono.error(new IllegalArgumentException("文章名称不能为空"));
        }

        return client.fetch(Post.class, postName)
            .switchIfEmpty(Mono.error(new RuntimeException("文章不存在: " + postName)))
            .flatMap(post -> {
                // 获取文章内容并生成摘要
                return postContentService.getReleaseContent(postName)
                    .flatMap(contentWrapper -> {
                        String articleContent = Jsoup.parse(contentWrapper.getContent()).text();
                        log.info("获取到文章[{}]内容，长度: {}", postName, articleContent.length());
                        return generateSummary(articleContent);
                    })
                    .onErrorResume(e -> {
                        log.error("获取文章内容失败: {}", e.getMessage(), e);
                        return Mono.just("获取文章内容失败: " + e.getMessage());
                    });
            });
    }

    /**
     * 将摘要保存到Summary表
     */
    private Mono<Void> saveSummaryToTable(String summary, Post post) {
        try {
            var summaryEntity = new Summary();
            summaryEntity.setMetadata(new Metadata());
            summaryEntity.getMetadata().setGenerateName("summary-");
            summaryEntity.setPostSummary(summary);
            summaryEntity.setPostMetadataName(post.getMetadata().getName());
            summaryEntity.setPostUrl(post.getStatus().getPermalink());
            return client.create(summaryEntity)
                .doOnSuccess(s -> log.info("摘要已保存到Summary表，文章: {}", post.getMetadata().getName()))
                .doOnError(e -> log.error("保存摘要到Summary表失败: {}", e.getMessage(), e))
                .then();
        } catch (Exception e) {
            log.error("创建Summary实体失败: {}", e.getMessage(), e);
            return Mono.error(e);
        }
    }

    /**
     * 构建摘要提示词
     */
    private String buildSummaryPrompt(String content, String aiSystem) {
        // 限制内容长度，避免超出AI模型限制
        String truncatedContent = content.length() > 4000 ? 
            content.substring(0, 4000) + "..." : content;
        
        String defaultSystem = "你是一个专业的文章摘要生成助手。请根据以下文章内容，生成一个简洁、准确、信息丰富的摘要。摘要应该：\n" +
            "1. 概括文章的主要观点和核心内容\n" +
            "2. 保持客观中立的语调\n" +
            "3. 控制在200字以内\n" +
            "4. 使用清晰、易懂的语言\n" +
            "5. 突出文章的重点和亮点";
        
        String systemPrompt = StringUtils.hasText(aiSystem) ? aiSystem : defaultSystem;
        
        return "请根据以下文章内容生成摘要：\n\n" +
               "文章内容：\n" +
               truncatedContent + "\n\n" +
               "请生成摘要：";
    }

    /**
     * 处理OpenAI摘要生成
     */
    private Mono<String> handleOpenAISummary(SettingConfigGetter.BasicConfig config, String prompt) {
        try {
            var response = aiService.openAiChat(
                config.getOpenAiApiKey(),
                config.getOpenAiModelName(),
                config.getOpenAiUrl(),
                "你是一个专业的文章摘要生成助手",
                prompt
            );
            return Mono.just(response.getContent());
        } catch (Exception e) {
            log.error("OpenAI摘要生成失败", e);
            return Mono.just("OpenAI摘要生成失败: " + e.getMessage());
        }
    }

    /**
     * 处理智谱AI摘要生成
     */
    private Mono<String> handleZhipuAISummary(SettingConfigGetter.BasicConfig config, String prompt) {
        try {
            var response = aiService.zhipuAiChat(
                config.getZhipuAiApiKey(),
                config.getZhipuAiModelName(),
                "你是一个专业的文章摘要生成助手",
                prompt
            );
            return Mono.just(response.getContent());
        } catch (Exception e) {
            log.error("智谱AI摘要生成失败", e);
            return Mono.just("智谱AI摘要生成失败: " + e.getMessage());
        }
    }

    /**
     * 处理通义千问摘要生成
     */
    private Mono<String> handleDashScopeSummary(SettingConfigGetter.BasicConfig config, String prompt) {
        try {
            var response = aiService.qwenAiChat(
                config.getDashScopeApiKey(),
                config.getDashScopeModelName(),
                "你是一个专业的文章摘要生成助手",
                prompt
            );
            return Mono.just(response.getContent());
        } catch (Exception e) {
            log.error("通义千问摘要生成失败", e);
            return Mono.just("通义千问摘要生成失败: " + e.getMessage());
        }
    }
} 