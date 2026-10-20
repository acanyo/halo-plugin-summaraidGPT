package com.handsome.summary.podcast.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.awaitility.Awaitility.await;

import com.handsome.summary.podcast.audio.PodcastSpeechProvider;
import com.handsome.summary.podcast.extension.ArticlePodcast;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings;
import com.handsome.summary.reading.service.ArticleReadingContentLoader;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

class PodcastServiceTest {
    private final PodcastRepository repository = mock(PodcastRepository.class);
    private final PodcastConfigService config = mock(PodcastConfigService.class);
    private final PodcastSpeechProvider speech = mock(PodcastSpeechProvider.class);
    private final PodcastAudioStorage storage = mock(PodcastAudioStorage.class);
    private final ReactiveExtensionClient client = mock(ReactiveExtensionClient.class);
    private final ArticlePodcast episode = new ArticlePodcast();
    private final PodcastSettings settings = new PodcastSettings();
    private final PodcastService service = new PodcastService(repository, config,
        mock(PodcastScriptService.class), mock(ArticleReadingContentLoader.class), storage, List.of(speech), client);

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        settings.setEnabled(true);
        settings.setProvider("minimax");
        settings.setPolicyName("default");
        settings.getMinimax().setApiKey("secret-test");
        when(config.get()).thenReturn(Mono.just(settings));
        when(speech.supports("minimax")).thenReturn(true);
        episode.getSpec().setPostName("test");
        episode.getSpec().setContentHash("content");
        episode.getSpec().setTurns(List.of(new Turn("A", "问题"), new Turn("B", "解释"), new Turn("A", "追问"), new Turn("B", "回答")));
        var audio = new ArticlePodcast.Audio();
        audio.setUrl("/upload/previous.wav");
        episode.getSpec().setAudio(audio);
        when(repository.find("test")).thenAnswer(call -> Mono.just(episode));
        when(repository.update(anyString(), any())).thenAnswer(call -> Mono.fromSupplier(() -> {
            ((Consumer<ArticlePodcast>) call.getArgument(1)).accept(episode);
            return episode;
        }));
    }

    @Test
    void disabledFeatureDoesNotCreateAnEpisodeOrCallAModel() {
        settings.setEnabled(false);
        assertThatThrownBy(() -> service.generateScript("test", 2, "casual").block())
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("启用播客");
        verify(repository, never()).update(anyString(), any());
    }

    @Test
    void preventsDuplicatePaidCallsAndPreservesPreviousAudioOnFailure() {
        var pending = Sinks.<PodcastSpeechProvider.Result>one();
        when(speech.synthesize(anyString(), any(), any(), any())).thenReturn(pending.asMono());
        service.render("test").block();
        await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> verify(speech).synthesize(anyString(), any(), any(), any()));
        assertThatThrownBy(() -> service.render("test").block()).isInstanceOf(ResponseStatusException.class).hasMessageContaining("409");
        pending.tryEmitError(new IllegalStateException("合成失败"));
        await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> assertThat(episode.getStatus().getPhase()).isEqualTo("FAILED"));
        assertThat(episode.getSpec().getAudio().getUrl()).isEqualTo("/upload/previous.wav");
        verifyNoInteractions(storage);
        service.dispose();
    }

    @Test
    void invalidVoiceSettingsDoNotStartPaidCalls() {
        settings.getMinimax().setVoiceB(settings.getMinimax().getVoiceA());
        assertThatThrownBy(() -> service.render("test").block()).hasMessageContaining("两个不同的音色");
        verifyNoInteractions(speech, storage);
    }

    @Test
    void safeProviderDiagnosticReachesFailedStatusAndPreservesPreviousAudio() {
        var message = "百炼业务空间端点无效（BadRequest.IllegalEndpoint），请核对北京地域的业务空间 ID 与 API Key 所属空间";
        when(speech.synthesize(anyString(), any(), any(), any()))
            .thenReturn(Mono.error(new IllegalStateException(message)));
        try {
            service.render("test").block();
            await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
                assertThat(episode.getStatus().getPhase()).isEqualTo("FAILED");
                assertThat(episode.getStatus().getMessage()).isEqualTo(message);
            });
            assertThat(episode.getSpec().getAudio().getUrl()).isEqualTo("/upload/previous.wav");
            verifyNoInteractions(storage);
        } finally {
            service.dispose();
        }
    }

    @Test
    void backgroundAudioUploadRetainsTheRequestingUsersSecurityContext() {
        var result = new PodcastSpeechProvider.Result(new byte[48000], episode.getSpec().getTurns());
        when(speech.synthesize(anyString(), any(), any(), any())).thenReturn(Mono.just(result));
        var uploadedBy = new AtomicReference<String>();
        when(storage.save(any(), any())).thenReturn(ReactiveSecurityContextHolder.getContext()
            .switchIfEmpty(Mono.error(new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED)))
            .map(context -> {
                uploadedBy.set(context.getAuthentication().getName());
                return new PodcastAudioStorage.StoredAudio("new-audio", "/upload/new.wav");
            }));
        var user = UsernamePasswordAuthenticationToken.authenticated("podcast-editor", "", List.of());
        try {
            service.render("test").contextWrite(ReactiveSecurityContextHolder.withAuthentication(user)).block();
            await().atMost(Duration.ofSeconds(3)).untilAsserted(() ->
                assertThat(episode.getStatus().getPhase()).isEqualTo("READY"));
            assertThat(uploadedBy.get()).isEqualTo("podcast-editor");
            assertThat(episode.getSpec().getAudio().getUrl()).isEqualTo("/upload/new.wav");
        } finally {
            service.dispose();
        }
    }

    @Test
    void onlyPublishedPublicArticlesExposeFinishedAudio() {
        var post = new Post();
        var metadata = new Metadata();
        metadata.setName("test");
        metadata.setLabels(Map.of(Post.PUBLISHED_LABEL, "true"));
        post.setMetadata(metadata);
        var spec = new Post.PostSpec();
        spec.setTitle("文章");
        spec.setVisible(Post.VisibleEnum.PRIVATE);
        post.setSpec(spec);
        when(client.fetch(Post.class, "test")).thenReturn(Mono.just(post));
        assertThatThrownBy(() -> service.published("test").block()).isInstanceOf(ResponseStatusException.class).hasMessageContaining("404");
        spec.setVisible(Post.VisibleEnum.PUBLIC);
        assertThat(service.published("test").block().audio().getUrl()).isEqualTo("/upload/previous.wav");
        metadata.setLabels(Map.of(Post.PUBLISHED_LABEL, "false"));
        assertThatThrownBy(() -> service.published("test").block()).hasMessageContaining("404");
    }
}
