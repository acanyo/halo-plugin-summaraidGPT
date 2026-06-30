package com.handsome.summary.rag.service.support;

import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.model.RagSourceReference;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.util.StringUtils;
import run.halo.aifoundation.source.SourceReference;

public final class RagSourceReferenceAssembler {

    private static final int MAX_EXCERPT_CHARS = 1200;

    private RagSourceReferenceAssembler() {
    }

    public static List<RagSourceReference> fromSearchResults(List<RagSearchResult> sources) {
        if (sources == null || sources.isEmpty()) {
            return List.of();
        }
        var groupedSources = new LinkedHashMap<String, GroupedSource>();
        for (var source : sources) {
            if (source == null) {
                continue;
            }
            var key = documentKey(source);
            groupedSources.computeIfAbsent(key, ignored -> new GroupedSource(source))
                .add(source);
        }
        return groupedSources.values().stream()
            .map(GroupedSource::toReference)
            .toList();
    }

    public static List<RagSourceReference> fromSourceReferences(List<SourceReference> sources) {
        if (sources == null || sources.isEmpty()) {
            return List.of();
        }
        var groupedSources = new LinkedHashMap<String, GroupedSourceReference>();
        for (var source : sources) {
            if (source == null) {
                continue;
            }
            var key = sourceReferenceKey(source);
            groupedSources.computeIfAbsent(key, ignored -> new GroupedSourceReference(source))
                .add(source);
        }
        return groupedSources.values().stream()
            .map(GroupedSourceReference::toReference)
            .toList();
    }

    private static String documentKey(RagSearchResult source) {
        var metadataValue = metadataString(source, "documentName");
        if (StringUtils.hasText(metadataValue)) {
            return metadataValue;
        }
        if (StringUtils.hasText(source.getDocumentName())) {
            return source.getDocumentName();
        }
        if (StringUtils.hasText(source.getUrl())) {
            return source.getUrl();
        }
        if (StringUtils.hasText(source.getSourceName())) {
            return source.getSourceName();
        }
        return StringUtils.hasText(source.getId()) ? source.getId() : "unknown-source";
    }

    private static String metadataString(RagSearchResult source, String key) {
        var metadata = source.getMetadata();
        if (metadata == null) {
            return null;
        }
        var value = metadata.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private static String metadataString(SourceReference source, String key) {
        var metadata = source.getMetadata();
        if (metadata == null) {
            return null;
        }
        var value = metadata.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private static String sourceReferenceKey(SourceReference source) {
        var metadataValue = metadataString(source, "documentName");
        if (StringUtils.hasText(metadataValue)) {
            return metadataValue;
        }
        if (StringUtils.hasText(source.getUrl())) {
            return source.getUrl();
        }
        return StringUtils.hasText(source.getId()) ? source.getId() : "unknown-source";
    }

    private static String compactContent(String content) {
        if (!StringUtils.hasText(content)) {
            return "";
        }
        var text = content.replaceAll("\\s+", " ").strip();
        return text.length() > MAX_EXCERPT_CHARS ? text.substring(0, MAX_EXCERPT_CHARS) : text;
    }

    private static final class GroupedSource {
        private final RagSearchResult first;
        private final List<String> sourceIds = new ArrayList<>();
        private final List<String> chunkIndexes = new ArrayList<>();
        private final List<String> excerpts = new ArrayList<>();
        private double score;
        private int chunkCount;

        private GroupedSource(RagSearchResult first) {
            this.first = first;
            this.score = first.getScore();
        }

        private void add(RagSearchResult source) {
            chunkCount++;
            if (source.getScore() > score) {
                score = source.getScore();
            }
            if (StringUtils.hasText(source.getId())) {
                sourceIds.add(source.getId());
            }
            var chunkIndex = source.getChunkIndex() == null ? null : String.valueOf(source.getChunkIndex());
            if (StringUtils.hasText(chunkIndex)) {
                chunkIndexes.add(chunkIndex);
            }
            var excerpt = compactContent(source.getContent());
            if (StringUtils.hasText(excerpt)) {
                excerpts.add(excerpt);
            }
        }

        private RagSourceReference toReference() {
            var documentName = StringUtils.hasText(first.getDocumentName())
                ? first.getDocumentName()
                : documentKey(first);
            return RagSourceReference.builder()
                .id(documentName)
                .sourceType(first.getSourceType())
                .title(first.getTitle())
                .url(first.getUrl())
                .score(score)
                .metadata(Map.of(
                    "documentName", documentName,
                    "sourceName", defaultString(first.getSourceName()),
                    "chunkCount", chunkCount,
                    "chunkIndexes", chunkIndexes,
                    "sourceIds", sourceIds,
                    "content", String.join("\n\n", excerpts)
                ))
                .build();
        }

        private String defaultString(String value) {
            return value == null ? "" : value;
        }
    }

    private static final class GroupedSourceReference {
        private final SourceReference first;
        private final List<String> sourceIds = new ArrayList<>();
        private final List<String> chunkIndexes = new ArrayList<>();
        private double score;
        private int chunkCount;

        private GroupedSourceReference(SourceReference first) {
            this.first = first;
            this.score = first.getScore() == null ? 0 : first.getScore();
        }

        private void add(SourceReference source) {
            chunkCount++;
            if (source.getScore() != null && source.getScore() > score) {
                score = source.getScore();
            }
            if (StringUtils.hasText(source.getId())) {
                sourceIds.add(source.getId());
            }
            var chunkIndex = metadataString(source, "chunkIndex");
            if (StringUtils.hasText(chunkIndex)) {
                chunkIndexes.add(chunkIndex);
            }
        }

        private RagSourceReference toReference() {
            var documentName = sourceReferenceKey(first);
            return RagSourceReference.builder()
                .id(documentName)
                .sourceType(first.getSourceType())
                .title(first.getTitle())
                .url(first.getUrl())
                .score(score)
                .metadata(Map.of(
                    "documentName", documentName,
                    "sourceName", defaultString(metadataString(first, "sourceName")),
                    "chunkCount", chunkCount,
                    "chunkIndexes", chunkIndexes,
                    "sourceIds", sourceIds
                ))
                .build();
        }

        private String defaultString(String value) {
            return value == null ? "" : value;
        }
    }
}
