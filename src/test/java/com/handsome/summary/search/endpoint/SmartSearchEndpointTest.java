package com.handsome.summary.search.endpoint;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.search.service.SmartSearchService;
import com.handsome.summary.search.service.SearchDiscoveryService;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

class SmartSearchEndpointTest {
    final SettingConfigGetter settings = mock(SettingConfigGetter.class);
    final SmartSearchService search = mock(SmartSearchService.class);
    final SearchDiscoveryService discovery = mock(SearchDiscoveryService.class);
    final SettingConfigGetter.SmartSearchConfig config = new SettingConfigGetter.SmartSearchConfig();
    final SettingConfigGetter.AiSecurityConfig security = new SettingConfigGetter.AiSecurityConfig();
    final WebTestClient client = WebTestClient.bindToRouterFunction(
        new SmartSearchEndpoint(search, settings, new AiRequestSecurityService(settings), discovery).endpoint()).configureClient().baseUrl("http://localhost").build();

    @BeforeEach
    void setup() {
        config.setEnable(true);
        when(settings.getSmartSearchConfig()).thenReturn(Mono.just(config));
        when(settings.getAiSecurityConfig()).thenReturn(Mono.just(security));
        when(search.requireEnabled()).thenReturn(Mono.just(config));
        when(search.keyword(any())).thenReturn(Mono.just(new SmartSearchService.Result(List.of(), "keyword", false, "")));
        when(search.semantic(any())).thenReturn(Mono.just(new SmartSearchService.Result(List.of(), "semantic", false, "")));
        when(search.answer(any())).thenReturn(Flux.just(RagChatStreamEvent.delta("公开回答"), RagChatStreamEvent.done()));
        when(discovery.discover(any(), any())).thenReturn(Mono.just(new SearchDiscoveryService.Result(List.of(), List.of())));
    }

    @Test
    void keywordSearchRemainsPublicAndCannotDisableVisibilityFilters() {
        security.setAccessMode("authenticated_chat");
        client.post().uri("/smartSearch").contentType(MediaType.APPLICATION_JSON)
            .bodyValue("{\"query\":\"halo\",\"options\":{\"filterPublished\":false,\"filterExposed\":false,\"filterRecycled\":true,\"includeTagNames\":[\"tag\"]}}")
            .exchange().expectStatus().isOk();
        verify(search).keyword(argThat(option -> Boolean.TRUE.equals(option.getFilterPublished())
            && Boolean.TRUE.equals(option.getFilterExposed()) && Boolean.FALSE.equals(option.getFilterRecycled())
            && option.getLimit() == 12 && option.getIncludeTagNames().equals(List.of("tag"))));
    }

    @Test
    void aiRoutesHonorLoginOriginAndRateLimitsBeforeInvokingModels() {
        security.setAccessMode("authenticated_chat");
        request("/smartSearch", "semantic").expectStatus().isUnauthorized();
        request("/smartSearchAnswer", null).expectStatus().isUnauthorized();
        verify(search, never()).semantic(any()); verify(search, never()).answer(any());
        security.setAccessMode("anonymous_chat");
        client.post().uri("/smartSearchAnswer").header("Origin", "https://untrusted.test")
            .contentType(MediaType.APPLICATION_JSON).bodyValue("{\"query\":\"halo\"}")
            .exchange().expectStatus().isForbidden();
        security.setRateLimitRequests(1);
        request("/smartSearch", "semantic").expectStatus().isOk();
        request("/smartSearchAnswer", null).expectStatus().isEqualTo(429);
    }

    @Test
    void individualFeatureSwitchesAreEnforcedOnTheServer() {
        config.setEnableSemantic(false); config.setEnableAi(false);
        request("/smartSearch", "semantic").expectStatus().isForbidden();
        request("/smartSearchAnswer", null).expectStatus().isForbidden();
        verify(search, never()).semantic(any()); verify(search, never()).answer(any());
    }

    @Test
    void validatesEmptyOversizedMalformedAndUnknownRequests() {
        for (var body : List.of("{}", "{\"query\":\"  \"}", "{\"query\":\"" + "a".repeat(501) + "\"}",
            "{\"query\":\"halo\",\"mode\":\"unsupported\"}", "{broken")) {
            client.post().uri("/smartSearch").contentType(MediaType.APPLICATION_JSON).bodyValue(body)
                .exchange().expectStatus().isBadRequest();
        }
        client.post().uri("/smartSearch").contentType(MediaType.APPLICATION_JSON)
            .exchange().expectStatus().isBadRequest();
        verify(search, never()).keyword(any());
    }

    @Test
    void streamsAnswerEventsAndDoesNotCacheThem() {
        request("/smartSearchAnswer", null).expectStatus().isOk()
            .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
            .expectHeader().valueEquals("Cache-Control", "no-store")
            .expectBody(String.class).value(body -> org.assertj.core.api.Assertions.assertThat(body)
                .contains("event:delta", "公开回答", "event:done"));
    }

    @Test
    void discoveryIsPublicRespectsScopesAndDoesNotConsumeAiLimits() {
        security.setAccessMode("authenticated_chat");
        client.post().uri("/smartSearchDiscovery").contentType(MediaType.APPLICATION_JSON)
            .bodyValue("{\"options\":{\"includeTagNames\":[\"halo\"]},\"excludeIds\":[\"previous\"]}")
            .exchange().expectStatus().isOk().expectHeader().valueEquals("Cache-Control", "no-store")
            .expectBody().json("{\"random\":[],\"popular\":[]}");
        verify(discovery).discover(argThat(option -> option.getIncludeTagNames().equals(List.of("halo"))), eq(List.of("previous")));
        verify(search, never()).semantic(any()); verify(search, never()).answer(any());
        when(search.requireEnabled()).thenReturn(Mono.error(new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.FORBIDDEN)));
        client.post().uri("/smartSearchDiscovery").exchange().expectStatus().isForbidden();
        verifyNoMoreInteractions(discovery);
    }

    private WebTestClient.ResponseSpec request(String path, String mode) {
        return client.post().uri(path).header("Origin", "http://localhost")
            .contentType(MediaType.APPLICATION_JSON).bodyValue("{\"query\":\"halo\""
                + (mode == null ? "" : ",\"mode\":\"" + mode + "\"") + "}")
            .exchange();
    }
}
