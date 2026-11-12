package com.handsome.summary.search.service;

import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.RagContentService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.search.SearchOption;
import run.halo.app.search.HaloDocument;

/** Resolves indexed chunks against the currently released, public article. */
@Component
@RequiredArgsConstructor
public class PublicSearchSourceResolver {
    public static final String POST_TYPE = "post.content.halo.run";
    private final ReactiveExtensionClient client;
    private final PostContentService postContentService;
    private final RagContentService contentService;

    private record Source(Post post, RagDocument document, String content) { }
    private record Article(Post post, String content) { }

    /** Fallback evidence comes from live released content, never the search index's cached body. */
    public Mono<List<RagSearchResult>> fromHaloHits(List<HaloDocument> hits, SearchOption option) {
        return Flux.fromIterable(hits == null ? List.<HaloDocument>of() : hits)
            .filter(hit -> POST_TYPE.equals(hit.getType()) && StringUtils.hasText(hit.getMetadataName()))
            .concatMap(hit -> loadArticle(hit.getMetadataName()).filter(article -> matches(article.post(), option))
                .map(article -> RagSearchResult.builder().id(hit.getId())
                    .documentName("halo-post-" + hit.getMetadataName()).sourceType("POST")
                    .sourceName(hit.getMetadataName()).knowledgeBase("")
                    .title(article.post().getSpec().getTitle()).url(article.post().getStatus().getPermalink())
                    .content(article.content().substring(0, Math.min(article.content().length(), 6000)))
                    .metadata(Map.of()).build()))
            .collectList();
    }

    public Mono<List<RagSearchResult>> filter(List<RagSearchResult> candidates, SearchOption option) {
        Map<String, Mono<Source>> sources = new HashMap<>();
        return Flux.fromIterable(candidates)
            .filter(hit -> "POST".equals(hit.getSourceType())
                && StringUtils.hasText(hit.getDocumentName()))
            .concatMap(hit -> sources.computeIfAbsent(hit.getDocumentName(), this::load).flatMap(source -> {
                var post = source.post();
                var spec = source.document().getSpec();
                var chunk = hit.getContent() == null ? "" : hit.getContent()
                    .replaceFirst("^标题：[^\\n]*\\n\\n", "");
                chunk = contentService.normalize(chunk);
                if (!spec.getSourceName().equals(hit.getSourceName())
                    || !spec.getKnowledgeBase().equals(hit.getKnowledgeBase())
                    || !matches(post, option) || !StringUtils.hasText(chunk)
                    || !source.content().contains(chunk)) {
                    return Mono.empty();
                }
                return Mono.just(hit.toBuilder().title(post.getSpec().getTitle())
                    .url(post.getStatus().getPermalink()).content(chunk).metadata(Map.of()).build());
            }))
            .collectList();
    }

    private Mono<Source> load(String documentName) {
        return client.fetch(RagDocument.class, documentName)
            .filter(doc -> doc.getSpec() != null && !Boolean.FALSE.equals(doc.getSpec().getEnabled())
                && "POST".equals(doc.getSpec().getSourceType())
                && StringUtils.hasText(doc.getSpec().getSourceName())
                && StringUtils.hasText(doc.getSpec().getKnowledgeBase()))
            .flatMap(doc -> loadArticle(doc.getSpec().getSourceName())
                .map(article -> new Source(article.post(), doc, article.content())))
            .cache(); // Per-request only: visibility is checked again on every request.
    }

    private Mono<Article> loadArticle(String postName) {
        return client.fetch(Post.class, postName).filter(PublicSearchSourceResolver::isPublic)
            .flatMap(post -> postContentService.getReleaseContent(postName)
                .map(content -> new Article(post, contentService.normalize(
                    StringUtils.hasText(content.getContent()) ? content.getContent() : content.getRaw()))))
            .filter(article -> StringUtils.hasText(article.content()));
    }

    public static boolean isPublic(Post post) {
        return post != null && post.getMetadata() != null
            && post.getMetadata().getDeletionTimestamp() == null && post.getSpec() != null
            && post.isPublished() && !post.isDeleted() && Post.isPublic(post.getSpec())
            && post.getStatus() != null && StringUtils.hasText(post.getStatus().getPermalink());
    }

    static boolean matches(Post post, SearchOption option) {
        var spec = post.getSpec();
        return (option.getIncludeTypes() == null || option.getIncludeTypes().isEmpty()
                || option.getIncludeTypes().contains(POST_TYPE))
            && (option.getIncludeOwnerNames() == null || option.getIncludeOwnerNames().isEmpty()
                || spec.getOwner() != null && option.getIncludeOwnerNames().contains(spec.getOwner()))
            && containsAll(spec.getCategories(), option.getIncludeCategoryNames())
            && containsAll(spec.getTags(), option.getIncludeTagNames())
            && (option.getAnnotations() == null || option.getAnnotations().isEmpty()
                || post.getMetadata().getAnnotations() != null
                && post.getMetadata().getAnnotations().entrySet().containsAll(option.getAnnotations().entrySet()));
    }

    private static boolean containsAll(List<String> actual, List<String> required) {
        return required == null || required.isEmpty() || actual != null && actual.containsAll(required);
    }
}
