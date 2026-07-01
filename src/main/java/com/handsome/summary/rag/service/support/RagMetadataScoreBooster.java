package com.handsome.summary.rag.service.support;

import com.handsome.summary.rag.model.RagSearchResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.util.StringUtils;

public final class RagMetadataScoreBooster {

    private RagMetadataScoreBooster() {
    }

    public static List<RagSearchResult> apply(List<RagSearchResult> results,
        RagSearchQuery searchQuery) {
        if (results == null || results.isEmpty() || searchQuery.metadataTerms().isEmpty()) {
            return results == null ? List.of() : results;
        }
        return results.stream()
            .map(result -> apply(result, searchQuery.metadataTerms()))
            .toList();
    }

    private static RagSearchResult apply(RagSearchResult result, List<String> terms) {
        var boost = metadataBoost(result, terms);
        if (boost <= 0) {
            return result;
        }
        return result.toBuilder()
            .score(result.getScore() * (1.0d + boost))
            .metadata(mergeMetadata(result.getMetadata(), boost))
            .build();
    }

    private static double metadataBoost(RagSearchResult result, List<String> terms) {
        if (result == null) {
            return 0;
        }
        var metadata = result.getMetadata();
        var boost = 0.0d;
        if (containsAny(result.getTitle(), terms)) {
            boost += 0.10d;
        }
        if (containsAny(metadataText(metadata, "tags"), terms)) {
            boost += 0.12d;
        }
        if (containsAny(metadataText(metadata, "categories"), terms)) {
            boost += 0.10d;
        }
        if (containsAny(defaultString(result.getSourceName()) + " "
            + metadataText(metadata, "sourceName"), terms)) {
            boost += 0.06d;
        }
        if (containsAny(defaultString(result.getSourceType()) + " "
            + metadataText(metadata, "sourceType"), terms)) {
            boost += 0.04d;
        }
        if (containsAny(metadataText(metadata, "knowledgeBaseDisplayName") + " "
            + metadataText(metadata, "knowledgeBaseDescription"), terms)) {
            boost += 0.06d;
        }
        return Math.min(boost, 0.28d);
    }

    private static boolean containsAny(String text, List<String> terms) {
        if (!StringUtils.hasText(text)) {
            return false;
        }
        return terms.stream().anyMatch(term -> containsTerm(text, term));
    }

    private static boolean containsTerm(String text, String term) {
        if (!StringUtils.hasText(text) || !StringUtils.hasText(term)) {
            return false;
        }
        return text.toLowerCase(Locale.ROOT).contains(term.strip().toLowerCase(Locale.ROOT));
    }

    private static String metadataText(Map<String, Object> metadata, String key) {
        if (metadata == null || !metadata.containsKey(key)) {
            return "";
        }
        var value = metadata.get(key);
        if (value instanceof Iterable<?> iterable) {
            var text = new StringBuilder();
            for (var item : iterable) {
                if (item != null && StringUtils.hasText(String.valueOf(item))) {
                    if (!text.isEmpty()) {
                        text.append(' ');
                    }
                    text.append(item);
                }
            }
            return text.toString();
        }
        return value == null ? "" : String.valueOf(value);
    }

    private static Map<String, Object> mergeMetadata(Map<String, Object> metadata, double boost) {
        var merged = new LinkedHashMap<String, Object>();
        if (metadata != null) {
            metadata.forEach((key, value) -> {
                if (key != null && value != null) {
                    merged.put(key, value);
                }
            });
        }
        merged.put("metadataBoost", Math.round(boost * 1000.0d) / 1000.0d);
        return Map.copyOf(merged);
    }

    private static String defaultString(String value) {
        return value == null ? "" : value;
    }
}
