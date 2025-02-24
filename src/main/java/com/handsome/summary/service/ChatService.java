package com.handsome.summary.service;

import reactor.core.publisher.Mono;

/**
 * 获取百度token
 */
public interface ChatService {
    // /**
    //  * 获取百度token
    //  * @return token对象
    //  */
    // Mono<String> getAuthToken();

    /**
     * 获取文章摘要
     */
    Mono<String> getSummary(String articleContent);
}
