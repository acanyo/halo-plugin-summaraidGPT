package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import com.handsome.summary.podcast.model.SpeechModelCatalog;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class SpeechModelChannelsTest {
    @ParameterizedTest
    @ValueSource(strings = {"speech-2.8-turbo", "speech-2.8-hd", "speech-2.6-turbo", "speech-2.6-hd",
        "speech-02-turbo", "speech-02-hd", "speech-01-turbo", "speech-01-hd"})
    void allDirectMinimaxModelsBuildTheirOwnSupportedRequest(String model) {
        var settings = new VoiceService(model, "male-qn-qingse", "female-shaonv");
        settings.setLanguage(model.contains("2.8") || model.contains("2.6") ? "fil" : "uk");
        settings.setEmotion(model.contains("2.6") ? "fluent" : "happy");
        var request = SpeechRequestFactory.create("minimax", settings, new Turn("A", "你好"));
        assertThat(request.body().get("model")).isEqualTo(model);
        assertThat(request.body()).containsKeys("voice_setting", "audio_setting", "language_boost");
        assertThat(request.endpoint().getHost()).isEqualTo("api.minimax.cn");
        if (model.contains("2.6") || model.contains("01")) {
            assertThatThrownBy(() -> SpeechRequestFactory.create("bailian", settings, new Turn("A", "你好")))
                .hasMessageContaining("渠道不匹配");
        }
    }

    @Test
    void channelCapabilitiesDoNotLeakBetweenDirectMinimaxAndBailian() {
        var settings = new VoiceService("speech-02-hd", "male-qn-qingse", "female-shaonv");
        settings.setWorkspaceId("llm-space");
        settings.setEmotion("whisper");
        SpeechRequestFactory.create("bailian", settings, new Turn("A", "你好"));
        assertThatThrownBy(() -> SpeechRequestFactory.create("minimax", settings, new Turn("A", "你好")))
            .hasMessageContaining("不支持该情感");
        settings.setEmotion("");
        settings.setLanguage("fil");
        assertThatThrownBy(() -> SpeechRequestFactory.create("minimax", settings, new Turn("A", "你好")))
            .hasMessageContaining("不支持该语言");
        SpeechRequestFactory.create("bailian", settings, new Turn("A", "你好"));
    }

    @Test
    void fullSystemVoiceListsPreserveTheirInstructionAndLanguageBoundaries() {
        var qwen = new VoiceService("qwen-audio-3.1-tts-flash", "Emily_v3.1", "Eric_v3.1");
        qwen.setWorkspaceId("llm-space");
        qwen.setLanguage("en");
        qwen.setInstruction("Please speak naturally.");
        TurnSpeechProvider.validate("bailian", qwen, List.of());
        qwen.setLanguage("zh");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", qwen, List.of()))
            .hasMessageContaining("音色不支持该语言");
        var cosy = new VoiceService("cosyvoice-v3-flash", "longhuhu_v3", "longanyang");
        cosy.setWorkspaceId("llm-space");
        cosy.setEmotion("happy");
        TurnSpeechProvider.validate("bailian", cosy, List.of());
        cosy.setVoiceA("longpaopao_v3");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", cosy, List.of()))
            .hasMessageContaining("不支持已配置");
        assertThat(SpeechModelCatalog.requireForProvider("minimax", "speech-2.8-hd").voices()).hasSizeGreaterThan(300);
        assertThat(SpeechModelCatalog.requireForProvider("bailian", "speech-2.8-hd").voices()).hasSize(2);
    }
}
