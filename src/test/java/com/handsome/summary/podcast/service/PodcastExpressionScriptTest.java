package com.handsome.summary.podcast.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings;
import com.handsome.summary.reading.model.ArticleReadingSource;
import com.handsome.summary.reading.support.ArticleReadingHash;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class PodcastExpressionScriptTest {
    private final AiFoundationAiService ai = mock(AiFoundationAiService.class);
    private final SettingConfigGetter modelSettings = mock(SettingConfigGetter.class);
    private final PodcastScriptService scripts = new PodcastScriptService(ai, modelSettings);
    private final PodcastSettings settings = new PodcastSettings();
    private final AtomicReference<String> prompt = new AtomicReference<>();
    private final ArticleReadingSource source = new ArticleReadingSource("post", "文章", "/post", "正文", "hash");

    @BeforeEach
    void setup() {
        settings.getBailian().setModel("qwen-audio-3.1-tts-flash");
        settings.getBailian().setVoiceA("longanyang_v3.1");
        settings.getBailian().setVoiceB("longanhuan_v3.1");
        when(modelSettings.getAiConfigForFunction("podcast"))
            .thenReturn(Mono.just(new SettingConfigGetter.AiConfigResult()));
        when(ai.generateText(anyString(), any())).thenAnswer(call -> {
            prompt.set(call.getArgument(0));
            return Mono.just("""
                {"turns":[{"speaker":"A","text":"问题","emotion":"curious","interjection":"laughing"},
                {"speaker":"B","text":"解释","emotion":"sad"},
                {"speaker":"A","text":"追问"},{"speaker":"B","text":"回答"}]}
                """);
        });
    }

    @Test
    void automaticExpressionsAreStructuredAndSurviveDraftValidation() {
        settings.getBailian().setAutoEmotion(true);
        var turns = scripts.generate(source, 2, "casual", settings).block();
        assertThat(prompt.get()).contains("emotion", "curious", "interjection", "text 仍是纯台词");
        assertThat(turns.getFirst().getText()).isEqualTo("问题");
        assertThat(turns.getFirst().getEmotion()).isEqualTo("curious");
        assertThat(turns.getFirst().getInterjection()).isEqualTo("laughing");
        turns.getFirst().setStartMs(123L);
        var validated = PodcastScriptService.validate(turns);
        assertThat(validated.getFirst().getEmotion()).isEqualTo("curious");
        assertThat(validated.getFirst().getInterjection()).isEqualTo("laughing");
        assertThat(validated.getFirst().getStartMs()).isNull();
    }

    @Test
    void disabledAutomaticExpressionsAndUnsupportedModelFeaturesDoNotLeakIntoGeneratedScripts() {
        var disabled = scripts.generate(source, 2, "casual", settings).block();
        assertThat(disabled).allSatisfy(turn -> {
            assertThat(turn.getEmotion()).isNull();
            assertThat(turn.getInterjection()).isNull();
        });
        settings.getBailian().setModel("cosyvoice-v3-flash");
        settings.getBailian().setVoiceA("longanyang");
        settings.getBailian().setVoiceB("longanhuan");
        settings.getBailian().setAutoEmotion(true);
        var cosy = scripts.generate(source, 2, "casual", settings).block();
        assertThat(cosy.getFirst().getEmotion()).isNull(); // curious is not a CosyVoice emotion.
        assertThat(cosy).allSatisfy(turn -> assertThat(turn.getInterjection()).isNull());
        assertThat(cosy.get(1).getEmotion()).isEqualTo("sad");
    }

    @Test
    void expressionChangesInvalidateAudioWithoutInvalidatingLegacyPlainScripts() {
        var plain = List.of(new Turn("A", "问题"), new Turn("B", "解释"));
        var legacyHash = ArticleReadingHash.sha256("A:问题\nB:解释");
        assertThat(PodcastService.scriptHash(plain)).isEqualTo(legacyHash);
        plain.getFirst().setEmotion("curious");
        var emotionalHash = PodcastService.scriptHash(plain);
        assertThat(emotionalHash).isNotEqualTo(legacyHash);
        plain.getFirst().setInterjection("laughing");
        assertThat(PodcastService.scriptHash(plain)).isNotEqualTo(emotionalHash);
    }

    @Test
    void invalidExpressionValuesAreRejectedRatherThanTurnedIntoProviderInstructions() {
        var turns = List.of(new Turn("A", "问题"), new Turn("B", "解释"), new Turn("A", "追问"), new Turn("B", "回答"));
        turns.getFirst().setEmotion("arbitrary-provider-instruction");
        assertThatThrownBy(() -> PodcastScriptService.validate(turns)).hasMessageContaining("有效的语音情感");
        turns.getFirst().setEmotion(null);
        turns.getFirst().setInterjection("arbitrary-sound");
        assertThatThrownBy(() -> PodcastScriptService.validate(turns)).hasMessageContaining("有效的拟声效果");
    }
}
