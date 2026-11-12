package com.handsome.summary.search.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.search.SearchOption;

class SearchDiscoveryServiceTest {
    final ReactiveExtensionClient client = mock(ReactiveExtensionClient.class);
    final SearchDiscoveryService service = new SearchDiscoveryService(client);

    @Test
    void ranksRealVisitsAndSamplesUniqueArticlesOutsideThePreviousBatch() {
        var posts = IntStream.range(0, 12).mapToObj(i -> post("post-" + i, i)).toList();
        when(client.listAll(eq(Post.class), any(), any())).thenReturn(Flux.fromIterable(posts));
        var result = service.discover(null, List.of("post-11", "post-10", "post-9")).block();
        assertThat(result.popular()).extracting(SearchDiscoveryService.Article::visits).containsExactly(11L, 10L, 9L);
        assertThat(result.random()).hasSize(3).extracting(SearchDiscoveryService.Article::id)
            .doesNotHaveDuplicates().doesNotContain("post-11", "post-10", "post-9");
    }

    @Test
    void excludesDraftPrivateEncryptedDeletedAndHiddenPosts() {
        var publicPost = post("public", 1);
        var draft = post("draft", 100); draft.getMetadata().setLabels(Map.of());
        var privatePost = post("private", 100); privatePost.getSpec().setVisible(Post.VisibleEnum.PRIVATE);
        var encrypted = post("encrypted", 100); encrypted.getSpec().setVisible(Post.VisibleEnum.INTERNAL);
        var deleted = post("deleted", 100); deleted.getSpec().setDeleted(true);
        var removed = post("removed", 100); removed.getMetadata().setDeletionTimestamp(Instant.now());
        var hidden = post("hidden", 100); hidden.getStatus().setHideFromList(true);
        var unlinked = post("unlinked", 100); unlinked.getStatus().setPermalink(null);
        when(client.listAll(eq(Post.class), any(), any())).thenReturn(Flux.just(
            publicPost, draft, privatePost, encrypted, deleted, removed, hidden, unlinked));
        var result = service.discover(null, List.of()).block();
        assertThat(result.random()).extracting(SearchDiscoveryService.Article::id).containsExactly("public");
        assertThat(result.popular()).isEqualTo(result.random());
        publicPost.getSpec().setVisible(Post.VisibleEnum.PRIVATE);
        assertThat(service.discover(null, List.of()).block().random()).isEmpty();
    }

    @Test
    void retainsNativeScopesAndHandlesMissingStatisticsAndSmallSites() {
        var scoped = post("scoped", 0); scoped.getSpec().setTags(List.of("halo"));
        scoped.getSpec().setOwner("author"); scoped.getSpec().setCategories(List.of("tech"));
        scoped.getMetadata().setAnnotations(Map.of("scope", "docs", Post.STATS_ANNO, "invalid json"));
        var other = post("other", 100);
        when(client.listAll(eq(Post.class), any(), any())).thenReturn(Flux.just(scoped, other));
        var option = new SearchOption(); option.setIncludeTypes(List.of(PublicSearchSourceResolver.POST_TYPE));
        option.setIncludeOwnerNames(List.of("author")); option.setIncludeCategoryNames(List.of("tech"));
        option.setIncludeTagNames(List.of("halo")); option.setAnnotations(Map.of("scope", "docs"));
        var result = service.discover(option, List.of("scoped")).block();
        assertThat(result.random()).extracting(SearchDiscoveryService.Article::id).containsExactly("scoped");
        assertThat(result.popular().getFirst().visits()).isZero();
        scoped.getMetadata().setAnnotations(Map.of("scope", "docs"));
        assertThat(service.discover(option, null).block().popular().getFirst().visits()).isZero();
        option.setIncludeTypes(List.of("singlepage.content.halo.run"));
        assertThat(service.discover(option, null).block().random()).isEmpty();
    }

    private Post post(String name, long visits) {
        var post = new Post();
        var meta = new Metadata(); meta.setName(name); meta.setLabels(Map.of(Post.PUBLISHED_LABEL, "true"));
        meta.setAnnotations(Map.of(Post.STATS_ANNO, "{\"visit\":" + visits + "}")); post.setMetadata(meta);
        var spec = new Post.PostSpec(); spec.setTitle(name); post.setSpec(spec);
        var status = new Post.PostStatus(); status.setPermalink("/archives/" + name); post.setStatus(status);
        return post;
    }
}
