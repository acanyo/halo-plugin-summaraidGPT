package com.handsome.summary.search.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.RagAiService;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.search.HaloDocument;
import run.halo.app.search.SearchOption;
import run.halo.app.search.SearchResult;
import run.halo.app.search.SearchService;

class SmartSearchServiceTest {
    final SettingConfigGetter settings = mock(SettingConfigGetter.class);
    final SearchService halo = mock(SearchService.class);
    final RagSearchService rag = mock(RagSearchService.class);
    final RagAiService ai = mock(RagAiService.class);
    final PublicSearchSourceResolver resolver = mock(PublicSearchSourceResolver.class);
    final SmartSearchService service = new SmartSearchService(settings, halo, rag, ai, resolver);
    final SearchOption option = new SearchOption();

    @BeforeEach
    void setup() {
        option.setKeyword("如何使用 Halo");
        when(settings.getAiConfigForFunction("rag")).thenReturn(Mono.just(new SettingConfigGetter.AiConfigResult()));
        when(settings.getRagConfig()).thenReturn(Mono.just(new SettingConfigGetter.RagConfig()));
        var document = new HaloDocument(); document.setId("post"); document.setTitle("Hello <b>Halo</b>");
        document.setDescription("<script>secret</script>公开摘要"); document.setPermalink("/article");
        document.setPublished(true); document.setExposed(true);
        var result = new SearchResult(); result.setHits(List.of(document));
        when(halo.search(any())).thenReturn(Mono.just(result));
        when(resolver.fromHaloHits(anyList(), any())).thenReturn(Mono.just(List.of()));
    }

    @Test
    void semanticErrorsAndEmptyKnowledgeBasesFallBackToKeywordSearch() {
        when(rag.searchFiltered(any(), anyString(), anyInt(), any())).thenReturn(Mono.error(new IllegalStateException("credential")));
        var fallback = service.semantic(option).block();
        assertThat(fallback.fallback()).isTrue();
        assertThat(fallback.hits().getFirst().title()).isEqualTo("Hello Halo");
        assertThat(fallback.hits().getFirst().excerpt()).isEqualTo("公开摘要");
        assertThat(fallback.message()).doesNotContain("credential");
        when(rag.searchFiltered(any(), anyString(), anyInt(), any())).thenReturn(Mono.just(List.of()));
        assertThat(service.semantic(option).block().message()).contains("暂无匹配");
    }

    @Test
    void deduplicatesArticleChunksBeforeReturningResults() {
        var hit = RagSearchResult.builder().sourceName("post").title("文章").url("/article").content("公开内容").build();
        when(rag.searchFiltered(any(), anyString(), anyInt(), any())).thenReturn(Mono.just(List.of(hit, hit)));
        assertThat(service.semantic(option).block().hits()).hasSize(1);
    }

    @Test
    void neverCallsAnswerModelWithoutPublicSources() {
        when(rag.searchFiltered(any(), anyString(), anyInt(), any())).thenReturn(Mono.just(List.of()));
        var events = service.answer(option).collectList().block();
        assertThat(events).extracting(RagChatStreamEvent::getType).containsExactly("delta", "sources", "done");
        assertThat(events.getFirst().getDelta()).contains("没有找到足够依据");
        verifyNoInteractions(ai);
    }

    @Test
    void answersFromLivePublicHaloArticlesWhenVectorRetrievalIsUnavailable() {
        var publicHit = RagSearchResult.builder().sourceName("post").title("当前文章")
            .url("/article").content("当前公开正文").build();
        when(rag.searchFiltered(any(), anyString(), anyInt(), any())).thenReturn(Mono.error(new IllegalStateException("offline")));
        when(resolver.fromHaloHits(anyList(), eq(option))).thenReturn(Mono.just(List.of(publicHit)));
        when(ai.streamAnswer(any(), anyList(), any(), any(), anyInt()))
            .thenReturn(Flux.just(RagChatStreamEvent.delta("有依据的回答")));
        assertThat(service.answer(option).collectList().block()).extracting(RagChatStreamEvent::getType)
            .containsExactly("delta", "done");
        verify(ai).streamAnswer(any(), eq(List.of(publicHit)), any(), any(), anyInt());
    }

    @Test
    void streamsGroundedAnswersAndSanitizesModelFailures() {
        var hit = RagSearchResult.builder().sourceName("post").title("文章").url("/article").content("公开内容").build();
        when(rag.searchFiltered(any(), anyString(), anyInt(), any())).thenReturn(Mono.just(List.of(hit)));
        when(ai.streamAnswer(any(), anyList(), any(), any(), anyInt()))
            .thenReturn(Flux.just(RagChatStreamEvent.delta("回答"), RagChatStreamEvent.sources(List.of())));
        assertThat(service.answer(option).collectList().block()).extracting(RagChatStreamEvent::getType)
            .containsExactly("delta", "sources", "done");
        when(ai.streamAnswer(any(), anyList(), any(), any(), anyInt()))
            .thenReturn(Flux.error(new IllegalStateException("private model credential")));
        assertThat(service.answer(option).collectList().block().getFirst().getError())
            .contains("暂时不可用").doesNotContain("credential");
    }
}
