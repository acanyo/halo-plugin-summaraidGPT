package com.handsome.summary.service;

import run.halo.app.core.extension.content.Post;
import reactor.core.publisher.Mono;

/**
 * 文章摘要服务接口。
 * <p>
 * 用于获取指定文章的AI摘要，便于业务层调用和扩展。
 * </p>
 */
public interface ArticleSummaryService {
    /**
     * 获取指定文章的AI摘要（响应式）。
     * @param post 文章对象（包含ID、内容、标题等）
     * @return Mono包裹的AI生成的文章摘要内容（可为纯文本或结构化JSON，具体由实现决定）
     */
    Mono<String> getSummary(Post post);
} 