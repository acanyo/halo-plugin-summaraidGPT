package com.handsome.summary.service.impl;

import com.handsome.summary.service.AiService;
import com.handsome.summary.service.ChatLanguageService;
import com.handsome.summary.service.SettingConfigGetter;
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
                    String modelType = config.getModelType();
                    String aiSystem = config.getAiSystem();
                    return switch (modelType) {
                        case "openAi" -> handleOpenAI(config, aiSystem, content, post);
                        case "qianfan" -> handleQianfan(config, aiSystem, content, post);
                        case "zhipuAi" -> handleZhipuAI(config, aiSystem, content, post);
                        case "dashScope" -> handleDashScope(config, aiSystem, content, post);
                        case "gemini" -> handleGemini(config, aiSystem, content, post);
                        default -> {
                            String errorMsg = String.format("不支持的模型类型: %s", modelType);
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
     * 处理OpenAI模型
     */
    private Mono<Void> handleOpenAI(SettingConfigGetter.BasicConfig config, String aiSystem, String content,
        Post post) {
        try {
            String openAiApiKey = config.getOpenAiApiKey();
            String openAiModelName = config.getOpenAiModelName();
            String openAiUrl = config.getOpenAiUrl();
            log.info("调用OpenAI API, 模型: {}", openAiModelName);
            return Mono.just(aiSvc.openAiChat(openAiApiKey, openAiModelName, openAiUrl, aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.aiMessage().text()));
        } catch (Exception e) {
            log.info("处理OpenAI配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理千帆模型
     */
    private Mono<Void> handleQianfan(SettingConfigGetter.BasicConfig config, String aiSystem, String content, Post post) {
        try {
            String qianfanClientId = config.getQianfanClientId();
            String clientSecret = config.getClientSecret();
            String qianfanModelName = config.getQianfanModelName();
            
            log.info("调用千帆API, 模型: {}", qianfanModelName);
            return Mono.just(aiSvc.qianfanChat(qianfanClientId, clientSecret, qianfanModelName, aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.aiMessage().text()));
        } catch (Exception e) {
            log.info("处理千帆配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理智谱AI模型
     */
    private Mono<Void> handleZhipuAI(SettingConfigGetter.BasicConfig config, String aiSystem, String content, Post post) {
        try {
            String zhipuAiApiKey = config.getZhipuAiApiKey();
            String zhipuAiModelName = config.getZhipuAiModelName();
            
            log.info("调用智谱AI API, 模型: {}", zhipuAiModelName);
            return Mono.just(aiSvc.zhipuAiChat(zhipuAiApiKey, zhipuAiModelName, aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.aiMessage().text()));
        } catch (Exception e) {
            log.info("处理智谱AI配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理通义千问模型
     */
    private Mono<Void> handleDashScope(SettingConfigGetter.BasicConfig config, String aiSystem, String content, Post post) {
        try {
            String dashScopeApiKey = config.getDashScopeApiKey();
            String dashScopeModelName = config.getDashScopeModelName();
            
            log.info("调用通义千问API, 模型: {}", dashScopeModelName);
            return Mono.just(aiSvc.qwenAiChat(dashScopeApiKey, dashScopeModelName, aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.aiMessage().text()));
        } catch (Exception e) {
            log.info("处理通义千问配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理Gemini模型
     */
    private Mono<Void> handleGemini(SettingConfigGetter.BasicConfig config, String aiSystem, String content, Post post) {
        try {
            String geminiApiKey = config.getGeminiApiKey();
            String geminiModelName = config.getGeminiModelName();
            
            log.info("调用Gemini API, 模型: {}", geminiModelName);
            return Mono.just(aiSvc.geminiChat(geminiApiKey, geminiModelName, aiSystem, content))
                .flatMap(response -> updatePostSummary(post, response.aiMessage().text()));
        } catch (Exception e) {
            log.info("处理Gemini配置时发生错误", e);
            return Mono.error(e);
        }
    }
}
