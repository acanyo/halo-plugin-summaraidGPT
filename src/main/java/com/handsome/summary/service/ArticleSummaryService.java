package com.handsome.summary.service;

import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;

/**
 * 文章摘要服务接口
 * 提供根据文章内容获取摘要的功能
 *
 * @author handsome
 */
public interface ArticleSummaryService {

    /**
     * 根据文章内容生成摘要
     *
     * @param content 文章内容
     * @return 摘要内容
     */
    Mono<String> generateSummary(String content);

    /**
     * 根据文章内容生成摘要并保存到Summary表
     *
     * @param content 文章内容
     * @param post 文章对象
     * @return 摘要内容
     */
    Mono<String> generateSummaryAndSave(String content, Post post);
} 