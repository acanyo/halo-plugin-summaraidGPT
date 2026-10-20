package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.JsonNode;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.IntConsumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/** The three TTS transports share turn assembly, but keep their wire contracts explicit. */
@Component
@RequiredArgsConstructor
public class TurnSpeechProvider implements PodcastSpeechProvider {
    private final SpeechTransport transport;

    @Override
    public boolean supports(String provider) {
        return provider != null && List.of("bailian", "bailian-cosyvoice", "bailian-minimax", "minimax").contains(provider);
    }

    /** Checks the complete request set before starting a background job or making paid calls. */
    public static void validate(String provider, VoiceService settings, List<Turn> turns) {
        if ("doubao".equals(provider)) {
            DoubaoPodcastProvider.validate(settings, turns);
            return;
        }
        var toValidate = turns.isEmpty() ? List.of(new Turn("A", "配置校验"), new Turn("B", "配置校验")) : turns;
        toValidate.forEach(turn -> SpeechRequestFactory.create(provider, settings, turn));
    }

    @Override
    public Mono<Result> synthesize(String provider, VoiceService settings, List<Turn> turns, IntConsumer progress) {
        return Mono.defer(() -> {
            var requests = turns.stream().map(turn -> SpeechRequestFactory.create(provider, settings, turn)).toList();
            var output = new ByteArrayOutputStream();
            var timed = new ArrayList<Turn>();
            return Flux.range(0, turns.size()).concatMap(index -> execute(requests.get(index), settings)
                .doOnNext(pcm -> {
                    var turn = turns.get(index);
                    PcmAudio.validate(pcm);
                    if (output.size() + pcm.length + 8640 > PcmAudio.MAX_BYTES) throw new IllegalStateException("播客超过 8 分钟上限");
                    if (!timed.isEmpty()) output.writeBytes(new byte[8640]); // 180 ms between turns
                    var copy = new Turn(turn.getSpeaker(), turn.getText());
                    copy.setEmotion(turn.getEmotion());
                    copy.setInterjection(turn.getInterjection());
                    copy.setStartMs(PcmAudio.durationMs(output.size()));
                    output.writeBytes(pcm);
                    copy.setEndMs(PcmAudio.durationMs(output.size()));
                    timed.add(copy);
                    progress.accept(timed.size());
                }))
                .then(Mono.fromSupplier(() -> new Result(output.toByteArray(), timed)));
        });
    }

    Mono<byte[]> synthesizeTurn(String provider, VoiceService settings, Turn turn) {
        return Mono.defer(() -> execute(SpeechRequestFactory.create(provider, settings, turn), settings));
    }

    private Mono<byte[]> execute(SpeechRequestFactory.Request request, VoiceService settings) {
        var headers = Map.of("Authorization", "Bearer " + settings.getApiKey().strip());
        if (!request.minimax()) {
            return transport.post(request.endpoint(), headers, request.body())
                .flatMap(json -> {
                    var url = json.path("output").path("audio").path("url").asText();
                    if (url.isBlank()) return Mono.error(new IllegalStateException("百炼语音服务未返回音频下载地址"));
                    return transport.download(URI.create(url));
                });
        }
        return transport.post(request.endpoint(), headers, request.body())
            .map(json -> decodeMinimax(request.bailian() ? json.path("output") : json));
    }

    static byte[] decodeMinimax(JsonNode result) {
        return MinimaxSpeechResponse.decode(result);
    }

    static URI endpoint(String provider, VoiceService settings) {
        return SpeechRequestFactory.endpoint(provider, settings);
    }
}
