package com.handsome.summary.podcast.audio;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import com.handsome.summary.podcast.model.SpeechModelCatalog;
import com.handsome.summary.podcast.model.SpeechModelCatalog.SpeechModel;
import java.util.List;
import java.util.regex.Pattern;

/** Converts structured expression choices into each speech model's documented wire format. */
final class SpeechExpressionAdapter {
    private static final List<String> QWEN_TAGS = List.of(
        "sad", "amazed", "deep and loud shouting", "trembling", "angry", "excited", "sarcastic",
        "curious", "like dracula", "bored", "tired", "scornful", "shouting", "asmr", "panicked",
        "mischievously", "empathetic", "whispers", "reluctantly", "crying", "serious", "very slowly",
        "very fast", "gasp", "sighing", "clears throat", "giggles", "laughing", "cough", "snorts");
    private static final Pattern QWEN_TAG_PATTERN = Pattern.compile("\\[(?:"
        + QWEN_TAGS.stream().map(Pattern::quote).collect(java.util.stream.Collectors.joining("|")) + ")\\]");

    private SpeechExpressionAdapter() { }

    record Expression(String text, String instruction, String emotion, String language) { }

    static Expression adapt(SpeechModel model, VoiceService settings, Turn turn, String voiceId) {
        var emotion = text(turn.getEmotion());
        if (emotion.isEmpty()) emotion = text(settings.getEmotion());
        requireChoice(emotion, model.emotions(), "所选语音模型不支持该情感，请重新选择");
        var interjection = text(turn.getInterjection());
        requireChoice(interjection, model.interjections(), "所选语音模型不支持该语气词，请清除后再合成");
        var language = text(settings.getLanguage());
        requireChoice(language, model.languages(), "所选语音模型不支持该语言，请重新选择");
        SpeechModelCatalog.voice(model, voiceId).ifPresent(voice ->
            { if (!voice.languages().isEmpty()) requireChoice(language, voice.languages(), "所选音色不支持该语言，请选择两位主持人均支持的语言"); });
        var instruction = text(settings.getInstruction());
        if (instruction.length() > 200) throw new IllegalArgumentException("语音指令不能超过 200 字，请缩短后再合成");
        var content = text(turn.getText());
        if (content.isEmpty()) throw new IllegalArgumentException("播客台词不能为空");

        if ("qwen".equals(model.family())) {
            var mode = instructionMode(model, voiceId);
            if (!instruction.isEmpty() && !"free".equals(mode)) {
                throw new IllegalArgumentException("所选音色未确认支持自然语言语音指令，请清除指令或选择支持的音色");
            }
            var emotionTag = emotion.isEmpty() ? "" : SpeechModelCatalog.emotion(emotion)
                .orElseThrow(() -> new IllegalArgumentException("请选择有效的情感")).qwenTag();
            var interjectionTag = interjection.isEmpty() ? "" : SpeechModelCatalog.interjection(interjection)
                .orElseThrow(() -> new IllegalArgumentException("请选择有效的语气词")).qwenTag();
            return new Expression(tag(emotionTag, "[", "]") + tag(interjectionTag, "[", "]") + content,
                instruction, "", language);
        }

        content = withoutQwenTags(content);
        if (content.isBlank()) throw new IllegalArgumentException("清除不兼容的语音标签后，播客台词不能为空");
        if ("minimax".equals(model.family())) {
            if (!instruction.isEmpty()) throw new IllegalArgumentException("MiniMax 不支持自然语言语音指令，请使用情感选项");
            var nativeEmotion = emotion.isEmpty() ? "" : SpeechModelCatalog.emotion(emotion)
                .orElseThrow(() -> new IllegalArgumentException("请选择有效的情感")).minimaxValue();
            var nativeInterjection = interjection.isEmpty() ? "" : SpeechModelCatalog.interjection(interjection)
                .orElseThrow(() -> new IllegalArgumentException("请选择有效的语气词")).minimaxTag();
            var nativeLanguage = language.isEmpty() ? "" : SpeechModelCatalog.language(language)
                .orElseThrow(() -> new IllegalArgumentException("请选择有效的语言")).minimaxValue();
            return new Expression(tag(nativeInterjection, "(", ")") + content, "", nativeEmotion, nativeLanguage);
        }

        var mode = instructionMode(model, voiceId);
        if ("fixed".equals(mode)) {
            var voice = SpeechModelCatalog.voice(model, voiceId).orElseThrow();
            requireChoice(emotion, voice.emotions(), "所选音色不支持该情感，请重新选择");
            var allowedInstructions = voice.emotions().stream()
                .map(value -> voice.emotionTemplate().replace("{emotion}", value)).toList();
            if (!instruction.isEmpty() && !allowedInstructions.contains(instruction)) {
                throw new IllegalArgumentException("所选 CosyVoice 音色仅支持固定情感指令，请使用情感选项或音色规定的指令格式");
            }
            if (!emotion.isEmpty()) instruction = voice.emotionTemplate().replace("{emotion}", emotion);
        } else if ("free".equals(mode)) {
            if (!emotion.isEmpty()) {
                var label = SpeechModelCatalog.emotion(emotion)
                    .orElseThrow(() -> new IllegalArgumentException("请选择有效的情感")).label();
                instruction += (instruction.isEmpty() ? "" : "\n") + "请用" + label + "的情感表达。";
            }
        } else if (!instruction.isEmpty() || !emotion.isEmpty()) {
            throw new IllegalArgumentException("所选 CosyVoice 音色不支持已配置的情感或语音指令，请清除后再合成");
        }
        if (instruction.codePoints().map(value -> Character.UnicodeScript.of(value) == Character.UnicodeScript.HAN ? 2 : 1).sum() > 100) {
            throw new IllegalArgumentException("CosyVoice 语音指令合并后不能超过 100 字符（汉字按 2 字符计算），请缩短指令");
        }
        return new Expression(content, instruction, "", language);
    }

    static void validateDoubao(VoiceService settings, List<Turn> turns) {
        if (!text(settings.getInstruction()).isEmpty() || !text(settings.getEmotion()).isEmpty()
            || !text(settings.getLanguage()).isEmpty()) {
            throw new IllegalArgumentException("豆包原生播客暂不支持独立情感、语音指令或语言设置，请清除后再合成");
        }
        turns.forEach(SpeechExpressionAdapter::doubaoText);
    }

    static String doubaoText(Turn turn) {
        if (!text(turn.getEmotion()).isEmpty() || !text(turn.getInterjection()).isEmpty()) {
            throw new IllegalArgumentException("豆包原生播客暂不支持逐轮情感或语气词，请清除后再合成");
        }
        var content = withoutQwenTags(text(turn.getText()));
        if (content.isBlank()) throw new IllegalArgumentException("播客台词不能为空");
        return content;
    }

    static String withoutQwenTags(String value) {
        return QWEN_TAG_PATTERN.matcher(value).replaceAll("");
    }

    private static String instructionMode(SpeechModel model, String voiceId) {
        var known = SpeechModelCatalog.voice(model, voiceId);
        if (known.isPresent()) return known.get().instructionMode();
        return SpeechModelCatalog.customVoice(model, voiceId) ? model.customVoiceInstructionMode() : "none";
    }

    private static String tag(String value, String prefix, String suffix) {
        return value == null || value.isEmpty() ? "" : prefix + value + suffix;
    }

    private static void requireChoice(String value, List<String> choices, String message) {
        if (!value.isEmpty() && !choices.contains(value)) throw new IllegalArgumentException(message);
    }

    private static String text(String value) { return value == null ? "" : value.strip(); }
}
