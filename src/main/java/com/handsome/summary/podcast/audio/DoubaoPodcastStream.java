package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.JsonNode;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.IntConsumer;

/** Collects complete native podcast rounds while keeping subtitle timing tied to PCM bytes. */
final class DoubaoPodcastStream {
    private final VoiceService settings;
    private final List<Turn> source;
    private final IntConsumer progress;
    private final ByteArrayOutputStream audio = new ByteArrayOutputStream();
    private final ArrayList<Turn> timed = new ArrayList<>();
    private final Set<Long> roundIds = new HashSet<>();
    private Turn active;
    private int roundStartBytes;
    private boolean finished;

    DoubaoPodcastStream(VoiceService settings, List<Turn> source, IntConsumer progress) {
        this.settings = settings;
        this.source = source;
        this.progress = progress;
    }

    void accept(SpeechTransport.Event event) {
        var json = event.data();
        if (json == null || !json.isObject()) {
            throw new IllegalStateException("豆包返回了无效的播客事件");
        }
        var code = json.path("code");
        if (!code.isMissingNode() && (!code.isIntegralNumber() || !code.canConvertToLong())) {
            throw new IllegalStateException("豆包返回了无效的业务响应码");
        }
        if (!code.isMissingNode() && code.asLong() != 0 && code.asLong() != 20000000L
            || "151".equals(event.event()) || "153".equals(event.event())
            || json.path("is_error").asBoolean() || json.path("payload").path("is_error").asBoolean()) {
            throw new IllegalStateException("豆包播客合成失败，请检查音色、权限和余额");
        }
        switch (event.event()) {
            case "360" -> start(json.path("payload"));
            case "361" -> append(json.path("data"));
            case "362" -> end();
            case "152" -> {
                if (code.isMissingNode() || code.asLong() != 20000000L) {
                    throw new IllegalStateException("豆包会话未确认生成成功，请重试");
                }
                finish();
            }
            case "363" -> { } // Optional podcast metadata; only SessionFinished confirms success.
            default -> { } // Session metadata and usage events do not contain audio.
        }
    }

    private void start(JsonNode payload) {
        if (finished || active != null || timed.size() >= source.size()) throw incomplete();
        if (!payload.path("text").isTextual() || payload.path("text").asText().isBlank()) {
            throw new IllegalStateException("豆包返回了空台词轮次，无法生成对应的对话时间轴");
        }
        var original = source.get(timed.size());
        var speaker = payload.path("speaker").asText("");
        if (!speaker.isEmpty() && !speaker.equals(DoubaoPodcastRequest.voice(settings, original))) {
            throw new IllegalStateException("豆包返回的主持人音色与稿件不一致");
        }
        var roundId = payload.path("round_id");
        if (!roundId.isMissingNode() && (!roundId.canConvertToLong() || !roundIds.add(roundId.asLong()))) {
            throw new IllegalStateException("豆包返回了重复或无效的对话轮次");
        }
        active = new Turn(original.getSpeaker(), original.getText());
        active.setEmotion(original.getEmotion());
        active.setInterjection(original.getInterjection());
        active.setStartMs(PcmAudio.durationMs(audio.size()));
        roundStartBytes = audio.size();
    }

    private void append(JsonNode data) {
        if (finished || active == null) throw incomplete();
        if (!data.isTextual() || data.asText().isEmpty()) throw new IllegalStateException("豆包返回了空音频分片");
        if (data.asText().length() > PcmAudio.MAX_BYTES * 2) throw new IllegalStateException("豆包音频分片过大");
        byte[] chunk;
        try { chunk = Base64.getDecoder().decode(data.asText()); }
        catch (IllegalArgumentException error) { throw new IllegalStateException("豆包音频分片编码无效"); }
        if (audio.size() + chunk.length > PcmAudio.MAX_BYTES) throw new IllegalStateException("播客超过 8 分钟上限");
        audio.writeBytes(chunk);
    }

    private void end() {
        if (finished || active == null || audio.size() <= roundStartBytes) throw incomplete();
        active.setEndMs(PcmAudio.durationMs(audio.size()));
        timed.add(active);
        active = null;
        progress.accept(timed.size());
    }

    private void finish() {
        if (finished || active != null || timed.size() != source.size()) throw incomplete();
        finished = true;
    }

    PodcastSpeechProvider.Result result() {
        if (!finished) throw new IllegalStateException("豆包音频生成中断，请重试");
        var pcm = audio.toByteArray();
        PcmAudio.validate(pcm);
        return new PodcastSpeechProvider.Result(pcm, timed);
    }

    private static IllegalStateException incomplete() {
        return new IllegalStateException("豆包返回的对话时间轴不完整，请重试");
    }
}
