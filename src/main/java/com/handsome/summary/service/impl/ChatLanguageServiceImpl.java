package com.handsome.summary.service.impl;

import com.handsome.summary.service.AiService;
import com.handsome.summary.service.ChatLanguageService;
import com.handsome.summary.service.ConfigCenter;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * 聊天语言服务实现类
 * 根据配置选择不同的AI模型进行聊天
 *
 * @author handsome
 */
@Component
@Slf4j
public class ChatLanguageServiceImpl implements ChatLanguageService {
    
    private final ConfigCenter configSvc;
    private final AiService aiSvc;
    
    @Autowired
    public ChatLanguageServiceImpl(ConfigCenter configSvc, AiService aiSvc) {
        this.configSvc = configSvc;
        this.aiSvc = aiSvc;
    }
    
    @Override
    public Mono<ChatResponse> model(String content) {
        return configSvc.getAppConfigsByGroupName("basic")
            .flatMap(config -> {
                String modelType = config.get("modelType").asText();
                String aiSystem = config.get("aiSystem").asText();
                log.debug("使用模型类型: {}, 系统提示: {}", modelType, aiSystem);
                
                return switch (modelType) {
                    case "openai" -> handleOpenAI(config, aiSystem, content);
                    case "qianfan" -> handleQianfan(config, aiSystem, content);
                    case "zhipuAi" -> handleZhipuAI(config, aiSystem, content);
                    case "dashScope" -> handleDashScope(config, aiSystem, content);
                    case "gemini" -> handleGemini(config, aiSystem, content);
                    default -> {
                        String errorMsg = String.format("不支持的模型类型: %s", modelType);
                        log.error(errorMsg);
                        yield Mono.error(new IllegalArgumentException(errorMsg));
                    }
                };
            });
    }
    
    /**
     * 处理OpenAI模型
     */
    private Mono<ChatResponse> handleOpenAI(com.fasterxml.jackson.databind.JsonNode config, String aiSystem, String content) {
        String openAiApiKey = config.get("openAiApiKey").asText();
        String openAiModelName = config.get("openAiModelName").asText();
        String openAiUrl = config.get("OpenAiUrl").asText();
        
        log.debug("调用OpenAI API, 模型: {}", openAiModelName);
        return Mono.just(aiSvc.openAiChat(openAiApiKey, openAiModelName, openAiUrl, aiSystem, content));
    }
    
    /**
     * 处理千帆模型
     */
    private Mono<ChatResponse> handleQianfan(com.fasterxml.jackson.databind.JsonNode config, String aiSystem, String content) {
        String qianfanClientId = config.get("qianfanClientId").asText();
        String clientSecret = config.get("clientSecret").asText();
        String qianfanModelName = config.get("qianfanModelName").asText();
        
        log.debug("调用千帆API, 模型: {}", qianfanModelName);
        return Mono.just(aiSvc.qianfanChat(qianfanClientId, clientSecret, qianfanModelName, aiSystem, content));
    }
    
    /**
     * 处理智谱AI模型
     */
    private Mono<ChatResponse> handleZhipuAI(com.fasterxml.jackson.databind.JsonNode config, String aiSystem, String content) {
        String zhipuAiApiKey = config.get("zhipuAiApiKey").asText();
        String zhipuAiModelName = config.get("zhipuAiModelName").asText();
        
        log.debug("调用智谱AI API, 模型: {}", zhipuAiModelName);
        return Mono.just(aiSvc.zhipuAiChat(zhipuAiApiKey, zhipuAiModelName, aiSystem, content));
    }
    
    /**
     * 处理通义千问模型
     */
    private Mono<ChatResponse> handleDashScope(com.fasterxml.jackson.databind.JsonNode config, String aiSystem, String content) {
        String dashScopeApiKey = config.get("dashScopeApiKey").asText();
        String dashScopeModelName = config.get("dashScopeModelName").asText();
        
        log.debug("调用通义千问API, 模型: {}", dashScopeModelName);
        return Mono.just(aiSvc.qwenAiChat(dashScopeApiKey, dashScopeModelName, aiSystem, content));
    }
    
    /**
     * 处理Gemini模型
     */
    private Mono<ChatResponse> handleGemini(com.fasterxml.jackson.databind.JsonNode config, String aiSystem, String content) {
        String geminiApiKey = config.get("geminiApiKey").asText();
        String geminiModelName = config.get("geminiModelName").asText();
        
        log.debug("调用Gemini API, 模型: {}", geminiModelName);
        return Mono.just(aiSvc.geminiChat(geminiApiKey, geminiModelName, aiSystem, content));
    }
}
