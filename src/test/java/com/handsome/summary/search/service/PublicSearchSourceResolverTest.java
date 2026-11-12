package com.handsome.summary.search.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.impl.DefaultRagContentService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import reactor.core.publisher.Mono;
import run.halo.app.content.ContentWrapper;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.search.SearchOption;
import run.halo.app.search.HaloDocument;

class PublicSearchSourceResolverTest {
    final ReactiveExtensionClient client = mock(ReactiveExtensionClient.class);
    final PostContentService content = mock(PostContentService.class);
    final PublicSearchSourceResolver resolver = new PublicSearchSourceResolver(client, content,
        new DefaultRagContentService());
    final Post post = new Post();
    final RagDocument document = new RagDocument();
    final SearchOption option = new SearchOption();
    final RagSearchResult hit = RagSearchResult.builder().id("chunk").sourceType("POST")
        .sourceName("post").documentName("doc").knowledgeBase("default")
        .title("forged title").url("javascript:bad").content("标题：旧标题\n\n公开正文。")
        .metadata(Map.of("private", "secret")).build();

    @BeforeEach
    void setup() {
        var metadata = new Metadata(); metadata.setName("post");
        metadata.setLabels(Map.of(Post.PUBLISHED_LABEL, "true")); post.setMetadata(metadata);
        var spec = new Post.PostSpec(); spec.setTitle("当前文章"); spec.setOwner("author");
        spec.setTags(List.of("ai", "halo")); spec.setCategories(List.of("tech")); post.setSpec(spec);
        var status = new Post.PostStatus(); status.setPermalink("/archives/public"); post.setStatus(status);
        var docSpec = new RagDocument.Spec(); docSpec.setSourceType("POST"); docSpec.setSourceName("post");
        docSpec.setKnowledgeBase("default"); document.setSpec(docSpec);
        when(client.fetch(RagDocument.class, "doc")).thenReturn(Mono.just(document));
        when(client.fetch(Post.class, "post")).thenReturn(Mono.just(post));
        var wrapper = mock(ContentWrapper.class); when(wrapper.getContent()).thenReturn("<p>公开正文。</p>");
        when(content.getReleaseContent("post")).thenReturn(Mono.just(wrapper));
    }

    @Test
    void resolvesCanonicalPublicContentAndCachesOnlyWithinTheRequest() {
        var results = resolver.filter(List.of(hit, hit), option).block();
        assertThat(results).hasSize(2);
        assertThat(results.getFirst().getTitle()).isEqualTo("当前文章");
        assertThat(results.getFirst().getUrl()).isEqualTo("/archives/public");
        assertThat(results.getFirst().getContent()).isEqualTo("公开正文。");
        assertThat(results.getFirst().getMetadata()).isEmpty();
        verify(content).getReleaseContent("post");
        post.getMetadata().setLabels(Map.of());
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
    }

    @ParameterizedTest
    @EnumSource(value = Post.VisibleEnum.class, names = {"PUBLIC"}, mode = EnumSource.Mode.EXCLUDE)
    void excludesPrivateAndEncryptedPostsBeforeReadingContent(Post.VisibleEnum visibility) {
        post.getSpec().setVisible(visibility);
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        verifyNoInteractions(content);
    }

    @Test
    void excludesRemovedDraftRecycledDisabledAndNonPostSources() {
        post.getMetadata().setDeletionTimestamp(Instant.now());
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        post.getMetadata().setDeletionTimestamp(null); post.getSpec().setDeleted(true);
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        post.getSpec().setDeleted(false); post.getMetadata().setLabels(Map.of());
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        post.getMetadata().setLabels(Map.of(Post.PUBLISHED_LABEL, "true"));
        document.getSpec().setEnabled(false);
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        assertThat(resolver.filter(List.of(hit.toBuilder().sourceType("MANUAL").build()), option).block()).isEmpty();
        verifyNoInteractions(content);
    }

    @Test
    void excludesStaleAndForgedChunksEvenWhenTheyPointToAPublicArticle() {
        assertThat(resolver.filter(List.of(hit.toBuilder().content("已经移除的秘密").build()), option).block()).isEmpty();
        assertThat(resolver.filter(List.of(hit.toBuilder().sourceName("another").build()), option).block()).isEmpty();
        assertThat(resolver.filter(List.of(hit.toBuilder().knowledgeBase("another").build()), option).block()).isEmpty();
    }

    @Test
    void keywordFallbackEvidenceAlwaysUsesLiveReleaseContent() {
        var indexed = new HaloDocument(); indexed.setType(PublicSearchSourceResolver.POST_TYPE);
        indexed.setMetadataName("post"); indexed.setTitle("stale title"); indexed.setContent("deleted secret");
        var results = resolver.fromHaloHits(List.of(indexed), option).block();
        assertThat(results).hasSize(1);
        assertThat(results.getFirst().getContent()).isEqualTo("公开正文。");
        assertThat(results.getFirst().getTitle()).isEqualTo("当前文章");
        post.getMetadata().setLabels(Map.of());
        assertThat(resolver.fromHaloHits(List.of(indexed), option).block()).isEmpty();
    }

    @Test
    void preservesThemeTypeOwnerCategoryTagAndAnnotationFilters() {
        option.setIncludeTypes(List.of("singlepage.content.halo.run"));
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        option.setIncludeTypes(List.of(PublicSearchSourceResolver.POST_TYPE));
        option.setIncludeOwnerNames(List.of("another"));
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        option.setIncludeOwnerNames(List.of("author")); option.setIncludeCategoryNames(List.of("other"));
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        option.setIncludeCategoryNames(List.of("tech")); option.setIncludeTagNames(List.of("ai", "missing"));
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        option.setIncludeTagNames(List.of("ai", "halo")); option.setAnnotations(Map.of("scope", "docs"));
        assertThat(resolver.filter(List.of(hit), option).block()).isEmpty();
        post.getMetadata().setAnnotations(Map.of("scope", "docs"));
        assertThat(resolver.filter(List.of(hit), option).block()).hasSize(1);
    }
}
