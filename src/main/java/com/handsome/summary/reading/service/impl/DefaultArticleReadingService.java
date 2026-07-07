package com.handsome.summary.reading.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.reading.extension.ArticleReading;
import com.handsome.summary.reading.extension.ArticleReadingInteraction;
import com.handsome.summary.reading.model.ArticleReadingInteractionCommand;
import com.handsome.summary.reading.model.ArticleReadingSource;
import com.handsome.summary.reading.service.ArticleReadingContentLoader;
import com.handsome.summary.reading.service.ArticleReadingJsonParser;
import com.handsome.summary.reading.service.ArticleReadingPromptFactory;
import com.handsome.summary.reading.service.ArticleReadingService;
import com.handsome.summary.reading.support.ArticleReadingHash;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.SettingConfigGetter;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.router.selector.FieldSelector;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultArticleReadingService implements ArticleReadingService {

    private static final Duration READING_GENERATION_TIMEOUT = Duration.ofSeconds(75);
    private static final Set<String> REQUIRED_NODE_IDS = Set.of(
        "tl-background", "dl-problem-source", "dl-current-status",
        "tl-core", "dl-key-judgment", "dl-author-claim",
        "tl-argument", "dl-data-fact", "dl-case",
        "tl-conclusion", "dl-advice", "dl-follow-up"
    );

    private final AiFoundationAiService aiFoundationAiService;
    private final ArticleReadingContentLoader contentLoader;
    private final ArticleReadingJsonParser jsonParser;
    private final ArticleReadingPromptFactory promptFactory;
    private final ReactiveExtensionClient client;
    private final SettingConfigGetter settingConfigGetter;
    private final Set<String> generationInFlight = ConcurrentHashMap.newKeySet();

    @Override
    public Mono<ArticleReading> getExisting(String postName) {
        return findByPostName(normalizePostName(postName))
            .filter(reading -> hasCompleteGraph(reading.getSpec()))
            .switchIfEmpty(Mono.error(() -> new IllegalArgumentException("洞察图谱尚未生成或需要重建")));
    }

    @Override
    public Mono<ArticleReading> getOrGenerate(String postName, boolean refresh) {
        return contentLoader.load(normalizePostName(postName))
            .flatMap(source -> {
                if (refresh) {
                    return generateAndSave(source);
                }
                return findByPostName(source.postName())
                    .filter(reading -> isCurrent(reading, source))
                    .switchIfEmpty(Mono.defer(() -> generateAndSave(source)));
            });
    }

    @Override
    public Mono<ArticleReading> ensureGenerated(String postName) {
        var normalizedPostName = normalizePostName(postName);
        if (!generationInFlight.add(normalizedPostName)) {
            return Mono.empty();
        }
        return getOrGenerate(normalizedPostName, false)
            .doFinally(signalType -> generationInFlight.remove(normalizedPostName));
    }

    @Override
    public Mono<ArticleReadingInteraction> recordInteraction(
        ArticleReadingInteractionCommand command) {
        var normalized = normalizeInteractionCommand(command);
        var interaction = new ArticleReadingInteraction();
        var metadata = new Metadata();
        metadata.setGenerateName("reading-interaction-");
        interaction.setMetadata(metadata);

        var spec = new ArticleReadingInteraction.Spec();
        spec.setPostMetadataName(normalized.postName());
        spec.setNodeId(normalized.nodeId());
        spec.setInteractionType(normalized.interactionType());
        spec.setValue(normalized.value());
        spec.setVisitorId(normalized.visitorId());
        spec.setCreatedAt(Instant.now());
        interaction.setSpec(spec);

        return client.create(interaction);
    }

    private Mono<ArticleReading> generateAndSave(ArticleReadingSource source) {
        if (!StringUtils.hasText(source.content())) {
            return Mono.error(new IllegalArgumentException("文章正文为空，无法生成洞察图谱"));
        }
        return settingConfigGetter.getAiConfigForFunction("articleReading")
            .flatMap(aiConfig -> aiFoundationAiService.generateText(
                    promptFactory.create(source, aiConfig.getSystemPrompt()), aiConfig)
                .timeout(READING_GENERATION_TIMEOUT)
                .map(aiResponse -> buildReading(source, aiConfig, aiResponse)))
            .onErrorResume(error -> {
                log.warn("洞察图谱 AI 生成失败，使用本地结构 fallback，文章: {}, 错误: {}",
                    source.postName(), error.getMessage());
                return settingConfigGetter.getAiConfigForFunction("articleReading")
                    .map(aiConfig -> buildFallbackReading(source, aiConfig));
            })
            .flatMap(this::upsert)
            .doOnSuccess(reading -> log.info("洞察图谱已生成，文章: {}", source.postName()));
    }

    private ArticleReading buildReading(ArticleReadingSource source,
        SettingConfigGetter.AiConfigResult aiConfig, String aiResponse) {
        var reading = new ArticleReading();
        var metadata = new Metadata();
        metadata.setName(readingName(source.postName()));
        reading.setMetadata(metadata);

        var spec = jsonParser.parse(aiResponse, source.title(), source.content());
        spec.setPostMetadataName(source.postName());
        spec.setPostTitle(source.title());
        spec.setPostUrl(source.url());
        spec.setContentHash(source.contentHash());
        spec.setModelName(aiConfig == null ? null : aiConfig.getModelName());
        spec.setGeneratedAt(Instant.now());
        reading.setSpec(spec);
        return reading;
    }

    private ArticleReading buildFallbackReading(ArticleReadingSource source,
        SettingConfigGetter.AiConfigResult aiConfig) {
        var reading = new ArticleReading();
        var metadata = new Metadata();
        metadata.setName(readingName(source.postName()));
        reading.setMetadata(metadata);

        var spec = jsonParser.fallback(source.title(), source.content());
        spec.setPostMetadataName(source.postName());
        spec.setPostTitle(source.title());
        spec.setPostUrl(source.url());
        spec.setContentHash(source.contentHash());
        spec.setModelName(aiConfig == null ? null : aiConfig.getModelName());
        spec.setGeneratedAt(Instant.now());
        reading.setSpec(spec);
        return reading;
    }

    private Mono<ArticleReading> upsert(ArticleReading reading) {
        var name = reading.getMetadata().getName();
        return client.fetch(ArticleReading.class, name)
            .flatMap(existing -> {
                existing.setSpec(reading.getSpec());
                return client.update(existing);
            })
            .switchIfEmpty(Mono.defer(() -> client.create(reading)));
    }

    private Mono<ArticleReading> findByPostName(String postName) {
        var listOptions = new ListOptions();
        listOptions.setFieldSelector(FieldSelector.of(
            equal("spec.postMetadataName", normalizePostName(postName))
        ));
        return client.listAll(ArticleReading.class, listOptions, Sort.unsorted()).next();
    }

    private boolean isCurrent(ArticleReading reading, ArticleReadingSource source) {
        return reading != null
            && reading.getSpec() != null
            && source.contentHash().equals(reading.getSpec().getContentHash())
            && hasCompleteGraph(reading.getSpec());
    }

    private boolean hasCompleteGraph(ArticleReading.Spec spec) {
        if (spec.getSchemaVersion() == null
            || spec.getSchemaVersion() < ArticleReadingJsonParser.SCHEMA_VERSION
            || spec.getRoot() == null || spec.getNodes() == null || spec.getEdges() == null) {
            return false;
        }
        var nodeIds = new java.util.HashSet<String>();
        if (StringUtils.hasText(spec.getRoot().getId())) {
            nodeIds.add(spec.getRoot().getId());
        }
        spec.getNodes().stream()
            .map(ArticleReading.InsightNode::getId)
            .filter(StringUtils::hasText)
            .forEach(nodeIds::add);
        if (!nodeIds.containsAll(REQUIRED_NODE_IDS)) {
            return false;
        }
        return spec.getEdges().stream()
            .anyMatch(edge -> "root".equals(edge.getFrom()) && "tl-background".equals(edge.getTo()))
            && spec.getEdges().stream()
            .anyMatch(edge -> "root".equals(edge.getFrom()) && "tl-core".equals(edge.getTo()))
            && spec.getEdges().stream()
            .anyMatch(edge -> "root".equals(edge.getFrom()) && "tl-argument".equals(edge.getTo()))
            && spec.getEdges().stream()
            .anyMatch(edge -> "root".equals(edge.getFrom()) && "tl-conclusion".equals(edge.getTo()));
    }

    private ArticleReadingInteractionCommand normalizeInteractionCommand(
        ArticleReadingInteractionCommand command) {
        if (command == null) {
            throw new IllegalArgumentException("互动参数不能为空");
        }
        return new ArticleReadingInteractionCommand(
            normalizePostName(command.postName()),
            normalizeText(command.nodeId(), "root", 80),
            normalizeInteractionType(command.interactionType()),
            normalizeText(command.value(), "", 80),
            normalizeText(command.visitorId(), "", 120)
        );
    }

    private String normalizeInteractionType(String type) {
        var value = normalizeText(type, "feedback", 32);
        return switch (value) {
            case "feedback", "favorite", "ask" -> value;
            default -> "feedback";
        };
    }

    private String normalizeText(String value, String fallback, int maxLength) {
        var text = StringUtils.hasText(value) ? value.strip() : fallback;
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    private String normalizePostName(String postName) {
        if (!StringUtils.hasText(postName)) {
            throw new IllegalArgumentException("文章名称不能为空");
        }
        return postName.strip();
    }

    private String readingName(String postName) {
        return "article-reading-" + ArticleReadingHash.sha256(postName).substring(0, 24);
    }
}
