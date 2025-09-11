package com.handsome.summary.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 文章润色服务
 * 提供基于AI的文章内容润色功能，支持多种AI服务提供商
 * 
 * @author Handsome
 * @since 3.1.1
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticlePolishService {
    
    private final AiServiceFactory aiServiceFactory;
    private final SettingConfigGetter settingConfigGetter;
    
    // 预编译正则表达式，提高性能
    private static final Pattern CONTENT_PATTERN = Pattern.compile("\"content\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern TEXT_PATTERN = Pattern.compile("\"text\"\\s*:\\s*\"([^\"]+)\"");
    
    // 默认系统提示词
    private static final String DEFAULT_SYSTEM_PROMPT = 
        "你是一个专业的文章润色助手，请改善以下文章的语言表达和流畅性，保持原意不变。";
    
    /**
     * 润色文章片段
     * 
     * @param content 需要润色的文章片段
     * @return 润色后的文章内容
     */
    public Mono<String> polishArticleSegment(String content) {
        log.info("润色服务被调用，内容长度: {}", content != null ? content.length() : 0);
        
        // 参数验证
        if (!StringUtils.hasText(content)) {
            return Mono.error(new IllegalArgumentException("文章内容不能为空"));
        }
        
        // 使用统一的AI配置获取方式
        return settingConfigGetter.getAiConfigForFunction("polish")
            .doOnNext(aiConfig -> 
                log.info("开始润色处理，AI类型: {}, API Key: {}, 模型: {}", 
                    aiConfig.getAiType(),
                    aiConfig.getApiKey() != null ? "已设置" : "未设置",
                    aiConfig.getModelName()))
            .flatMap(aiConfig -> validateAndPolish(content, aiConfig))
            .doOnNext(polishedContent -> 
                log.info("文章润色完成，原文长度: {}, 润色后长度: {}",
                    content.length(), polishedContent.length()))
            .onErrorMap(this::mapPolishError);
    }
    
    /**
     * 验证内容长度并进行润色
     */
    private Mono<String> validateAndPolish(String content, SettingConfigGetter.AiConfigResult aiConfig) {
        // 从PolishConfig获取最大长度限制
        return settingConfigGetter.getPolishConfig()
            .flatMap(polishConfig -> {
                Integer maxLength = polishConfig.getPolishMaxLength();
                if (maxLength == null) {
                    maxLength = 2000; // 默认值
                }
                
                if (content.length() > maxLength) {
                    return Mono.error(new IllegalArgumentException(
                        String.format("内容长度(%d)超过最大限制(%d)，请分段润色", content.length(), maxLength)));
                }
                
                return performPolish(content, aiConfig);
            });
    }
    
    /**
     * 执行润色操作
     */
    private Mono<String> performPolish(String content, SettingConfigGetter.AiConfigResult aiConfig) {
        // 确定使用的AI类型
        String aiType = aiConfig.getAiType();
        if (!StringUtils.hasText(aiType)) {
            return Mono.error(new IllegalArgumentException("未配置AI服务类型"));
        }
        
        // 获取AI服务并进行润色
        AiService aiService = aiServiceFactory.getService(aiType);
        if (aiService == null) {
            return Mono.error(new IllegalArgumentException("不支持的AI服务类型: " + aiType));
        }
        
        return Mono.fromCallable(() -> {
            String prompt = buildPolishPrompt(content, aiConfig);
            String response = aiService.chatCompletionRaw(prompt, buildBasicConfig(aiConfig));
            return extractPolishedContent(response);
        })
        .doOnSubscribe(subscription -> log.info("开始润色文章片段，AI服务: {}", aiType))
        .onErrorMap(Exception.class, ex -> 
            new RuntimeException("文章润色失败: " + ex.getMessage(), ex));
    }
    
    /**
     * 构建BasicConfig对象
     */
    private SettingConfigGetter.BasicConfig buildBasicConfig(SettingConfigGetter.AiConfigResult aiConfig) {
        SettingConfigGetter.BasicConfig basicConfig = new SettingConfigGetter.BasicConfig();
        basicConfig.setGlobalAiType(aiConfig.getAiType());
        
        // 构建AiModelConfig
        SettingConfigGetter.AiModelConfig aiModelConfig = new SettingConfigGetter.AiModelConfig();
        
        switch (aiConfig.getAiType()) {
            case "openAi" -> {
                SettingConfigGetter.OpenAiConfig openAiConfig = new SettingConfigGetter.OpenAiConfig();
                openAiConfig.setApiKey(aiConfig.getApiKey());
                openAiConfig.setModelName(aiConfig.getModelName());
                openAiConfig.setBaseUrl(aiConfig.getBaseUrl());
                aiModelConfig.setOpenAiConfig(openAiConfig);
            }
            case "zhipuAi" -> {
                SettingConfigGetter.ZhipuAiConfig zhipuAiConfig = new SettingConfigGetter.ZhipuAiConfig();
                zhipuAiConfig.setApiKey(aiConfig.getApiKey());
                zhipuAiConfig.setModelName(aiConfig.getModelName());
                aiModelConfig.setZhipuAiConfig(zhipuAiConfig);
            }
            case "dashScope" -> {
                SettingConfigGetter.DashScopeConfig dashScopeConfig = new SettingConfigGetter.DashScopeConfig();
                dashScopeConfig.setApiKey(aiConfig.getApiKey());
                dashScopeConfig.setModelName(aiConfig.getModelName());
                aiModelConfig.setDashScopeConfig(dashScopeConfig);
            }
            case "codesphere" -> {
                SettingConfigGetter.CodesphereConfig codesphereConfig = new SettingConfigGetter.CodesphereConfig();
                codesphereConfig.setApiKey(aiConfig.getApiKey());
                codesphereConfig.setModelName(aiConfig.getModelName());
                aiModelConfig.setCodesphereConfig(codesphereConfig);
            }
            case "siliconFlow" -> {
                SettingConfigGetter.SiliconFlowConfig siliconFlowConfig = new SettingConfigGetter.SiliconFlowConfig();
                siliconFlowConfig.setApiKey(aiConfig.getApiKey());
                siliconFlowConfig.setModelName(aiConfig.getModelName());
                siliconFlowConfig.setBaseUrl(aiConfig.getBaseUrl());
                aiModelConfig.setSiliconFlowConfig(siliconFlowConfig);
            }
        }
        
        basicConfig.setAiModelConfig(aiModelConfig);
        return basicConfig;
    }
    
    /**
     * 构建润色提示词
     */
    private String buildPolishPrompt(String content, SettingConfigGetter.AiConfigResult aiConfig) {
        String systemPrompt = StringUtils.hasText(aiConfig.getSystemPrompt()) 
            ? aiConfig.getSystemPrompt() 
            : DEFAULT_SYSTEM_PROMPT;
        
        return String.format("%s\n\n需要润色的内容：\n%s\n\n请直接返回润色后的内容：", 
            systemPrompt, content);
    }
    
    /**
     * 从AI响应中提取润色后的内容
     */
    private String extractPolishedContent(String response) {
        if (!StringUtils.hasText(response)) {
            return "";
        }
        
        // 尝试从JSON中提取内容
        String content = extractContentFromJsonString(response);
        
        if (StringUtils.hasText(content)) {
            return content.trim();
        }
        
        // 如果JSON解析失败，检查是否是纯文本响应
        String trimmedResponse = response.trim();
        if (!trimmedResponse.startsWith("{")) {
            log.info("AI返回纯文本响应，直接使用");
            return trimmedResponse;
        }
        return response;
    }
    
    /**
     * 从JSON字符串中提取内容
     */
    private String extractContentFromJsonString(String jsonString) {
        // 尝试提取 "content" 字段
        Matcher contentMatcher = CONTENT_PATTERN.matcher(jsonString);
        if (contentMatcher.find()) {
            return unescapeJsonString(contentMatcher.group(1));
        }

        // 尝试提取 "text" 字段
        Matcher textMatcher = TEXT_PATTERN.matcher(jsonString);
        if (textMatcher.find()) {
            return unescapeJsonString(textMatcher.group(1));
        }

        return null;
    }
    
    /**
     * 处理JSON字符串中的转义字符
     */
    private String unescapeJsonString(String jsonString) {
        return jsonString.replace("\\n", "\n")
                        .replace("\\t", "\t")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
    }
    
    /**
     * 映射润色错误，提供更友好的错误信息
     */
    private Throwable mapPolishError(Throwable throwable) {
        // 参数错误直接返回
        if (throwable instanceof IllegalArgumentException) {
            return throwable;
        }
        
        String message = throwable.getMessage();
        if (message == null) {
            return new RuntimeException("文章润色服务暂时不可用，请稍后重试");
        }
        
        // 根据错误类型提供具体的错误信息
        String lowerMessage = message.toLowerCase();
        
        if (lowerMessage.contains("timeout") || lowerMessage.contains("超时")) {
            return new RuntimeException("AI服务响应超时，请稍后重试");
        }
        
        if (lowerMessage.contains("unauthorized") || lowerMessage.contains("401")) {
            return new RuntimeException("API密钥无效，请检查配置");
        }
        
        if (lowerMessage.contains("rate limit") || lowerMessage.contains("429")) {
            return new RuntimeException("API调用频率超限，请稍后重试");
        }
        
        if (lowerMessage.contains("connection") || lowerMessage.contains("连接")) {
            return new RuntimeException("网络连接失败，请检查网络设置");
        }
        
        if (lowerMessage.contains("forbidden") || lowerMessage.contains("403")) {
            return new RuntimeException("API访问被拒绝，请检查权限配置");
        }
        
        // 记录原始错误信息用于调试
        log.error("润色服务发生未知错误: {}", message, throwable);
        return new RuntimeException("文章润色服务暂时不可用，请稍后重试");
    }
}
