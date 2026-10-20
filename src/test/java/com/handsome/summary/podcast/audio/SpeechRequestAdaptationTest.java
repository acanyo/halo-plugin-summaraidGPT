package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.net.URI;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class SpeechRequestAdaptationTest {
    private final SpeechTransport transport = mock(SpeechTransport.class);
    private final TurnSpeechProvider provider = new TurnSpeechProvider(transport);
    private final ObjectMapper mapper = new ObjectMapper();
    private final byte[] pcm = new byte[PcmAudio.BYTES_PER_SECOND];

    @Test
    void qwenUsesWorkspaceSynthesisAndModelSpecificTagsWithoutChangingTheTranscript() {
        var voice = qwen();
        voice.setInstruction("请用温暖自然的语气表达。");
        voice.setLanguage("zh");
        voice.setEmotion("sad");
        var turn = turn("正文[提示]", "excited", "laughing");
        var sent = captureUrlResponse();

        var result = provider.synthesize("bailian", voice, List.of(turn), count -> { }).block();

        assertThat(provider.supports("bailian")).isTrue();
        assertThat(sent.get().path("model").asText()).isEqualTo("qwen-audio-3.1-tts-flash");
        var input = sent.get().path("input");
        assertThat(input.path("text").asText()).isEqualTo("[excited][laughing]正文[提示]");
        assertThat(input.path("instruction").asText()).isEqualTo(voice.getInstruction());
        assertThat(input.path("language_hints").get(0).asText()).isEqualTo("zh");
        assertThat(input.path("format").asText()).isEqualTo("pcm");
        assertThat(input.path("sample_rate").asInt()).isEqualTo(24000);
        verify(transport).post(org.mockito.ArgumentMatchers.eq(URI.create(
            "https://llm-workspace.cn-beijing.maas.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer")), any(), any());
        assertThat(result.turns().getFirst().getText()).isEqualTo("正文[提示]");
        assertThat(result.turns().getFirst().getEmotion()).isEqualTo("excited");
        assertThat(result.turns().getFirst().getInterjection()).isEqualTo("laughing");
        assertThat(result.turns().getFirst().getEndMs()).isEqualTo(1000);
    }

    @Test
    void turnEmotionOverridesTheGlobalDefaultAndManualQwenTagsRemainAvailable() {
        var voice = qwen();
        voice.setEmotion("excited");
        var sent = captureUrlResponse();
        provider.synthesizeTurn("bailian-cosyvoice", voice, new Turn("A", "正文")).block();
        assertThat(sent.get().path("input").path("text").asText()).isEqualTo("[excited]正文");
        provider.synthesizeTurn("bailian", voice, turn("[serious]正文[giggles]", "neutral", null)).block();
        assertThat(sent.get().path("input").path("text").asText()).isEqualTo("[serious]正文[giggles]");
    }

    @Test
    void cosyvoiceUsesAFixedEmotionInstructionAndRemovesOnlyRecognizedQwenTags() {
        var voice = cosyvoice("cosyvoice-v3-flash");
        voice.setEmotion("happy");
        var sent = captureUrlResponse();
        provider.synthesizeTurn("bailian", voice, new Turn("A", "[excited][laughing]正文[提示]和[产品A]")).block();
        var input = sent.get().path("input");
        assertThat(input.path("text").asText()).isEqualTo("正文[提示]和[产品A]");
        assertThat(input.path("instruction").asText()).isEqualTo("你说话的情感是happy。");
        assertThat(input.has("emotion")).isFalse();
    }

    @Test
    void fixedVoiceInstructionsMustFollowTheKnownTemplateAndTurnEmotionOverridesItsValue() {
        var voice = cosyvoice("cosyvoice-v3-flash");
        voice.setInstruction("你说话的情感是sad。");
        var sent = captureUrlResponse();
        provider.synthesizeTurn("bailian", voice, turn("正文", "happy", null)).block();
        assertThat(sent.get().path("input").path("instruction").asText()).isEqualTo("你说话的情感是happy。");
        voice.setInstruction("随便用一种特别的语气。");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("固定情感指令");
    }

    @Test
    void cosyvoiceCustomVoicesUseFreeInstructionsOnlyWhenTheModelAllowsThem() {
        var voice = cosyvoice("cosyvoice-v3-flash");
        voice.setVoiceA("cosyvoice-v3-flash-custom-a");
        voice.setVoiceB("cosyvoice-v3-flash-custom-b");
        voice.setInstruction("语速稍慢，温暖自然。");
        voice.setEmotion("happy");
        var sent = captureUrlResponse();
        provider.synthesizeTurn("bailian", voice, new Turn("A", "正文")).block();
        assertThat(sent.get().path("input").path("instruction").asText())
            .contains("语速稍慢，温暖自然。", "请用高兴的情感表达。");
        voice.setModel("cosyvoice-v3-plus");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("自定义音色不属于所选语音模型");
        voice.setVoiceA("cosyvoice-v3-plus-custom-a");
        voice.setVoiceB("cosyvoice-v3-plus-custom-b");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("不支持已配置");
        voice.setModel("cosyvoice-v3.5-flash");
        voice.setVoiceA("cosyvoice-v3.5-flash-custom-a");
        voice.setVoiceB("cosyvoice-v3.5-flash-custom-b");
        TurnSpeechProvider.validate("bailian", voice, List.of());
        voice.setVoiceB("longanhuan");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("其他语音模型");
    }

    @Test
    void unknownSystemVoicesDoNotGainUnsupportedInstructionCapabilities() {
        var voice = cosyvoice("cosyvoice-v3-flash");
        voice.setVoiceA("unlisted-system-voice");
        voice.setInstruction("请说慢一点。");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("不支持");
        voice.setInstruction("");
        TurnSpeechProvider.validate("bailian", voice, List.of());
        var englishVoice = qwen();
        englishVoice.setModel("qwen-audio-3.0-tts-flash");
        englishVoice.setVoiceA("loongmary");
        englishVoice.setVoiceB("loongjohn");
        englishVoice.setInstruction("Slowly and warmly.");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", englishVoice, List.of()))
            .hasMessageContaining("未确认支持");
    }

    @Test
    void clonedVoicesMustMatchTheFullTargetModelBeforeAnyPaidRequest() {
        var voice = qwen();
        voice.setVoiceA("qwen-audio-3.0-tts-flash-custom-a");
        assertThatThrownBy(() -> provider.synthesize("bailian", voice, List.of(new Turn("A", "正文")), count -> { }).block())
            .hasMessageContaining("自定义音色不属于所选语音模型");
        voice.setVoiceA("qwen-audio-3.1-tts-flash-custom-a");
        TurnSpeechProvider.validate("bailian", voice, List.of());
        var settings = new com.handsome.summary.podcast.model.PodcastSettings();
        settings.setProvider("bailian");
        var cosy = cosyvoice("cosyvoice-v3.5-flash");
        cosy.setVoiceA("cosyvoice-v3-flash-custom-a");
        cosy.setVoiceB("cosyvoice-v3.5-flash-custom-b");
        settings.setBailian(cosy);
        assertThat(com.handsome.summary.podcast.model.SpeechExpressionCapabilities.from(settings).emotions()).isEmpty();
        cosy.setVoiceA("cosyvoice-v3.5-flash-custom-a");
        assertThat(com.handsome.summary.podcast.model.SpeechExpressionCapabilities.from(settings).emotions()).contains("happy");
        verifyNoInteractions(transport);
    }

    @Test
    void mergedCosyvoiceInstructionsRespectTheWeightedHundredCharacterLimit() {
        var voice = cosyvoice("cosyvoice-v3.5-plus");
        voice.setVoiceA("cosyvoice-v3.5-plus-custom-a");
        voice.setVoiceB("cosyvoice-v3.5-plus-custom-b");
        voice.setInstruction("字".repeat(50));
        TurnSpeechProvider.validate("bailian", voice, List.of());
        voice.setInstruction("字".repeat(51));
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("100 字符");
        voice.setInstruction("x".repeat(100));
        TurnSpeechProvider.validate("bailian", voice, List.of());
        voice.setEmotion("happy");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("合并后");
        verifyNoInteractions(transport);
    }

    @Test
    void naturalLanguageInstructionsAreBoundedBeforeCallingTheProvider() {
        var voice = qwen();
        voice.setInstruction("字".repeat(200));
        TurnSpeechProvider.validate("bailian", voice, List.of());
        voice.setInstruction("字".repeat(201));
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("不能超过 200 字");
        verifyNoInteractions(transport);
    }

    @Test
    void minimaxKeepsItsDistinctBodyAndMapsEmotionInterjectionAndLanguageForBothChannels() {
        var voice = minimax();
        voice.setEmotion("sad");
        voice.setLanguage("yue");
        var turn = turn("[excited]正文[提示]", "neutral", "laughing");
        var sent = captureHexResponse();
        provider.synthesizeTurn("bailian", voice, turn).block();
        assertThat(sent.get().path("model").asText()).isEqualTo("MiniMax/speech-2.8-turbo");
        var input = sent.get().path("input");
        assertThat(input.path("text").asText()).isEqualTo("(laughs)正文[提示]");
        assertThat(input.path("voice_setting").path("emotion").asText()).isEqualTo("calm");
        assertThat(input.path("language_boost").asText()).isEqualTo("Chinese,Yue");
        assertThat(input.path("output_format").asText()).isEqualTo("hex");
        assertThat(input.has("instruction")).isFalse();
        assertThat(input.has("language_hints")).isFalse();
        provider.synthesizeTurn("minimax", voice, turn).block();
        assertThat(sent.get().has("input")).isFalse();
        assertThat(sent.get().path("model").asText()).isEqualTo("speech-2.8-turbo");
        assertThat(sent.get().path("stream").asBoolean(true)).isFalse();
        assertThat(sent.get().path("voice_setting").path("emotion").asText()).isEqualTo("calm");
    }

    @Test
    void minimaxRejectsUnsupportedWhisperRichTagsAndInstructionsBeforeAnyRequest() {
        var voice = minimax();
        voice.setEmotion("whisper");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("不支持该情感");
        voice.setModel("speech-02-turbo");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("minimax", voice, List.of()))
            .hasMessageContaining("不支持该情感");
        TurnSpeechProvider.validate("bailian", voice, List.of());
        voice.setEmotion("");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("minimax", voice, List.of(turn("正文", null, "laughing"))))
            .hasMessageContaining("不支持该语气词");
        voice.setEmotion("");
        voice.setInstruction("轻松聊天");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("minimax", voice, List.of()))
            .hasMessageContaining("不支持自然语言语音指令");
        verifyNoInteractions(transport);
    }

    @Test
    void preflightsEveryTurnSoALaterUnsupportedExpressionDoesNotBillTheEarlierTurns() {
        var voice = cosyvoice("cosyvoice-v3-flash");
        var turns = List.of(new Turn("A", "第一轮"), turn("第二轮", null, "laughing"));
        assertThatThrownBy(() -> provider.synthesize("bailian", voice, turns, count -> { }).block())
            .hasMessageContaining("不支持该语气词");
        verifyNoInteractions(transport);
    }

    @Test
    void languageAndKnownVoiceChecksUseTheActualModelAndVoiceCapabilities() {
        var voice = qwen();
        voice.setLanguage("ja");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("音色不支持该语言");
        voice.setLanguage("");
        voice.setVoiceA("longanyang");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("其他语音模型");
        voice.setVoiceA("longanyang_v3.1");
        voice.setLanguage("unknown");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("语音模型不支持该语言");
        verifyNoInteractions(transport);
    }

    @Test
    void endpointsPreserveLegacyMinimaxWhileRequiringWorkspaceForUnifiedBailian() {
        var voice = minimax();
        assertThat(TurnSpeechProvider.endpoint("bailian", voice).toString())
            .isEqualTo("https://llm-workspace.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation");
        voice.setWorkspaceId(null);
        assertThat(TurnSpeechProvider.endpoint("bailian-minimax", voice).toString())
            .isEqualTo("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation");
        assertThat(TurnSpeechProvider.endpoint("minimax", voice).toString()).isEqualTo("https://api.minimax.cn/v1/t2a_v2");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian", voice, List.of()))
            .hasMessageContaining("业务空间 ID");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian-cosyvoice", voice, List.of()))
            .hasMessageContaining("渠道不匹配");
        voice.setWorkspaceId("bad/host");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("bailian-minimax", voice, List.of()))
            .hasMessageContaining("格式不正确");
        verifyNoInteractions(transport);
    }

    @Test
    void doubaoDoesNotReceiveUnsupportedLabelsAndPreservesOrdinaryBracketedText() {
        var voice = new VoiceService("podcast", "a", "b");
        voice.setApiKey("test-key");
        assertThat(SpeechExpressionAdapter.doubaoText(new Turn("A", "[laughing]正文[第一部分]")))
            .isEqualTo("正文[第一部分]");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("doubao", voice, List.of(turn("正文", "happy", null))))
            .hasMessageContaining("逐轮情感");
        voice.setLanguage("zh");
        assertThatThrownBy(() -> TurnSpeechProvider.validate("doubao", voice, List.of()))
            .hasMessageContaining("语言设置");
        verifyNoInteractions(transport);
    }

    private AtomicReference<JsonNode> captureUrlResponse() {
        var sent = new AtomicReference<JsonNode>();
        when(transport.post(any(), any(), any())).thenAnswer(call -> {
            sent.set(mapper.valueToTree(call.getArgument(2)));
            return Mono.just(mapper.valueToTree(Map.of("output", Map.of("audio", Map.of(
                "url", "https://result.oss-cn-beijing.aliyuncs.com/audio.pcm")))));
        });
        when(transport.download(any())).thenReturn(Mono.just(pcm));
        return sent;
    }

    private AtomicReference<JsonNode> captureHexResponse() {
        var sent = new AtomicReference<JsonNode>();
        when(transport.post(any(), any(), any())).thenAnswer(call -> {
            JsonNode body = mapper.valueToTree(call.getArgument(2));
            sent.set(body);
            var audio = Map.of("base_resp", Map.of("status_code", 0), "data", Map.of("audio", HexFormat.of().formatHex(pcm)));
            return Mono.just(mapper.valueToTree(body.has("input") ? Map.of("output", audio) : audio));
        });
        return sent;
    }

    private VoiceService qwen() {
        return settings("qwen-audio-3.1-tts-flash", "longanyang_v3.1", "longanhuan_v3.1");
    }

    private VoiceService cosyvoice(String model) { return settings(model, "longanyang", "longanhuan"); }

    private VoiceService minimax() { return settings("speech-2.8-turbo", "male-qn-qingse", "female-shaonv"); }

    private VoiceService settings(String model, String voiceA, String voiceB) {
        var settings = new VoiceService(model, voiceA, voiceB);
        settings.setApiKey("test-key");
        settings.setWorkspaceId("llm-workspace");
        return settings;
    }

    private Turn turn(String text, String emotion, String interjection) {
        var turn = new Turn("A", text);
        turn.setEmotion(emotion);
        turn.setInterjection(interjection);
        return turn;
    }
}
