package com.handsome.summary.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.handsome.summary.service.AiService;
import com.handsome.summary.service.ChatLanguageService;
import com.handsome.summary.service.ConfigCenter;
import dev.langchain4j.model.chat.response.ChatResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

/**
 * 聊天语言服务实现类
 * 根据配置选择不同的AI模型进行聊天
 *
 * @author handsome
 */
@Component
@Slf4j
public class ChatLanguageServiceImpl implements ChatLanguageService {

    private final ReactiveSettingFetcher settingFetcher;
    private final ConfigCenter configSvc;
    private final AiService aiSvc;
    
    @Autowired
    public ChatLanguageServiceImpl(ReactiveSettingFetcher settingFetcher, ConfigCenter configSvc, AiService aiSvc) {
        this.settingFetcher = settingFetcher;
        this.configSvc = configSvc;
        this.aiSvc = aiSvc;
    }
    
    @Override
    public Mono<ChatResponse> model(String content) {
        return getConfigByGroupName()
            .flatMap(config -> {
                try {
                    String modelType = config.getModelType();
                    String aiSystem = config.getAiSystem();
                    log.info("使用模型类型: {}, 系统提示: {}", modelType, aiSystem);
                    return switch (modelType) {
                        case "openai" -> handleOpenAI(config, aiSystem, content);
                        case "qianfan" -> handleQianfan(config, aiSystem, content);
                        case "zhipuAi" -> handleZhipuAI(config, aiSystem, content);
                        case "dashScope" -> handleDashScope(config, aiSystem, content);
                        case "gemini" -> handleGemini(config, aiSystem, content);
                        default -> {
                            String errorMsg = String.format("不支持的模型类型: %s", modelType);
                            log.info(errorMsg);
                            yield Mono.error(new IllegalArgumentException(errorMsg));
                        }
                    };
                } catch (Exception e) {
                    log.error("处理配置时发生错误", e);
                    return Mono.error(e);
                }
            });
    }
    
    /**
     * 处理OpenAI模型
     */
    private Mono<ChatResponse> handleOpenAI(BaseConfig config, String aiSystem, String content) {
        try {
            String openAiApiKey = config.getOpenAiApiKey();
            String openAiModelName = config.getOpenAiModelName();
            String openAiUrl = config.getOpenAiUrl();
            
            log.info("调用OpenAI API, 模型: {}", openAiModelName);
            return Mono.just(aiSvc.openAiChat(openAiApiKey, openAiModelName, openAiUrl, aiSystem, content));
        } catch (Exception e) {
            log.info("处理OpenAI配置时发生错误", e);
            return Mono.error(e);
        }
    }
    private Mono<BaseConfig> getConfigByGroupName() {
        return settingFetcher.get("basic")
            .switchIfEmpty(Mono.error(new RuntimeException("配置不存在")))
            .flatMap(item -> {
                BaseConfig config = new BaseConfig(
                    item.path("modelType").asText(),
                    item.path("qianfanClientId").asText(),
                    item.path("clientSecret").asText(),
                    item.path("qianfanModelName").asText(),
                    item.path("openAiApiKey").asText(),
                    item.path("openAiModelName").asText(),
                    item.path("OpenAiUrl").asText(),
                    item.path("zhipuAiApiKey").asText(),
                    item.path("zhipuAiModelName").asText(),
                    item.path("dashScopeApiKey").asText(),
                    item.path("dashScopeModelName").asText(),
                    item.path("geminiApiKey").asText(),
                    item.path("geminiModelName").asText(),
                    item.path("aiSystem").asText()
                );
                return Mono.just(config);
            });
    }
    @Data
    @AllArgsConstructor
    static class BaseConfig {
        private String modelType;
        private String qianfanClientId;
        private String clientSecret;
        private String qianfanModelName;
        private String openAiApiKey;
        private String openAiModelName;
        private String OpenAiUrl;
        private String zhipuAiApiKey;
        private String zhipuAiModelName;
        private String dashScopeApiKey;
        private String dashScopeModelName;
        private String geminiApiKey;
        private String geminiModelName;
        private String aiSystem;
    }
    /**
     * 处理千帆模型
     */
    private Mono<ChatResponse> handleQianfan(BaseConfig config, String aiSystem, String content) {
        try {
            String qianfanClientId = config.getQianfanClientId();
            String clientSecret = config.getClientSecret();
            String qianfanModelName = config.getQianfanModelName();
            
            log.info("调用千帆API, 模型: {}", qianfanModelName);
            return Mono.just(aiSvc.qianfanChat(qianfanClientId, clientSecret, qianfanModelName, aiSystem, content));
        } catch (Exception e) {
            log.info("处理千帆配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理智谱AI模型
     */
    private Mono<ChatResponse> handleZhipuAI(BaseConfig config, String aiSystem, String content) {
        try {
            String zhipuAiApiKey = config.getZhipuAiApiKey();
            String zhipuAiModelName = config.getZhipuAiModelName();
            
            log.info("调用智谱AI API, 模型: {}", zhipuAiModelName);
            return Mono.just(aiSvc.zhipuAiChat(zhipuAiApiKey, zhipuAiModelName, aiSystem, content));
        } catch (Exception e) {
            log.info("处理智谱AI配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理通义千问模型
     */
    private Mono<ChatResponse> handleDashScope(BaseConfig config, String aiSystem, String content) {
        try {
            String dashScopeApiKey = config.getDashScopeApiKey();
            String dashScopeModelName = config.getDashScopeModelName();
            
            log.info("调用通义千问API, 模型: {}", dashScopeModelName);
            return Mono.just(aiSvc.qwenAiChat(dashScopeApiKey, dashScopeModelName, aiSystem, content));
        } catch (Exception e) {
            log.info("处理通义千问配置时发生错误", e);
            return Mono.error(e);
        }
    }
    
    /**
     * 处理Gemini模型
     */
    private Mono<ChatResponse> handleGemini(BaseConfig config, String aiSystem, String content) {
        try {
            String geminiApiKey = config.getGeminiApiKey();
            String geminiModelName = config.getGeminiModelName();
            
            log.info("调用Gemini API, 模型: {}", geminiModelName);
            return Mono.just(aiSvc.geminiChat(geminiApiKey, geminiModelName, aiSystem, content));
        } catch (Exception e) {
            log.info("处理Gemini配置时发生错误", e);
            return Mono.error(e);
        }
    }
}
