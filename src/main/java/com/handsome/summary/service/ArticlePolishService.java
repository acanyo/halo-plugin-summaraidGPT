package com.handsome.summary.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

/**
 * 文章润色服务
 * 提供基于 Halo AI Foundation 的文章内容润色功能。
 * 
 * @author Handsome
 * @since 3.1.1
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticlePolishService {
    
    private final AiFoundationAiService aiFoundationAiService;
    private final SettingConfigGetter settingConfigGetter;
    
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
                log.info("开始润色处理，AI Foundation 模型: {}", aiConfig.getModelName()))
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
        // 从生成配置获取最大长度限制
        return settingConfigGetter.getGenerationConfig()
            .flatMap(generationConfig -> {
                Integer maxLength = generationConfig.getPolishMaxLength();
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
        return Mono.defer(() -> {
            String prompt = buildPolishPrompt(content, aiConfig);
            return aiFoundationAiService.generateText(prompt, aiConfig)
                .map(this::extractPolishedContent);
        })
        .doOnSubscribe(subscription -> log.info("开始润色文章片段，AI服务: AI Foundation"))
        .onErrorMap(Exception.class, ex -> 
            new RuntimeException("文章润色失败: " + ex.getMessage(), ex));
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
        return response.trim();
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
            return new RuntimeException("AI 基座认证失败，请检查所选模型或模型提供方配置");
        }
        
        if (lowerMessage.contains("rate limit") || lowerMessage.contains("429")) {
            return new RuntimeException("AI 服务调用频率超限，请稍后重试");
        }
        
        if (lowerMessage.contains("connection") || lowerMessage.contains("连接")) {
            return new RuntimeException("网络连接失败，请检查网络设置");
        }
        
        if (lowerMessage.contains("forbidden") || lowerMessage.contains("403")) {
            return new RuntimeException("AI 基座访问被拒绝，请检查模型权限配置");
        }
        
        // 记录原始错误信息用于调试
        log.error("润色服务发生未知错误: {}", message, throwable);
        return new RuntimeException("文章润色服务暂时不可用，请稍后重试");
    }
}
