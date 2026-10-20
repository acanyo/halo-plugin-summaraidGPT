package com.handsome.summary.podcast.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.handsome.summary.podcast.audio.PodcastSpeechProvider;
import com.handsome.summary.podcast.extension.ArticlePodcast;
import com.handsome.summary.podcast.model.PodcastSettings;
import com.handsome.summary.reading.model.ArticleReadingSource;
import com.handsome.summary.reading.service.ArticleReadingContentLoader;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.SettingConfigGetter;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ReactiveExtensionClient;

class PodcastStyleTest {
    private final AiFoundationAiService ai = mock(AiFoundationAiService.class);
    private final SettingConfigGetter modelSettings = mock(SettingConfigGetter.class);
    private final PodcastScriptService scripts = new PodcastScriptService(ai, modelSettings);
    private final PodcastRepository repository = mock(PodcastRepository.class);
    private final PodcastConfigService config = mock(PodcastConfigService.class);
    private final ArticleReadingContentLoader contentLoader = mock(ArticleReadingContentLoader.class);
    private final PodcastAudioStorage storage = mock(PodcastAudioStorage.class);
    private final PodcastSpeechProvider speech = mock(PodcastSpeechProvider.class);
    private final PodcastService service = new PodcastService(repository, config, scripts, contentLoader,
        storage, List.of(speech), mock(ReactiveExtensionClient.class));
    private final PodcastSettings podcast = new PodcastSettings();
    private final ArticlePodcast episode = new ArticlePodcast();
    private final ArticleReadingSource source = new ArticleReadingSource("post", "文章", "/post", "文章正文", "hash");
    private final AtomicReference<String> prompt = new AtomicReference<>();

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        podcast.setEnabled(true);
        when(config.get()).thenReturn(Mono.just(podcast));
        when(contentLoader.load("post")).thenReturn(Mono.just(source));
        when(modelSettings.getAiConfigForFunction("podcast"))
            .thenReturn(Mono.just(new SettingConfigGetter.AiConfigResult()));
        when(ai.generateText(anyString(), any())).thenAnswer(call -> {
            prompt.set(call.getArgument(0));
            return Mono.just("""
                {"turns":[{"speaker":"A","text":"问题"},{"speaker":"B","text":"解释"},
                {"speaker":"A","text":"追问"},{"speaker":"B","text":"回答"}]}
                """);
        });
        when(repository.update(anyString(), any())).thenAnswer(call -> Mono.fromSupplier(() -> {
            ((Consumer<ArticlePodcast>) call.getArgument(1)).accept(episode);
            return episode;
        }));
    }

    @AfterEach
    void cleanup() {
        service.dispose();
    }

    @Test
    void customStyleIsTrimmedStoredAndSentToTheModelWithTheContentAndOutputConstraints() {
        var style = "温暖自然的访谈，以生活中的例子解释观点";
        service.generateScript("post", 2, " \n" + style + "\t ").block();

        await().atMost(Duration.ofSeconds(3)).untilAsserted(() ->
            assertThat(episode.getStatus().getPhase()).isEqualTo("DRAFT"));
        assertThat(episode.getSpec().getStyle()).isEqualTo(style);
        assertThat(prompt.get()).contains("<style-description>" + style + "</style-description>",
            "忠实于原文", "不添加原文没有的数据或经历", "仅返回 JSON 对象");
        verifyNoInteractions(speech, storage);
    }

    @Test
    void presetStylesKeepTheirChineseDescriptions() {
        scripts.generate(source, 2, " casual ", podcast).block();
        assertThat(prompt.get()).contains("<style-description>轻松交流，简洁易懂</style-description>");
        scripts.generate(source, 2, "deep", podcast).block();
        assertThat(prompt.get()).contains("<style-description>深入解读，关注论据和边界</style-description>");
    }

    @Test
    void customStyleCanUseTheFullTwoHundredCharacterLimit() {
        var style = "字".repeat(200);
        assertThat(scripts.generate(source, 1, style, podcast).block()).hasSize(4);
        assertThat(prompt.get()).contains("<style-description>" + style + "</style-description>");
    }

    @Test
    void invalidStylesAreRejectedBeforeStartingAJobOrCallingAModel() {
        for (var style : new String[] {null, "", " \n\t ", "字".repeat(201)}) {
            assertThatThrownBy(() -> service.generateScript("post", 2, style).block())
                .isInstanceOfSatisfying(ResponseStatusException.class, error ->
                    assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST))
                .hasMessageContaining("1～200 字");
            assertThatThrownBy(() -> scripts.generate(source, 2, style, podcast).block())
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("1～200 字");
        }
        verifyNoInteractions(repository, config, contentLoader, modelSettings, ai, speech, storage);
        assertThat(episode.getStatus().getUpdatedAt()).isNull();
    }
}
