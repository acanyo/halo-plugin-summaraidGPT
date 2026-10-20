package com.handsome.summary.podcast.audio;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import com.handsome.summary.podcast.model.SpeechModelCatalog;
import com.handsome.summary.podcast.model.SpeechModelCatalog.SpeechModel;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Builds speech requests without performing I/O, so every turn can be checked before billing starts. */
final class SpeechRequestFactory {
    private static final String SYNTHESIS_PATH = "/api/v1/services/audio/tts/SpeechSynthesizer";
    private static final String MINIMAX_PATH = "/api/v1/services/aigc/multimodal-generation/generation";

    private SpeechRequestFactory() { }

    record Request(URI endpoint, Map<String, Object> body, boolean minimax, boolean bailian) { }

    static Request create(String provider, VoiceService settings, Turn turn) {
        var model = model(provider, settings);
        if (turn == null || !("A".equals(turn.getSpeaker()) || "B".equals(turn.getSpeaker()))) {
            throw new IllegalArgumentException("每轮需选择主持人 A 或 B");
        }
        var voice = "A".equals(turn.getSpeaker()) ? settings.getVoiceA() : settings.getVoiceB();
        if (voice == null || voice.isBlank()) throw new IllegalArgumentException("请为两位主持人选择音色");
        voice = voice.strip();
        var selectedVoice = voice;
        if (SpeechModelCatalog.voice(model, voice).isEmpty() && SpeechModelCatalog.catalog().models().stream()
            .anyMatch(candidate -> SpeechModelCatalog.voice(candidate, selectedVoice).isPresent())) {
            throw new IllegalArgumentException("所选音色属于其他语音模型，请为当前模型重新选择音色");
        }
        if ((voice.startsWith("qwen-audio-") || voice.startsWith("cosyvoice-"))
            && !SpeechModelCatalog.customVoice(model, voice)) {
            throw new IllegalArgumentException("自定义音色不属于所选语音模型，请填写与目标模型一致的音色 ID");
        }
        if (model.customVoicesOnly() && !SpeechModelCatalog.customVoice(model, voice)) {
            throw new IllegalArgumentException("所选 CosyVoice 模型仅支持复刻或设计音色，请填写对应模型的自定义音色 ID");
        }
        var expression = SpeechExpressionAdapter.adapt(model, settings, turn, voice);
        var input = new LinkedHashMap<String, Object>();
        input.put("text", expression.text());
        boolean minimax = "minimax".equals(model.family());
        boolean bailian = !"minimax".equals(provider);
        if (minimax) {
            var voiceSetting = new LinkedHashMap<String, Object>();
            voiceSetting.put("voice_id", voice);
            voiceSetting.put("speed", 1);
            voiceSetting.put("vol", 1);
            voiceSetting.put("pitch", 0);
            if (!expression.emotion().isEmpty()) voiceSetting.put("emotion", expression.emotion());
            input.put("voice_setting", voiceSetting);
            input.put("audio_setting", Map.of("format", "pcm", "sample_rate", PcmAudio.SAMPLE_RATE, "channel", 1));
            input.put("output_format", "hex");
            if (!expression.language().isEmpty()) input.put("language_boost", expression.language());
        } else {
            input.put("voice", voice);
            input.put("format", "pcm");
            input.put("sample_rate", PcmAudio.SAMPLE_RATE);
            if (!expression.instruction().isEmpty()) input.put("instruction", expression.instruction());
            if (!expression.language().isEmpty()) input.put("language_hints", List.of(expression.language()));
        }
        Map<String, Object> body;
        if (bailian) body = Map.of("model", model.id(), "input", input);
        else {
            body = new LinkedHashMap<>(input);
            body.put("model", model.id().substring("MiniMax/".length()));
            body.put("stream", false);
        }
        return new Request(endpoint(provider, settings, model), body, minimax, bailian);
    }

    static URI endpoint(String provider, VoiceService settings) {
        return endpoint(provider, settings, model(provider, settings));
    }

    private static URI endpoint(String provider, VoiceService settings, SpeechModel model) {
        if ("minimax".equals(provider)) return URI.create("https://api.minimax.cn/v1/t2a_v2");
        var workspace = settings.getWorkspaceId() == null ? "" : settings.getWorkspaceId().strip();
        if (workspace.isEmpty()) {
            if ("bailian-minimax".equals(provider)) return URI.create("https://dashscope.aliyuncs.com" + MINIMAX_PATH);
            throw new IllegalArgumentException("请在播客设置中填写百炼北京地域的业务空间 ID");
        }
        if (!workspace.matches("[A-Za-z0-9-]{1,100}")) throw new IllegalArgumentException("百炼业务空间 ID 格式不正确");
        return URI.create("https://" + workspace + ".cn-beijing.maas.aliyuncs.com"
            + ("minimax".equals(model.family()) ? MINIMAX_PATH : SYNTHESIS_PATH));
    }

    private static SpeechModel model(String provider, VoiceService settings) {
        if (provider == null || !List.of("bailian", "bailian-cosyvoice", "bailian-minimax", "minimax").contains(provider)) {
            throw new IllegalArgumentException("不支持的逐轮语音服务");
        }
        if (settings == null) throw new IllegalArgumentException("请配置语音服务");
        var model = SpeechModelCatalog.requireForProvider(provider, settings.getModel() == null ? null : settings.getModel().strip());
        if (("minimax".equals(provider) || "bailian-minimax".equals(provider)) && !"minimax".equals(model.family())
            || "bailian-cosyvoice".equals(provider) && "minimax".equals(model.family())) {
            throw new IllegalArgumentException("所选语音模型与当前渠道不匹配，请重新选择");
        }
        return model;
    }
}
