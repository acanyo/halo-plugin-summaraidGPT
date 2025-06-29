package com.handsome.summary.service.impl;

import com.handsome.summary.service.AiService;
import com.handsome.summary.service.ChatLanguageService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebInputException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ReactiveExtensionClient;

/**
 * 聊天语言服务实现类
 * 根据配置选择不同的AI模型进行聊天
 *
 * @author handsome
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ChatLanguageServiceImpl implements ChatLanguageService {
    private final SettingConfigGetter settingConfigGetter;
    private final AiService aiSvc;
    private final ReactiveExtensionClient client;

    @Override
    public Mono<Void> model(String content, Post post) {
        return settingConfigGetter.getBasicConfig()
            .switchIfEmpty(Mono.error(new RuntimeException("无法获取基本配置")))
            .flatMap(config -> {
                try {
                    if (Optional.ofNullable(config.getEnableAi()).orElse(false)) {
                        return Mono.empty();
                    }
                    
                    String modelType = config.getModelType();
                    String aiSystem = config.getAiSystem();
                    
                    return switch (modelType) {
                        case "openAi" -> handleOpenAI(config, aiSystem, content, post);
                        case "zhipuAi" -> handleZhipuAI(config, aiSystem, content, post);
                        case "dashScope" -> handleDashScope(config, aiSystem, content, post);
                        default -> {
                            String errorMsg = "不支持的模型类型: %s".formatted(modelType);
                            log.info(errorMsg);
                            yield Mono.error(new ServerWebInputException(errorMsg));
                        }
                    };
                } catch (Exception e) {
                    return Mono.error(() -> new ServerWebInputException("处理配置时发生错误"));
                }
            });
    }

    private Mono<Void> updatePostSummary(Post post, String summary) {
        post.getMetadata().getLabels().put("isSummary", "true");
        if (post.getStatus() == null) {
            post.setStatus(new Post.PostStatus());
        }
        post.getStatus().setExcerpt(summary);
        return client.update(post)
            .doOnSuccess(p -> log.info("文章[{}]摘要更新成功", p.getMetadata().getName()))
            .then();
    }

    /**
     * AI处理结果记录
     */
    private record AiProcessResult(String modelName, String apiKey, String url) {}

    /**
     * 处理OpenAI模型
     */
    private Mono<Void> handleOpenAI(SettingConfigGetter.BasicConfig config, String aiSystem,
        String content, Post post) {
        try {
            var result = new AiProcessResult(
                config.getOpenAiModelName(),
                config.getOpenAiApiKey(),
                config.getOpenAiUrl()
            );
            
            log.info("调用OpenAI API, 模型: {}", result.modelName());
            return Mono.just(
                    aiSvc.openAiChat(result.apiKey(), result.modelName(), result.url(), aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.getContent()));
        } catch (Exception e) {
            log.info("处理OpenAI配置时发生错误", e);
            return Mono.error(e);
        }
    }

    /**
     * 处理智谱AI模型
     */
    private Mono<Void> handleZhipuAI(SettingConfigGetter.BasicConfig config, String aiSystem,
        String content, Post post) {
        try {
            var result = new AiProcessResult(
                config.getZhipuAiModelName(),
                config.getZhipuAiApiKey(),
                null
            );

            log.info("调用智谱AI API, 模型: {}", result.modelName());
            return Mono.just(aiSvc.zhipuAiChat(result.apiKey(), result.modelName(), aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.getContent()));
        } catch (Exception e) {
            log.info("处理智谱AI配置时发生错误", e);
            return Mono.error(e);
        }
    }

    /**
     * 处理通义千问模型
     */
    private Mono<Void> handleDashScope(SettingConfigGetter.BasicConfig config, String aiSystem,
        String content, Post post) {
        try {
            var result = new AiProcessResult(
                config.getDashScopeModelName(),
                config.getDashScopeApiKey(),
                null
            );

            log.info("调用通义千问API, 模型: {}", result.modelName());
            return Mono.just(
                    aiSvc.qwenAiChat(result.apiKey(), result.modelName(), aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.getContent()));
        } catch (Exception e) {
            log.info("处理通义千问配置时发生错误", e);
            return Mono.error(e);
        }
    }
}
