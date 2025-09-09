package com.handsome.summary.service;

import reactor.core.publisher.Mono;

/**
 * 文章标题生成服务接口
 * 
 * @author Handsome
 * @since 3.1.0
 */
public interface ArticleTitleService {
    
    /**
     * 生成文章标题
     * 
     * @param request 标题生成请求
     * @return 标题生成响应
     */
    Mono<TitleResponse> generateTitle(TitleRequest request);
    
    /**
     * 标题生成请求
     */
    record TitleRequest(
        String content,
        String style,
        Integer count
    ) {}
    
    /**
     * 标题生成响应
     */
    record TitleResponse(
        boolean success,
        String content,
        String message
    ) {
        public static TitleResponse success(String content) {
            return new TitleResponse(true, content, "标题生成成功");
        }
        
        public static TitleResponse error(String message) {
            return new TitleResponse(false, "", message);
        }
    }
}
