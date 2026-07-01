package com.handsome.summary.agent.service;

import com.handsome.summary.agent.model.AgentSettings;
import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.model.RagSourceReference;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.rag.service.support.RagSourceReferenceAssembler;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ReactiveExtensionClient;

@Component
@RequiredArgsConstructor
public class RagAgentToolService {

    public static final String TYPE_RAG_DOCUMENT = "ragdocument.summaraidgpt.lik.cc";

    private final RagSearchService ragSearchService;
    private final ReactiveExtensionClient client;

    public Mono<Object> searchRagResources(Map<String, Object> input, AgentSettings settings) {
        var keyword = firstText(stringInput(input, "keyword"), stringInput(input, "query"));
        if (!StringUtils.hasText(keyword)) {
            return Mono.just(failure("INVALID_INPUT", "keyword is required"));
        }
        var knowledgeBase = stringInput(input, "knowledgeBase");
        var limit = limit(input, settings.ragSearch().normalizedDefaultLimit(), 1, 20);
        return ragSearchService.search(knowledgeBase, keyword, limit)
            .map(RagSourceReferenceAssembler::fromSearchResults)
            .map(sources -> Map.of(
                "ok", true,
                "keyword", keyword,
                "resources", sources.stream()
                    .map(source -> fromSource(source, settings.ragSearch().normalizedMaxContentChars()))
                    .toList()
            ));
    }

    public Mono<Object> getRagResourceDetail(Map<String, Object> input, AgentSettings settings) {
        var resourceId = stringInput(input, "resourceId");
        if (!StringUtils.hasText(resourceId)) {
            return Mono.just(failure("INVALID_INPUT", "resourceId is required"));
        }
        var parts = resourceId.split(":", 2);
        if (parts.length != 2 || !"rag".equals(parts[0])) {
            return Mono.just(failure("INVALID_RESOURCE", "resourceId is invalid"));
        }
        var maxChars = settings.ragSearch().normalizedMaxContentChars();
        return client.fetch(RagDocument.class, parts[1])
            .filter(this::isAvailable)
            .map(document -> {
                var spec = document.getSpec();
                var content = excerpt(spec.getContent(), maxChars);
                return Map.of(
                    "ok", true,
                    "resource", resource(
                        "rag:" + document.getMetadata().getName(),
                        TYPE_RAG_DOCUMENT,
                        document.getMetadata().getName(),
                        spec.getTitle(),
                        excerpt(spec.getContent(), 220),
                        spec.getUrl()
                    ),
                    "content", content,
                    "truncated", content.length() >= maxChars
                );
            })
            .cast(Object.class)
            .defaultIfEmpty(failure("RESOURCE_NOT_FOUND", "RAG resource is not available"));
    }

    private Map<String, Object> fromSource(RagSourceReference source, int maxContentChars) {
        var documentName = metadataString(source, "documentName");
        var content = metadataString(source, "content");
        return resource(
            "rag:" + firstText(documentName, source.getId()),
            TYPE_RAG_DOCUMENT,
            firstText(documentName, source.getId()),
            source.getTitle(),
            excerpt(content, Math.min(maxContentChars, 1200)),
            source.getUrl()
        );
    }

    private Map<String, Object> resource(String id, String type, String metadataName, String title,
        String excerpt, String permalink) {
        return Map.of(
            "resourceId", id,
            "resourceType", type,
            "metadataName", defaultString(metadataName),
            "title", defaultString(title),
            "excerpt", defaultString(excerpt),
            "permalink", defaultString(permalink)
        );
    }

    private boolean isAvailable(RagDocument document) {
        return document != null
            && document.getSpec() != null
            && Boolean.TRUE.equals(document.getSpec().getEnabled());
    }

    private Map<String, Object> failure(String code, String message) {
        return Map.of("ok", false, "errorCode", code, "message", message);
    }

    private int limit(Map<String, Object> input, int defaultValue, int min, int max) {
        var value = input == null ? null : input.get("limit");
        int parsed = value instanceof Number number ? number.intValue() : defaultValue;
        return Math.max(min, Math.min(max, parsed));
    }

    private String stringInput(Map<String, Object> input, String key) {
        var value = input == null ? null : input.get(key);
        return value == null ? null : trimToNull(String.valueOf(value));
    }

    private String metadataString(RagSourceReference source, String key) {
        if (source == null || source.getMetadata() == null) {
            return null;
        }
        var value = source.getMetadata().get(key);
        return value == null ? null : String.valueOf(value);
    }

    private String excerpt(String content, int maxChars) {
        var text = defaultString(content).replaceAll("\\s+", " ").trim();
        if (text.length() <= maxChars) {
            return text;
        }
        return text.substring(0, maxChars);
    }

    private String firstText(String... values) {
        for (var value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
