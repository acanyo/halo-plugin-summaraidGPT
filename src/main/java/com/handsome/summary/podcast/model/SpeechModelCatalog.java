package com.handsome.summary.podcast.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Shared, documented speech capabilities; the same catalog drives Console controls. */
public final class SpeechModelCatalog {
    private static final Catalog CATALOG = load();

    private SpeechModelCatalog() { }

    public record Catalog(List<SpeechModel> models, List<Emotion> emotions,
        List<Interjection> interjections, List<Language> languages, List<String> sources, Map<String, List<Voice>> voiceSets) { }
    public record SpeechModel(String id, String label, String family, List<Voice> voices,
        String instructionMode, String customVoiceInstructionMode, boolean customVoicesOnly,
        List<String> emotions, List<String> interjections, List<String> languages,
        List<String> channels, Map<String, ChannelCapabilities> channelOverrides, String voiceSet) { }
    public record ChannelCapabilities(List<String> emotions, List<String> interjections, List<String> languages) { }
    public record Voice(String id, String label, String instructionMode, String emotionTemplate,
        List<String> emotions, List<String> languages, List<String> channels) { }
    public record Emotion(String value, String label, String qwenTag, String minimaxValue) { }
    public record Interjection(String value, String label, String qwenTag, String minimaxTag) { }
    public record Language(String value, String label, String minimaxValue) { }

    public static Catalog catalog() { return CATALOG; }

    public static Optional<SpeechModel> find(String id) {
        var normalized = id != null && id.startsWith("speech-") ? "MiniMax/" + id : id;
        return CATALOG.models().stream().filter(model -> model.id().equals(normalized)).findFirst();
    }

    public static SpeechModel require(String id) {
        return find(id).orElseThrow(() -> new IllegalArgumentException("请选择支持的语音模型"));
    }

    public static Optional<SpeechModel> findForProvider(String provider, String id) {
        var channel = "minimax".equals(provider) ? "minimax" : "bailian";
        return find(id).filter(model -> model.channels().contains(channel)).map(model -> {
            var override = model.channelOverrides() == null ? null : model.channelOverrides().get(channel);
            var voices = model.voices().stream().filter(voice -> voice.channels() == null || voice.channels().contains(channel)).toList();
            return new SpeechModel(model.id(), model.label(), model.family(), voices,
                model.instructionMode(), model.customVoiceInstructionMode(), model.customVoicesOnly(),
                override == null ? model.emotions() : override.emotions(),
                override == null ? model.interjections() : override.interjections(),
                override == null ? model.languages() : override.languages(), model.channels(), model.channelOverrides(), model.voiceSet());
        });
    }

    public static SpeechModel requireForProvider(String provider, String id) {
        require(id);
        return findForProvider(provider, id)
            .orElseThrow(() -> new IllegalArgumentException("所选语音模型与当前渠道不匹配，请重新选择"));
    }

    public static Optional<Voice> voice(SpeechModel model, String id) {
        return model.voices().stream().filter(voice -> voice.id().equals(id)).findFirst();
    }

    public static boolean customVoice(SpeechModel model, String id) {
        return id != null && id.startsWith(model.id() + "-");
    }

    public static Optional<Emotion> emotion(String value) {
        return CATALOG.emotions().stream().filter(emotion -> emotion.value().equals(value)).findFirst();
    }

    public static Optional<Interjection> interjection(String value) {
        return CATALOG.interjections().stream().filter(item -> item.value().equals(value)).findFirst();
    }

    public static Optional<Language> language(String value) {
        return CATALOG.languages().stream().filter(item -> item.value().equals(value)).findFirst();
    }

    private static Catalog load() {
        try (var stream = SpeechModelCatalog.class.getResourceAsStream("/podcast/speech-models.json")) {
            if (stream == null) throw new IllegalStateException("语音模型目录缺失");
            var source = new ObjectMapper().readValue(stream, Catalog.class);
            var models = source.models().stream().map(model -> {
                if (model.voiceSet() == null) return model;
                var voices = source.voiceSets().get(model.voiceSet());
                if (voices == null) throw new IllegalStateException("语音模型引用的音色列表缺失");
                return new SpeechModel(model.id(), model.label(), model.family(), voices,
                    model.instructionMode(), model.customVoiceInstructionMode(), model.customVoicesOnly(),
                    model.emotions(), model.interjections(), model.languages(), model.channels(), model.channelOverrides(), model.voiceSet());
            }).toList();
            return new Catalog(models, source.emotions(), source.interjections(), source.languages(), source.sources(), source.voiceSets());
        } catch (Exception error) {
            throw new IllegalStateException("语音模型目录无法读取", error);
        }
    }
}
