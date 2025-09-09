package com.handsome.summary.service;

import reactor.core.publisher.Mono;

/**
 * 文章生成服务接口
 * <p>
 * 提供AI驱动的文章生成功能，支持多种生成类型和写作风格
 * </p>
 * 
 * @author handsome
 * @since 3.1.0
 */
public interface ArticleGenerateService {
    
    /**
     * 生成文章内容
     * 
     * @param request 文章生成请求
     * @return 生成的文章内容
     */
    Mono<GenerateResponse> generateArticle(GenerateRequest request);
    
    
    
    /**
     * 文章生成请求
     */
    record GenerateRequest(
        String topic,           // 文章主题
        String format,          // 内容格式 (markdown/html)
        String style,           // 写作风格
        String type,            // 生成类型
        Integer maxLength       // 最大长度
    ) {}
    
    
    /**
     * 生成响应
     */
    record GenerateResponse(
        boolean success,       // 是否成功
        String content,        // 生成内容
        String message,        // 消息
        String type,           // 生成类型
        Integer length         // 内容长度
    ) {
        public static GenerateResponse success(String content, String type) {
            return new GenerateResponse(true, content, "生成成功", type, content.length());
        }
        
        public static GenerateResponse error(String message) {
            return new GenerateResponse(false, "", message, "", 0);
        }
    }
}
