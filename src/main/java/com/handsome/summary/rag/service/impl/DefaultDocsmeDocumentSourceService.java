package com.handsome.summary.rag.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.rag.service.DocsmeDocumentSourceService;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Snapshot;
import run.halo.app.extension.Extension;
import run.halo.app.extension.GroupVersionKind;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.Scheme;
import run.halo.app.extension.SchemeManager;
import run.halo.app.extension.Unstructured;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultDocsmeDocumentSourceService implements DocsmeDocumentSourceService {

    private static final GroupVersionKind DOC_GVK =
        new GroupVersionKind("doc.halo.run", "v1alpha1", "Doc");
    private static final GroupVersionKind DOC_TREE_GVK =
        new GroupVersionKind("doc.halo.run", "v1alpha1", "DocTree");
    private static final GroupVersionKind PROJECT_VERSION_GVK =
        new GroupVersionKind("doc.halo.run", "v1alpha1", "ProjectVersion");
    private static final GroupVersionKind PROJECT_GVK =
        new GroupVersionKind("doc.halo.run", "v1alpha1", "Project");

    private final ReactiveExtensionClient client;
    private final SchemeManager schemeManager;
    private final ObjectMapper mapper = Unstructured.OBJECT_MAPPER;

    @Override
    public Mono<Boolean> isAvailable() {
        return Mono.just(extensionType(DOC_GVK).isPresent()
            && extensionType(DOC_TREE_GVK).isPresent()
            && extensionType(PROJECT_VERSION_GVK).isPresent()
            && extensionType(PROJECT_GVK).isPresent());
    }

    @Override
    public Flux<DocsmeDocument> listPublished(String keyword) {
        return listExtensions(DOC_GVK)
            .filter(this::canImportDoc)
            .flatMap(this::toDocument)
            .filter(document -> matches(document, keyword))
            .sort(Comparator.comparing(document -> defaultString(document.title())));
    }

    @Override
    public Flux<DocsmeDocument> listPublishedByNames(List<String> docNames) {
        var names = normalizedNames(docNames);
        if (names.isEmpty()) {
            return listPublished(null);
        }
        return Flux.fromIterable(names)
            .flatMap(name -> fetchExtension(DOC_GVK, name))
            .filter(this::canImportDoc)
            .flatMap(this::toDocument);
    }

    private Mono<DocsmeDocument> toDocument(Extension doc) {
        var docData = toMap(doc);
        var docName = metadataName(doc);
        var treeName = nestedString(docData, "spec", "docTreeName");
        var releaseSnapshot = nestedString(docData, "spec", "releaseSnapshot");
        var fallbackTitle = firstText(nestedString(docData, "status", "title"), docName);

        return Mono.zip(fetchTreeInfo(treeName), fetchContent(releaseSnapshot))
            .flatMap(tuple -> {
                var tree = tuple.getT1();
                var content = tuple.getT2();
                return fetchProjectInfo(tree.projectVersionName())
                    .map(project -> new DocsmeDocument(
                        docName,
                        treeName,
                        firstText(tree.title(), fallbackTitle),
                        tree.url(),
                        firstText(content.content(), content.raw()),
                        project.projectName(),
                        project.projectDisplayName(),
                        project.versionName(),
                        project.versionSlug()
                    ));
            });
    }

    private Mono<TreeInfo> fetchTreeInfo(String treeName) {
        if (!StringUtils.hasText(treeName)) {
            return Mono.just(TreeInfo.empty());
        }
        return fetchExtension(DOC_TREE_GVK, treeName)
            .map(tree -> {
                var data = toMap(tree);
                return new TreeInfo(
                    nestedString(data, "spec", "title"),
                    nestedString(data, "status", "permalink"),
                    nestedString(data, "spec", "projectVersionName")
                );
            })
            .defaultIfEmpty(TreeInfo.empty());
    }

    private Mono<ContentInfo> fetchContent(String snapshotName) {
        if (!StringUtils.hasText(snapshotName)) {
            return Mono.just(ContentInfo.empty());
        }
        return client.fetch(Snapshot.class, snapshotName)
            .map(snapshot -> {
                var spec = snapshot.getSpec();
                if (spec == null) {
                    return ContentInfo.empty();
                }
                return new ContentInfo(spec.getRawPatch(), spec.getContentPatch());
            })
            .defaultIfEmpty(ContentInfo.empty());
    }

    private Mono<ProjectInfo> fetchProjectInfo(String projectVersionName) {
        if (!StringUtils.hasText(projectVersionName)) {
            return Mono.just(ProjectInfo.empty());
        }
        return fetchExtension(PROJECT_VERSION_GVK, projectVersionName)
            .flatMap(version -> {
                var versionData = toMap(version);
                var versionName = metadataName(version);
                var versionSlug = nestedString(versionData, "spec", "slug");
                var projectName = nestedString(versionData, "spec", "projectName");
                return fetchExtension(PROJECT_GVK, projectName)
                    .map(project -> {
                        var projectData = toMap(project);
                        return new ProjectInfo(
                            projectName,
                            nestedString(projectData, "spec", "displayName"),
                            versionName,
                            versionSlug
                        );
                    })
                    .defaultIfEmpty(new ProjectInfo(projectName, null, versionName, versionSlug));
            })
            .defaultIfEmpty(ProjectInfo.empty());
    }

    private boolean canImportDoc(Extension doc) {
        if (doc == null || isDeleting(doc)) {
            return false;
        }
        var data = toMap(doc);
        return nestedBoolean(data, "spec", "publish")
            && StringUtils.hasText(nestedString(data, "spec", "releaseSnapshot"));
    }

    private boolean matches(DocsmeDocument document, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        var lowerKeyword = keyword.toLowerCase(Locale.ROOT);
        return contains(document.docName(), lowerKeyword)
            || contains(document.docTreeName(), lowerKeyword)
            || contains(document.title(), lowerKeyword)
            || contains(document.projectName(), lowerKeyword)
            || contains(document.projectDisplayName(), lowerKeyword)
            || contains(document.versionSlug(), lowerKeyword);
    }

    private boolean contains(String value, String lowerKeyword) {
        return defaultString(value).toLowerCase(Locale.ROOT).contains(lowerKeyword);
    }

    private List<String> normalizedNames(List<String> names) {
        if (names == null) {
            return List.of();
        }
        var normalized = new LinkedHashSet<String>();
        names.stream()
            .filter(StringUtils::hasText)
            .map(String::strip)
            .forEach(normalized::add);
        return normalized.stream().toList();
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Flux<Extension> listExtensions(GroupVersionKind gvk) {
        return extensionType(gvk)
            .map(type -> client.listAll((Class) type, ListOptions.builder().build(), Sort.unsorted())
                .cast(Extension.class)
                .onErrorResume(error -> {
                    log.debug("Failed to list Docsme extensions: {}", gvk, error);
                    return Flux.empty();
                }))
            .orElseGet(Flux::empty);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Mono<Extension> fetchExtension(GroupVersionKind gvk, String name) {
        if (!StringUtils.hasText(name)) {
            return Mono.empty();
        }
        return extensionType(gvk)
            .map(type -> client.fetch((Class) type, name.strip())
                .cast(Extension.class)
                .onErrorResume(error -> {
                    log.debug("Failed to fetch Docsme extension: {} {}", gvk, name, error);
                    return Mono.empty();
                }))
            .orElseGet(Mono::empty);
    }

    private Optional<Class<? extends Extension>> extensionType(GroupVersionKind gvk) {
        return schemeManager.fetch(gvk).map(Scheme::type);
    }

    private boolean isDeleting(Extension extension) {
        return extension.getMetadata() != null
            && extension.getMetadata().getDeletionTimestamp() != null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(Extension extension) {
        return mapper.convertValue(extension, Map.class);
    }

    private String metadataName(Extension extension) {
        return extension.getMetadata() == null ? null : extension.getMetadata().getName();
    }

    private String nestedString(Map<String, Object> map, String... fields) {
        return nestedValue(map, fields)
            .map(String::valueOf)
            .filter(StringUtils::hasText)
            .map(String::strip)
            .orElse(null);
    }

    private boolean nestedBoolean(Map<String, Object> map, String... fields) {
        return nestedValue(map, fields)
            .map(value -> {
                if (value instanceof Boolean bool) {
                    return bool;
                }
                return Boolean.parseBoolean(String.valueOf(value));
            })
            .orElse(false);
    }

    @SuppressWarnings("unchecked")
    private Optional<Object> nestedValue(Map<String, Object> map, String... fields) {
        if (map == null || fields == null || fields.length == 0) {
            return Optional.empty();
        }
        Map<String, Object> current = map;
        for (var i = 0; i < fields.length - 1; i++) {
            var value = current.get(fields[i]);
            if (!(value instanceof Map<?, ?> nested)) {
                return Optional.empty();
            }
            current = (Map<String, Object>) nested;
        }
        return Optional.ofNullable(current.get(fields[fields.length - 1]));
    }

    private String firstText(String... values) {
        if (values == null) {
            return null;
        }
        for (var value : values) {
            if (StringUtils.hasText(value)) {
                return value.strip();
            }
        }
        return null;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private record TreeInfo(String title, String url, String projectVersionName) {
        static TreeInfo empty() {
            return new TreeInfo(null, null, null);
        }
    }

    private record ContentInfo(String raw, String content) {
        static ContentInfo empty() {
            return new ContentInfo(null, null);
        }
    }

    private record ProjectInfo(
        String projectName,
        String projectDisplayName,
        String versionName,
        String versionSlug
    ) {
        static ProjectInfo empty() {
            return new ProjectInfo(null, null, null, null);
        }
    }
}
