package com.handsome.summary.rag.service.support;

import com.handsome.summary.rag.model.RagSourceReference;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.util.StringUtils;

public final class RagReferencedSourceFilter {

    private static final int MAX_REFERENCED_SOURCES = 3;
    private static final Pattern CITATION_INDEX = Pattern.compile("(?:\\[|【)(\\d{1,2})(?:]|】)");

    private RagReferencedSourceFilter() {
    }

    public static List<RagSourceReference> filter(String answer, List<RagSourceReference> sources) {
        if (sources == null || sources.isEmpty()) {
            return List.of();
        }
        var safeSources = sources.stream()
            .filter(source -> source != null && StringUtils.hasText(source.getTitle()))
            .toList();
        if (safeSources.isEmpty()) {
            return List.of();
        }
        var normalizedAnswer = normalize(answer);
        if (!StringUtils.hasText(normalizedAnswer)) {
            return List.of();
        }
        var referencedSources = byCitationIndexes(answer, safeSources);
        if (!referencedSources.isEmpty()) {
            return referencedSources;
        }
        referencedSources = byExactTitle(normalizedAnswer, safeSources);
        if (!referencedSources.isEmpty()) {
            return referencedSources;
        }
        return safeSources.size() == 1 ? safeSources : List.of();
    }

    private static List<RagSourceReference> byCitationIndexes(String answer,
        List<RagSourceReference> sources) {
        var matcher = CITATION_INDEX.matcher(answer == null ? "" : answer);
        var referencedSources = new ArrayList<RagSourceReference>();
        while (matcher.find() && referencedSources.size() < MAX_REFERENCED_SOURCES) {
            var index = Integer.parseInt(matcher.group(1)) - 1;
            if (index < 0 || index >= sources.size()) {
                continue;
            }
            var source = sources.get(index);
            if (!referencedSources.contains(source)) {
                referencedSources.add(source);
            }
        }
        return List.copyOf(referencedSources);
    }

    private static List<RagSourceReference> byExactTitle(String normalizedAnswer,
        List<RagSourceReference> sources) {
        var compactAnswer = compact(normalizedAnswer);
        return sources.stream()
            .filter(source -> {
                var compactTitle = compact(normalize(source.getTitle()));
                return compactTitle.length() >= 4 && compactAnswer.contains(compactTitle);
            })
            .limit(MAX_REFERENCED_SOURCES)
            .toList();
    }

    private static String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value
            .replace('《', ' ')
            .replace('》', ' ')
            .replaceAll("[\\p{Punct}\\p{P}\\s]+", " ")
            .toLowerCase(Locale.ROOT)
            .strip();
    }

    private static String compact(String value) {
        return value == null ? "" : value.replace(" ", "");
    }
}
