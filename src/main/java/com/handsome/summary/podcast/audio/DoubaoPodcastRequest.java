package com.handsome.summary.podcast.audio;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.util.List;
import java.util.Map;

/** Validates native podcast inputs and builds the documented action=3 request. */
final class DoubaoPodcastRequest {
    private DoubaoPodcastRequest() { }

    static void validate(VoiceService settings, List<Turn> turns) {
        if (settings == null) throw new IllegalArgumentException("请配置豆包播客语音服务");
        if (!"podcast".equals(text(settings.getModel()))) {
            throw new IllegalArgumentException("豆包原生播客仅支持 podcast 模型，请重新选择");
        }
        var key = text(settings.getApiKey());
        if (key.isEmpty()) throw new IllegalArgumentException("请配置豆包播客 API Key");
        if (key.length() > 4096 || key.chars().anyMatch(value -> value <= 32 || value > 126)) {
            throw new IllegalArgumentException("豆包播客 API Key 格式不正确");
        }
        var voiceA = text(settings.getVoiceA());
        var voiceB = text(settings.getVoiceB());
        if (voiceA.isEmpty() || voiceB.isEmpty() || voiceA.equals(voiceB)) {
            throw new IllegalArgumentException("请为两位主持人选择两个不同的豆包音色");
        }
        if (!voiceA.matches("[A-Za-z0-9_.-]{1,200}") || !voiceB.matches("[A-Za-z0-9_.-]{1,200}")) {
            throw new IllegalArgumentException("豆包音色 ID 格式不正确");
        }
        var rate = settings.getSpeechRate();
        if (rate != null && (rate < -50 || rate > 100)) {
            throw new IllegalArgumentException("豆包播客语速须在 -50 到 100 之间");
        }
        if (Boolean.TRUE.equals(settings.getUseHeadMusic()) || Boolean.TRUE.equals(settings.getUseTailMusic())) {
            throw new IllegalArgumentException("豆包片头片尾音效的时间轴尚未兼容，请关闭音效后再合成");
        }
        if (Boolean.TRUE.equals(settings.getAutoEmotion())) {
            throw new IllegalArgumentException("豆包原生播客暂不支持自动情感，请关闭后再合成");
        }
        if (turns == null) throw new IllegalArgumentException("请提供播客台词");
        SpeechExpressionAdapter.validateDoubao(settings, List.of());
        var total = 0;
        for (var turn : turns) {
            if (turn == null || !("A".equals(turn.getSpeaker()) || "B".equals(turn.getSpeaker()))) {
                throw new IllegalArgumentException("每轮需选择主持人 A 或 B");
            }
            var content = SpeechExpressionAdapter.doubaoText(turn);
            var length = content.codePointCount(0, content.length());
            if (length > 300) throw new IllegalArgumentException("豆包原生播客每轮台词不能超过 300 字符，请拆分长台词");
            total += length;
        }
        if (total > 10000) throw new IllegalArgumentException("豆包原生播客台词合计不能超过 10000 字符");
    }

    static Map<String, Object> body(VoiceService settings, List<Turn> turns) {
        return Map.of("action", 3,
            "use_head_music", false,
            "use_tail_music", false,
            "audio_config", Map.of("format", "pcm", "sample_rate", PcmAudio.SAMPLE_RATE,
                "speech_rate", settings.getSpeechRate() == null ? 0 : settings.getSpeechRate()),
            "nlp_texts", turns.stream().map(turn -> Map.of("speaker", voice(settings, turn),
                "text", SpeechExpressionAdapter.doubaoText(turn))).toList());
    }

    static String voice(VoiceService settings, Turn turn) {
        return text("A".equals(turn.getSpeaker()) ? settings.getVoiceA() : settings.getVoiceB());
    }

    private static String text(String value) { return value == null ? "" : value.strip(); }
}
