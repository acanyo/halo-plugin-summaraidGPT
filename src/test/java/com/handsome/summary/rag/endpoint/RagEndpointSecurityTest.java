package com.handsome.summary.rag.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.handsome.summary.rag.extension.RagIndexTask;
import com.handsome.summary.rag.model.RagIndexSummary;
import com.handsome.summary.rag.service.DocsmeDocumentSourceService;
import com.handsome.summary.rag.service.RagContentService;
import com.handsome.summary.rag.service.RagConversationService;
import com.handsome.summary.rag.service.RagDocumentImportService;
import com.handsome.summary.rag.service.RagDocumentImportService.ImportResult;
import com.handsome.summary.rag.service.RagIndexService;
import com.handsome.summary.rag.service.RagIndexTaskService;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.rag.store.RagVectorStore;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ReactiveExtensionClient;

class RagEndpointSecurityTest {
    private static final String PUBLIC_ORIGIN = "https://blog.example.com";
    private static final String UPSTREAM_ORIGIN = "http://halo-internal:8090";

    private final SettingConfigGetter settings = mock(SettingConfigGetter.class);
    private final SettingConfigGetter.AiSecurityConfig security =
        new SettingConfigGetter.AiSecurityConfig();
    private final RagDocumentImportService imports = mock(RagDocumentImportService.class);
    private final RagIndexService index = mock(RagIndexService.class);
    private final RagIndexTaskService indexTasks = mock(RagIndexTaskService.class);
    private final RagSearchService search = mock(RagSearchService.class);
    private RouterFunction<ServerResponse> routes;

    @BeforeEach
    void setup() {
        when(settings.getAiSecurityConfig()).thenReturn(Mono.just(security));
        when(imports.importPublishedPosts(anyString(), anyList()))
            .thenReturn(Mono.just(new ImportResult(1, List.of("document"))));
        when(imports.importPublishedDocsmeDocuments(anyString(), anyList()))
            .thenReturn(Mono.just(new ImportResult(1, List.of("document"))));
        when(search.search(any(), anyString(), any())).thenReturn(Mono.just(List.of()));
        routes = new RagEndpoint(new AiRequestSecurityService(settings),
            mock(ReactiveExtensionClient.class), mock(DocsmeDocumentSourceService.class),
            mock(RagContentService.class), mock(RagConversationService.class), imports,
            index, indexTasks, search, mock(RagVectorStore.class)).endpoint();
    }

    @ParameterizedTest
    @CsvSource({"ragImportPosts,postNames", "ragImportDocsmeDocuments,docNames"})
    void sameOriginManagementImportsWorkBehindAReverseProxy(String endpoint, String namesField) {
        importRequest(client(() -> "admin"), endpoint, namesField)
            .header(HttpHeaders.ORIGIN, PUBLIC_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .exchange()
            .expectStatus().isOk()
            .expectBody().jsonPath("$.imported").isEqualTo(1);
    }

    @ParameterizedTest
    @CsvSource({"ragImportPosts,postNames", "ragImportDocsmeDocuments,docNames"})
    void browserSameOriginImportsDoNotRequireOriginOrReferer(String endpoint, String namesField) {
        importRequest(client(() -> "admin"), endpoint, namesField)
            .header("Sec-Fetch-Site", "same-origin")
            .exchange()
            .expectStatus().isOk();
    }

    @ParameterizedTest
    @CsvSource({"ragImportPosts,postNames", "ragImportDocsmeDocuments,docNames"})
    void automaticIndexingStillStartsAfterAProxiedImport(String endpoint, String namesField) {
        when(indexTasks.startDocumentRebuild("test", List.of("document")))
            .thenReturn(Mono.just(new RagIndexTask()));
        importRequest(client(() -> "admin"), endpoint, namesField, true)
            .header(HttpHeaders.ORIGIN, PUBLIC_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .exchange()
            .expectStatus().isOk()
            .expectBody().jsonPath("$.imported").isEqualTo(1)
            .jsonPath("$.task").exists();
        verify(indexTasks).startDocumentRebuild("test", List.of("document"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ragRebuild", "ragForceRebuild", "ragStopIndexTask",
        "ragIndexDocuments", "ragRebuildNow"})
    void indexManagementAlsoWorksBehindAReverseProxy(String endpoint) {
        var task = Mono.just(new RagIndexTask());
        when(indexTasks.startFullRebuild("test")).thenReturn(task);
        when(indexTasks.forceFullRebuild("test")).thenReturn(task);
        when(indexTasks.forceStop("test")).thenReturn(task);
        when(indexTasks.startDocumentRebuild("test", List.of("document"))).thenReturn(task);
        when(index.rebuild("test")).thenReturn(Mono.just(new RagIndexSummary()));
        client(() -> "admin").post().uri(UPSTREAM_ORIGIN + "/" + endpoint)
            .header(HttpHeaders.ORIGIN, PUBLIC_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("knowledgeBase", "test", "documentNames", List.of("document")))
            .exchange()
            .expectStatus().isOk();
    }

    @ParameterizedTest
    @CsvSource({"ragImportPosts,postNames", "ragImportDocsmeDocuments,docNames"})
    void unauthenticatedManagementRequestsAreRejected(String endpoint, String namesField) {
        importRequest(client(null), endpoint, namesField)
            .header(HttpHeaders.ORIGIN, UPSTREAM_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .exchange()
            .expectStatus().isUnauthorized();
        verifyNoInteractions(imports);
    }

    @Test
    void anonymousPrincipalCannotUseTheManagementPolicy() {
        importRequest(client(() -> "anonymousUser"), "ragImportPosts", "postNames")
            .header(HttpHeaders.ORIGIN, UPSTREAM_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .exchange()
            .expectStatus().isUnauthorized();
        verifyNoInteractions(imports);
    }

    @ParameterizedTest
    @ValueSource(strings = {"cross-site", "same-site"})
    void untrustedBrowserOriginsCannotUseManagementImports(String fetchSite) {
        importRequest(client(() -> "admin"), "ragImportPosts", "postNames")
            .header(HttpHeaders.ORIGIN, "https://untrusted.example.org")
            .header("Sec-Fetch-Site", fetchSite)
            .exchange()
            .expectStatus().isForbidden();
        verifyNoInteractions(imports);
    }

    @Test
    void managementRequestsStillRejectCrossSiteFetchesWhenPublicHotlinkChecksAreDisabled() {
        security.setAntiHotlinkEnabled(false);
        importRequest(client(() -> "admin"), "ragImportDocsmeDocuments", "docNames")
            .header("Sec-Fetch-Site", "cross-site")
            .exchange()
            .expectStatus().isForbidden();
        verifyNoInteractions(imports);
    }

    @Test
    void requestsWithoutFetchMetadataStillNeedATrustedOrigin() {
        importRequest(client(() -> "admin"), "ragImportPosts", "postNames")
            .header(HttpHeaders.ORIGIN, PUBLIC_ORIGIN)
            .exchange()
            .expectStatus().isForbidden()
            .expectBody().jsonPath("$.message")
            .isEqualTo("AI requests are only allowed from trusted site origins");
        verifyNoInteractions(imports);
    }

    @Test
    void legacyClientsWithATrustedOriginCanStillImport() {
        importRequest(client(() -> "admin"), "ragImportDocsmeDocuments", "docNames")
            .header(HttpHeaders.ORIGIN, UPSTREAM_ORIGIN)
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    void sameOriginManagementImportsStillRespectTheRateLimit() {
        security.setRateLimitRequests(1);
        security.setRateLimitWindowSeconds(86400);
        var client = client(() -> "admin");
        importRequest(client, "ragImportPosts", "postNames")
            .header("Sec-Fetch-Site", "same-origin")
            .exchange().expectStatus().isOk();
        importRequest(client, "ragImportDocsmeDocuments", "docNames")
            .header("Sec-Fetch-Site", "same-origin")
            .exchange().expectStatus().isEqualTo(429);
    }

    @Test
    void publicSearchKeepsStrictOriginChecksEvenForAnAuthenticatedUser() {
        client(() -> "admin").post().uri(UPSTREAM_ORIGIN + "/ragSearch")
            .header(HttpHeaders.ORIGIN, PUBLIC_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("query", "test"))
            .exchange()
            .expectStatus().isForbidden();
        verifyNoInteractions(search);
    }

    @Test
    void anonymousSearchFromATrustedOriginStillWorks() {
        client(null).post().uri(UPSTREAM_ORIGIN + "/ragSearch")
            .header(HttpHeaders.ORIGIN, UPSTREAM_ORIGIN)
            .header("Sec-Fetch-Site", "same-origin")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("query", "test"))
            .exchange()
            .expectStatus().isOk()
            .expectBody().jsonPath("$.results").isEmpty();
    }

    private WebTestClient client(Principal principal) {
        return WebTestClient.bindToRouterFunction(routes)
            .webFilter((exchange, chain) -> chain.filter(exchange.mutate()
                .principal(Mono.justOrEmpty(principal)).build()))
            .build();
    }

    private WebTestClient.RequestHeadersSpec<?> importRequest(WebTestClient client,
        String endpoint, String namesField) {
        return importRequest(client, endpoint, namesField, false);
    }

    private WebTestClient.RequestHeadersSpec<?> importRequest(WebTestClient client,
        String endpoint, String namesField, boolean rebuildAfterImport) {
        return client.post().uri(UPSTREAM_ORIGIN + "/" + endpoint)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("knowledgeBase", "test", namesField, List.of("source"),
                "rebuildAfterImport", rebuildAfterImport));
    }
}
