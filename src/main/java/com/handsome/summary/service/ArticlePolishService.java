package com.handsome.summary.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

/**
 * 文章润色服务
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
    
    /**
     * 润色文章片段
     * 
     * @param content 需要润色的文章片段
     * @return 润色后的文章内容
     */
    public Mono<String> polishArticleSegment(String content) {
        if (!StringUtils.hasText(content)) {
            return Mono.error(new IllegalArgumentException("文章内容不能为空"));
        }
        
        return settingConfigGetter.getPolishConfig()
            .flatMap(polishConfig -> validateAndPolish(content, polishConfig))
            .doOnNext(polishedContent -> 
                log.info("文章润色完成，原文长度: {}, 润色后长度: {}", 
                    content.length(), polishedContent.length()))
            .onErrorMap(this::mapPolishError);
    }
    
    /**
     * 验证内容长度并进行润色
     */
    private Mono<String> validateAndPolish(String content, SettingConfigGetter.PolishConfig polishConfig) {
        // 检查内容长度
        Integer maxLength = polishConfig.getPolishMaxLength();
        if (maxLength != null && content.length() > maxLength) {
            return Mono.error(new IllegalArgumentException(
                String.format("内容长度(%d)超过最大限制(%d)，请分段润色", content.length(), maxLength)));
        }
        
        // 获取AI配置并进行润色
        return settingConfigGetter.getAiConfigForFunction("polish")
            .switchIfEmpty(Mono.error(new RuntimeException("未找到可用的AI配置")))
            .flatMap(aiConfigResult -> polishWithAi(content, polishConfig, aiConfigResult));
    }
    
    /**
     * 使用AI服务润色文章
     */
    private Mono<String> polishWithAi(String content, SettingConfigGetter.PolishConfig polishConfig, 
                                     SettingConfigGetter.AiConfigResult aiConfigResult) {
        return Mono.fromCallable(() -> {
            AiService aiService = aiServiceFactory.getService(aiConfigResult.getAiType());
            if (aiService == null) {
                throw new IllegalArgumentException("不支持的AI服务类型: " + aiConfigResult.getAiType());
            }
            
            // 构建润色提示词
            String prompt = buildPolishPrompt(content, polishConfig);
            
            // 构建BasicConfig
            SettingConfigGetter.BasicConfig basicConfig = new SettingConfigGetter.BasicConfig();
            basicConfig.setGlobalAiType(aiConfigResult.getAiType());
            
            // 调用AI服务
            String response = aiService.chatCompletionRaw(prompt, basicConfig);
            return extractPolishedContent(response);
        })
        .doOnSubscribe(subscription -> log.info("开始润色文章片段，AI服务: {}", aiConfigResult.getAiType()))
        .onErrorMap(Exception.class, ex -> 
            new RuntimeException("文章润色失败: " + ex.getMessage(), ex));
    }
    
    /**
     * 构建润色提示词
     */
    private String buildPolishPrompt(String content, SettingConfigGetter.PolishConfig polishConfig) {
        String systemPrompt = polishConfig.getPolishSystemPrompt();
        if (!StringUtils.hasText(systemPrompt)) {
            systemPrompt = "你是一个专业的文章润色助手，请改善以下文章的语言表达和流畅性，保持原意不变。";
        }
        
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(systemPrompt).append("\n\n");
        
        if (Boolean.TRUE.equals(polishConfig.getPolishPreserveParagraphs())) {
            promptBuilder.append("请保持原文的段落结构。\n\n");
        }
        
        promptBuilder.append("需要润色的内容：\n");
        promptBuilder.append(content);
        promptBuilder.append("\n\n请直接返回润色后的内容：");
        
        return promptBuilder.toString();
    }
    
    /**
     * 从AI响应中提取润色后的内容
     */
    private String extractPolishedContent(String response) {
        // 简单的字符串解析，查找常见的JSON响应格式
        String content = extractContentFromJsonString(response);
        
        if (!StringUtils.hasText(content)) {
            log.warn("AI响应中未找到有效内容，返回原始响应");
            return response;
        }
        
        return content.trim();
    }
    
    /**
     * 从JSON字符串中提取内容（简单解析）
     */
    private String extractContentFromJsonString(String jsonString) {
        try {
            // 尝试提取 "content" 字段
            String contentPattern = "\"content\"\\s*:\\s*\"([^\"]+)\"";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(contentPattern);
            java.util.regex.Matcher matcher = pattern.matcher(jsonString);
            
            if (matcher.find()) {
                String content = matcher.group(1);
                // 处理转义字符
                content = content.replace("\\n", "\n")
                               .replace("\\t", "\t")
                               .replace("\\\"", "\"")
                               .replace("\\\\", "\\");
                return content;
            }
            
            // 尝试提取 "text" 字段
            String textPattern = "\"text\"\\s*:\\s*\"([^\"]+)\"";
            pattern = java.util.regex.Pattern.compile(textPattern);
            matcher = pattern.matcher(jsonString);
            
            if (matcher.find()) {
                String content = matcher.group(1);
                content = content.replace("\\n", "\n")
                               .replace("\\t", "\t")
                               .replace("\\\"", "\"")
                               .replace("\\\\", "\\");
                return content;
            }
            
            // 如果都找不到，检查是否是纯文本响应
            if (!jsonString.trim().startsWith("{")) {
                return jsonString.trim();
            }
            
        } catch (Exception e) {
            log.warn("解析AI响应时出错: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * 映射润色错误
     */
    private Throwable mapPolishError(Throwable throwable) {
        if (throwable instanceof IllegalArgumentException) {
            return throwable;
        }
        
        String message = throwable.getMessage();
        if (message != null) {
            if (message.contains("timeout") || message.contains("超时")) {
                return new RuntimeException("AI服务响应超时，请稍后重试");
            }
            if (message.contains("unauthorized") || message.contains("401")) {
                return new RuntimeException("API密钥无效，请检查配置");
            }
            if (message.contains("rate limit") || message.contains("429")) {
                return new RuntimeException("API调用频率超限，请稍后重试");
            }
        }
        
        return new RuntimeException("文章润色服务暂时不可用，请稍后重试");
    }
}
