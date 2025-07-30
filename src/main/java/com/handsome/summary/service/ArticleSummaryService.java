package com.handsome.summary.service;

import com.handsome.summary.extension.Summary;
import java.util.Map;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;

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
    /**
     * 根据 postMetadataName 查询摘要（只查不生成）
     */
    Flux<Summary> findSummaryByPostName(String postMetadataName);

    Mono<Map<String, Object>> updatePostContentWithSummary(String postMetadataName);

    Mono<Void> syncAllSummariesAsync();
    /**
     * 查询当前批量同步进度
     * @return Map 包含 total, finished
     */
    Mono<Map<String, Integer>> getSyncProgress();
} 