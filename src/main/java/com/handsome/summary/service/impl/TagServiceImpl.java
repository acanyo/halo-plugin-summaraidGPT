package com.handsome.summary.service.impl;


import com.handsome.summary.service.AiConfigService;
import com.handsome.summary.service.AiServiceUtils;
import com.handsome.summary.service.SettingConfigGetter;
import com.handsome.summary.service.TagService;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.content.Tag;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.router.selector.FieldSelector;

import static run.halo.app.extension.index.query.Queries.in;

/**
 * 标签生成服务实现。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TagServiceImpl implements TagService {

    private final AiConfigService aiConfigService;
    private final PostContentService postContentService;
    private final ReactiveExtensionClient extensionClient;
    private final SettingConfigGetter settingConfigGetter;

    /**
     * 获取所有已有标签的 displayName 列表
     */
    private Mono<Set<String>> getAllExistingTagNames() {
        return extensionClient.listAll(Tag.class, new ListOptions(), Sort.unsorted())
            .map(tag -> tag.getSpec().getDisplayName())
            .filter(name -> name != null && !name.isBlank())
            .collect(Collectors.toSet());
    }

    @Override
    public Mono<List<String>> generateTagsForPost(Post post) {
        return generateTagsWithSourceInfo(post)
            .map(result -> result.tags().stream()
                .map(TagInfo::name)
                .toList());
    }
    
    @Override
    public Mono<TagGenerationResult> generateTagsWithSourceInfo(Post post) {
        return Mono.zip(
                aiConfigService.getAiConfigForFunction("tags"),
                aiConfigService.getAiServiceForFunction("tags"),
                settingConfigGetter.getTagsConfig(),
                getAllExistingTagNames()
        ).flatMap(tuple -> {
            var aiConfig = tuple.getT1();
            var aiService = tuple.getT2();
            var tagsConfig = tuple.getT3();
            var existingTagNames = tuple.getT4();

            // 从配置获取标签数量，默认为6
            int limit = tagsConfig.getTagGenerationCount() != null ? tagsConfig.getTagGenerationCount() : 6;
            log.info("标签生成数量配置: {}", limit);
            
            var ref = new Object() {
                String roleText = aiConfig.getSystemPrompt();
            };
            if (ref.roleText == null || ref.roleText.isBlank()) {
                ref.roleText = "你是一个专业的标签生成助手，请根据文章内容生成相关的中文标签。标签应准确反映主题，适合SEO，建议2-4字。";
            }

            return postContentService.getHeadContent(post.getMetadata().getName())
                .doOnNext(contentWrapper -> log.info("获取到文章内容，长度: {}", 
                    contentWrapper.getContent() != null ? contentWrapper.getContent().length() : 0))
                .flatMap(contentWrapper -> {
                    String content = contentWrapper.getContent();
                    if (content == null || content.trim().isEmpty()) {
                        return Mono.just(TagGenerationResult.empty());
                    }
                    
                    // 构建包含已有标签的提示词
                    StringBuilder promptBuilder = new StringBuilder();
                    promptBuilder.append("请你按照以下要求：").append(ref.roleText).append("\n");
                    promptBuilder.append("请你给我符合文章内容的").append(limit).append("个标签");
                    promptBuilder.append("，仅返回中文标签，使用逗号或换行分隔，不要编号与解释。\n");
                    
                    // 添加已有标签提示
                    if (!existingTagNames.isEmpty()) {
                        promptBuilder.append("\n【重要】系统中已有以下标签，请优先从中选择合适的标签，只有当已有标签完全不匹配时才创建新标签：\n");
                        promptBuilder.append(String.join("、", existingTagNames));
                        promptBuilder.append("\n\n");
                    }
                    
                    promptBuilder.append("文章正文如下：\n").append(content);
                    
                    String prompt = promptBuilder.toString();
                    log.info("开始调用AI生成标签，AI类型: {}, 提示词长度: {}, 已有标签数: {}", 
                        aiConfig.getAiType(), prompt.length(), existingTagNames.size());
                    
                    // 创建兼容的BasicConfig
                    var compatibleConfig = aiConfigService.createCompatibleBasicConfig(aiConfig);
                    String raw = aiService.chatCompletionRaw(prompt, compatibleConfig);
                    log.info("AI返回原始响应: {}", raw);
                    
                    // 检查是否是错误信息
                    if (AiServiceUtils.isErrorMessage(raw)) {
                        return Mono.just(TagGenerationResult.empty());
                    }
                    
                    List<String> tagNames = parseTagsFromRaw(raw, limit);
                    log.info("解析后的标签: {}", tagNames);
                    
                    // 构建带来源信息的标签列表
                    List<TagInfo> tagInfoList = tagNames.stream()
                        .map(name -> new TagInfo(name, existingTagNames.contains(name)))
                        .toList();
                    
                    int existingCount = (int) tagInfoList.stream().filter(TagInfo::isExisting).count();
                    int newCount = tagInfoList.size() - existingCount;
                    
                    log.info("标签生成结果: 总数={}, 已有={}, 新增={}", tagInfoList.size(), existingCount, newCount);
                    
                    return Mono.just(new TagGenerationResult(tagInfoList, tagInfoList.size(), existingCount, newCount));
                })
                .onErrorResume(e -> {
                    log.error("生成标签失败: {}", e.getMessage(), e);
                    return Mono.just(TagGenerationResult.empty());
                });
        });
    }

    @Override
    public Mono<List<String>> generateAndEnsureTagsForPost(Post post) {
        return generateTagsForPost(post)
            .flatMap(this::ensureTagsExist)
            .map(EnsureResult::inputOrder)
            ;
    }

    /**
     * 确保一组标签（按 displayName）存在：
     * - 已存在：记录其 metadata.name，用于后续联动（此处仅日志）
     * - 不存在：创建之
     * 返回值包含：按输入顺序的标签名列表
     */
    private Mono<EnsureResult> ensureTagsExist(List<String> inputTags) {
        if (inputTags == null || inputTags.isEmpty()) {
            return Mono.just(new EnsureResult(List.of(), List.of(), List.of()));
        }

        // 去重并过滤空白
        var normalized = inputTags.stream()
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .toList();
        if (normalized.isEmpty()) {
            return Mono.just(new EnsureResult(List.of(), List.of(), List.of()));
        }

        // 查询已存在（spec.displayName IN ...）
        ListOptions options = new ListOptions();
        options.setFieldSelector(FieldSelector.of(in("spec.displayName", normalized)));

        return extensionClient.listAll(Tag.class, options, Sort.unsorted())
            .collectList()
            .flatMap(existingTags -> {
                var existingNames = existingTags.stream()
                    .map(t -> t.getSpec().getDisplayName())
                    .filter(n -> n != null && !n.isBlank())
                    .collect(Collectors.toSet());

                // 日志记录已存在标签的 metadata.name，便于联动
                existingTags.forEach(t -> {
                    var dn = t.getSpec().getDisplayName();
                    var mn = t.getMetadata() != null ? t.getMetadata().getName() : null;
                    log.info("已存在标签 - displayName: {}, metadata.name: {}", dn, mn);
                });

                var toCreate = normalized.stream()
                    .filter(n -> !existingNames.contains(n))
                    .toList();

                if (toCreate.isEmpty()) {
                    return Mono.just(new EnsureResult(normalized, existingNames.stream().toList(), List.of()));
                }

                // 并发创建缺失的标签
                return Flux.fromIterable(toCreate)
                    .flatMap(this::createTag, 4)
                    .collectList()
                    .map(created -> new EnsureResult(normalized, existingNames.stream().toList(), created))
                    ;
            });
    }

    private Mono<String> createTag(String displayName) {
        Tag tag = new Tag();
        Metadata metadata = new Metadata();
        metadata.setGenerateName("tag-");
        tag.setMetadata(metadata);
        Tag.TagSpec spec = new Tag.TagSpec();
        spec.setDisplayName(displayName);
        tag.setSpec(spec);
        return extensionClient.create(tag)
            .map(created -> created.getSpec().getDisplayName());
    }

    private record EnsureResult(List<String> inputOrder, List<String> existed, List<String> created) {}

    private List<String> parseTagsFromRaw(String raw, int limit) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        String content = AiServiceUtils.extractContentFromResponse(raw);
        String[] parts = content.replace("\r", "\n").split("[\n,，]");
        Set<String> cleaned = new LinkedHashSet<>();
        for (String p : parts) {
            if (p == null) continue;
            String s = p.trim();
            if (s.isEmpty()) continue;
            // 去除可能的序号、标点
            s = s.replaceAll("^[-•*\\d.、\u2022\u25CF\u25E6\u2023\u2043\u2219]+", "").trim();
            // 仅保留适度长度中文与常见词
            if (!s.isEmpty() && s.length() <= 12) {
                cleaned.add(s);
            }
            if (cleaned.size() >= limit) break;
        }
        return new ArrayList<>(cleaned);
    }

}




