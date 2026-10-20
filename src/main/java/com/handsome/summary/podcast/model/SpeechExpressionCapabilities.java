package com.handsome.summary.podcast.model;

import java.util.List;

/** Expression choices shared by script generation and the per-turn Console editor. */
public final class SpeechExpressionCapabilities {
    private SpeechExpressionCapabilities() { }

    public record Controls(String model, List<String> emotions, List<String> interjections, boolean automatic) { }

    public static Controls from(PodcastSettings settings) {
        if (!List.of("bailian", "bailian-cosyvoice", "bailian-minimax", "minimax").contains(settings.getProvider() == null ? "" : settings.getProvider())) {
            return new Controls("podcast", List.of(), List.of(), false);
        }
        var voice = settings.voiceService();
        if (voice == null) return new Controls("", List.of(), List.of(), false);
        var model = SpeechModelCatalog.findForProvider(settings.getProvider(), voice.getModel()).orElse(null);
        if (model == null) return new Controls(voice.getModel(), List.of(), List.of(), false);
        var emotions = model.emotions();
        if ("cosyvoice".equals(model.family())) {
            emotions = emotions.stream().filter(value -> supportsEmotion(model, voice.getVoiceA(), value)
                && supportsEmotion(model, voice.getVoiceB(), value)).toList();
        }
        return new Controls(model.id(), emotions, model.interjections(), Boolean.TRUE.equals(voice.getAutoEmotion()));
    }

    private static boolean supportsEmotion(SpeechModelCatalog.SpeechModel model, String voice, String emotion) {
        var known = SpeechModelCatalog.voice(model, voice);
        if (known.isPresent()) return known.get().emotions().contains(emotion);
        return SpeechModelCatalog.customVoice(model, voice) && "free".equals(model.customVoiceInstructionMode());
    }
}
