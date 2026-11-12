package com.handsome.summary.glossary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

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

class GlossaryContentLoaderTest {
    private final ReactiveExtensionClient client = mock(ReactiveExtensionClient.class);
    private final PostContentService content = mock(PostContentService.class);
    private final GlossaryContentLoader loader = new GlossaryContentLoader(client, content);
    private final Post post = new Post();

    @BeforeEach
    void setup() {
        var metadata = new Metadata(); metadata.setName("post");
        metadata.setLabels(Map.of(Post.PUBLISHED_LABEL, "true")); post.setMetadata(metadata);
        var spec = new Post.PostSpec(); spec.setTitle("公开文章"); post.setSpec(spec);
        when(client.fetch(Post.class, "post")).thenReturn(Mono.just(post));
    }

    @ParameterizedTest
    @EnumSource(value = Post.VisibleEnum.class, names = {"PUBLIC"}, mode = EnumSource.Mode.EXCLUDE)
    void neverExposesPrivateOrEncryptedArticleContent(Post.VisibleEnum visibility) {
        post.getSpec().setVisible(visibility);
        assertThatThrownBy(() -> loader.load("post").block()).hasMessageContaining("404");
        verifyNoInteractions(content);
    }

    @Test
    void rejectsUnpublishedAndDeletedPostsBeforeReadingContent() {
        post.getMetadata().setLabels(Map.of());
        assertThatThrownBy(() -> loader.load("post").block()).hasMessageContaining("404");
        post.getMetadata().setLabels(Map.of(Post.PUBLISHED_LABEL, "true"));
        post.getSpec().setDeleted(true);
        assertThatThrownBy(() -> loader.load("post").block()).hasMessageContaining("404");
        verifyNoInteractions(content);
    }

    @Test
    void onlyAnalyzesReleasedProseNotCodeOrPluginWidgets() {
        var wrapper = mock(ContentWrapper.class);
        when(wrapper.getContent()).thenReturn("<p>本文使用 RAG。</p><pre>private code</pre>"
            + "<ai-summaraidgpt-reading>旧图谱</ai-summaraidgpt-reading><script>private script</script>");
        when(content.getReleaseContent("post")).thenReturn(Mono.just(wrapper));
        assertThat(loader.load("post").block().content()).isEqualTo("本文使用 RAG。");
    }
}
