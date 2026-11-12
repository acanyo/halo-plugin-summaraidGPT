package com.handsome.summary.search.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.RagAiService;
import com.handsome.summary.rag.service.impl.DefaultRagSearchService;
import com.handsome.summary.rag.store.RagVectorStore;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

class PublicSearchCandidateFilterTest {
    @Test
    void removesInaccessibleCandidatesBeforeSendingAnythingToTheRerankingModel() {
        var client = mock(ReactiveExtensionClient.class);
        var settings = mock(SettingConfigGetter.class);
        var ai = mock(RagAiService.class);
        var store = mock(RagVectorStore.class);
        var service = new DefaultRagSearchService(client, settings, ai, store);
        var kb = new RagKnowledgeBase(); var metadata = new Metadata(); metadata.setName("default"); kb.setMetadata(metadata);
        kb.setSpec(new RagKnowledgeBase.Spec());
        var status = new RagKnowledgeBase.Status(); status.setIndexState("READY"); status.setIndexVersion("v1"); kb.setStatus(status);
        var publicHit = RagSearchResult.builder().id("public").knowledgeBase("default").title("公开").content("公开正文").build();
        var privateHit = RagSearchResult.builder().id("private").knowledgeBase("default").title("私密").content("秘密").build();
        when(settings.getBasicConfig()).thenReturn(Mono.just(new SettingConfigGetter.BasicConfig()));
        when(settings.getRagConfig()).thenReturn(Mono.just(new SettingConfigGetter.RagConfig()));
        when(client.listAll(eq(RagKnowledgeBase.class), any(), any())).thenReturn(Flux.just(kb));
        when(ai.embedQuery(anyString(), any())).thenReturn(Mono.just(new float[]{1, 0}));
        when(store.vectorSearch(anyString(), anyString(), any(), anyInt())).thenReturn(Mono.just(List.of(publicHit, privateHit)));
        when(store.keywordSearch(anyString(), anyString(), anyString(), anyInt())).thenReturn(Mono.just(List.of()));
        when(ai.rerank(anyString(), anyList(), any(), anyInt())).thenAnswer(invocation -> Mono.just(invocation.getArgument(1)));
        var result = service.searchFiltered(null, "问题", 10, candidates -> Mono.just(candidates.stream()
            .filter(hit -> "public".equals(hit.getId())).toList())).block();
        assertThat(result).extracting(RagSearchResult::getId).containsExactly("public");
        verify(ai).rerank(eq("问题"), argThat(hits -> hits.size() == 1 && "公开正文".equals(hits.getFirst().getContent())), any(), eq(10));
    }
}
