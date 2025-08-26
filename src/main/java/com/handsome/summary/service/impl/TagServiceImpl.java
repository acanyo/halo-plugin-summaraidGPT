package com.handsome.summary.service.impl;

import com.handsome.summary.service.AiServiceFactory;
import com.handsome.summary.service.SettingConfigGetter;
import com.handsome.summary.service.TagService;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

import static run.halo.app.extension.index.query.QueryFactory.in;

/**
 * 标签生成服务实现。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TagServiceImpl implements TagService {

    private final AiServiceFactory aiServiceFactory;
    private final SettingConfigGetter settingConfigGetter;
    private final PostContentService postContentService;
    private final ReactiveExtensionClient extensionClient;

    @Override
    public Mono<List<String>> generateTagsForPost(Post post) {
        return Mono.zip(
                settingConfigGetter.getBasicConfig(),
                settingConfigGetter.getTagsConfig()
        ).flatMap(tuple -> {
            var basic = tuple.getT1();
            var tagsCfg = tuple.getT2();

            int limit = tagsCfg.getTagGenerationCount() == null ? 4 : Math.max(1, tagsCfg.getTagGenerationCount());
            String role = tagsCfg.getTagGenerationPrompt();
            String roleText = (role == null || role.isBlank())
                ? "你是一个专业的标签生成助手，请根据文章内容生成相关的中文标签。标签应准确反映主题，适合SEO，建议2-4字。"
                : role.trim();

            return postContentService.getReleaseContent(post.getMetadata().getName())
                .flatMap(contentWrapper -> {
                    String prompt = "请你按照以下要求：" + roleText + "\n"
                        + "返回标签数量不超过" + limit
                        + "，仅返回中文标签，使用逗号或换行分隔，不要编号与解释。\n"
                        + "文章正文如下：\n"
                        + contentWrapper.getContent();

                    var ai = aiServiceFactory.getService(basic.getModelType());
                    String raw = ai.chatCompletionRaw(prompt, basic);
                    List<String> tags = parseTagsFromRaw(raw, limit);
                    return Mono.just(tags);
                })
                .onErrorResume(e -> {
                    log.error("生成标签失败: {}", e.getMessage(), e);
                    return Mono.just(List.of());
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
                    .collect(java.util.stream.Collectors.toSet());

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
        String content = extractContent(raw);
        if (content == null) {
            content = raw;
        }
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
    public static String extractContent(String raw) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(raw);
            var choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                var content = choices.get(0).path("message").path("content");
                if (!content.isMissingNode()) {
                    return content.asText();
                }
            }
        } catch (Exception ignore) {
        }
        return null;
    }
}




