package com.handsome.summary.service;

import java.util.List;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;

/**
 * 标签生成服务接口。
 * <p>
 * 基于文章内容与配置（{@link SettingConfigGetter.TagsConfig}）调用大模型生成推荐标签。
 * </p>
 */
public interface TagService {
    
    /**
     * 标签生成结果，包含标签来源信息
     */
    record TagGenerationResult(
        List<TagInfo> tags,
        int totalCount,
        int existingCount,
        int newCount
    ) {
        public static TagGenerationResult empty() {
            return new TagGenerationResult(List.of(), 0, 0, 0);
        }
    }
    
    /**
     * 单个标签信息
     */
    record TagInfo(
        String name,
        boolean isExisting
    ) {}
    
    /**
     * 基于文章内容生成标签列表。
     * @param post Halo 文章对象
     * @return Mono 包裹的标签字符串列表
     */
    Mono<List<String>> generateTagsForPost(Post post);
    
    /**
     * 基于文章内容生成标签列表，包含标签来源信息。
     * @param post Halo 文章对象
     * @return Mono 包裹的标签生成结果（包含已有/新增标识）
     */
    Mono<TagGenerationResult> generateTagsWithSourceInfo(Post post);

    /**
     * 生成标签并在 Halo 中确保同名（displayName）标签模型存在（不存在则创建）。
     * 仅创建标签模型，不修改文章与标签的关联关系。
     * @param post Halo 文章对象
     * @return Mono 已生成（并确保存在的）标签列表
     */
    Mono<List<String>> generateAndEnsureTagsForPost(Post post);
}


