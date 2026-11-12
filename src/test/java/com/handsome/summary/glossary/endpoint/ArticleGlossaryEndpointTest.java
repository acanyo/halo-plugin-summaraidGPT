package com.handsome.summary.glossary.endpoint;

import static org.mockito.Mockito.*;

import com.handsome.summary.glossary.service.ArticleGlossaryService;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

class ArticleGlossaryEndpointTest {
    private final ArticleGlossaryService service = mock(ArticleGlossaryService.class);
    private final SettingConfigGetter settings = mock(SettingConfigGetter.class);
    private final WebTestClient client = WebTestClient.bindToRouterFunction(
        new ArticleGlossaryEndpoint(service, new AiRequestSecurityService(settings)).endpoint()).build();

    @Test
    void publicReadsDoNotGenerateAndAnonymousWritesAreRejected() {
        when(service.getExisting("post")).thenReturn(Mono.empty());
        client.get().uri("/articleGlossaries/post").exchange().expectStatus().isNoContent();
        client.post().uri("/articleGlossaries").contentType(MediaType.APPLICATION_JSON)
            .header("Sec-Fetch-Site", "same-origin")
            .bodyValue("{\"postName\":\"post\",\"refresh\":true}")
            .exchange().expectStatus().isUnauthorized();
        verify(service).getExisting("post");
        verify(service, never()).generate(any(), anyBoolean());
    }
}
