package com.handsome.summary.glossary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.handsome.summary.glossary.extension.ArticleGlossary;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import run.halo.app.extension.ReactiveExtensionClient;

class ArticleGlossaryServiceTest {
    private final ReactiveExtensionClient client = mock(ReactiveExtensionClient.class);
    private final GlossaryContentLoader loader = mock(GlossaryContentLoader.class);
    private final GlossaryGenerator generator = mock(GlossaryGenerator.class);
    private final SettingConfigGetter settings = mock(SettingConfigGetter.class);
    private final SettingConfigGetter.GlossaryConfig config = new SettingConfigGetter.GlossaryConfig();
    private final AtomicReference<ArticleGlossary> saved = new AtomicReference<>();
    private ArticleGlossaryService service;

    @BeforeEach
    void setup() {
        service = new ArticleGlossaryService(client, loader, generator, settings);
        when(settings.getGlossaryConfig()).thenReturn(Mono.just(config));
        when(settings.getAiConfigForFunction("glossary"))
            .thenReturn(Mono.just(new SettingConfigGetter.AiConfigResult()));
        when(loader.load("post")).thenReturn(Mono.just(source("RAG 为检索增强生成")));
        when(client.fetch(eq(ArticleGlossary.class), any()))
            .thenAnswer(invocation -> Mono.justOrEmpty(saved.get()));
        when(client.create(any(ArticleGlossary.class))).thenAnswer(invocation -> {
            saved.set(invocation.getArgument(0)); return Mono.just(saved.get());
        });
        when(client.update(any(ArticleGlossary.class))).thenAnswer(invocation -> {
            saved.set(invocation.getArgument(0)); return Mono.just(saved.get());
        });
        when(generator.generate(any(), any(), eq(8)))
            .thenReturn(Mono.just(List.of(new ArticleGlossary.Term("RAG", "检索增强生成。"))));
    }

    @Test
    void cachedReadNeverCallsAiAndContentChangesInvalidateIt() {
        assertThat(service.getExisting("post").block()).isNull();
        verifyNoInteractions(generator);
        var result = service.generate("post", false).block();
        assertThat(result.getSpec().getTerms()).hasSize(1);
        assertThat(service.generate("post", false).block()).isSameAs(result);
        verify(generator, times(1)).generate(any(), any(), eq(8));
        when(loader.load("post")).thenReturn(Mono.just(source("新的正文使用了向量索引")));
        assertThat(service.getExisting("post").block()).isNull();
        service.generate("post", false).block();
        verify(generator, times(2)).generate(any(), any(), eq(8));
    }

    @Test
    void concurrentRequestsShareOneGeneration() {
        var response = Sinks.<List<ArticleGlossary.Term>>one();
        when(generator.generate(any(), any(), eq(8))).thenReturn(response.asMono());
        var first = service.generate("post", true).toFuture();
        var second = service.generate("post", true).toFuture();
        response.tryEmitValue(List.of());
        assertThat(first.join()).isSameAs(second.join());
        verify(generator, times(1)).generate(any(), any(), eq(8));
    }

    @Test
    void changingTermLimitInvalidatesExistingData() {
        service.generate("post", false).block();
        config.setMaxTerms(4);
        assertThat(service.getExisting("post").block()).isNull();
    }

    @Test
    void failedRefreshKeepsPreviousResultAndAutomaticRetryBacksOff() {
        var previous = service.generate("post", false).block();
        when(generator.generate(any(), any(), eq(8))).thenReturn(Mono.error(new RuntimeException("offline")));
        assertThatThrownBy(() -> service.generate("post", true).block()).hasMessage("offline");
        service.schedule("post");
        verify(generator, times(2)).generate(any(), any(), eq(8));
        assertThat(service.getExisting("post").block()).isSameAs(previous);
    }

    @Test
    void disablingPluginCancelsAnInflightModelRequest() {
        var response = Sinks.<List<ArticleGlossary.Term>>one();
        var cancelled = new java.util.concurrent.atomic.AtomicBoolean();
        when(generator.generate(any(), any(), eq(8)))
            .thenReturn(response.asMono().doOnCancel(() -> cancelled.set(true)));
        service.schedule("post");
        service.dispose();
        assertThat(cancelled).isTrue();
        assertThat(saved.get()).isNull();
    }

    private GlossaryContentLoader.Source source(String content) {
        return new GlossaryContentLoader.Source("post", "文章标题", content);
    }
}
