package com.handsome.summary.podcast.audio;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.function.IntConsumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class DoubaoPodcastProvider implements PodcastSpeechProvider {
    private final SpeechTransport transport;

    @Override
    public boolean supports(String provider) { return "doubao".equals(provider); }

    public static void validate(VoiceService settings, List<Turn> turns) {
        DoubaoPodcastRequest.validate(settings, turns);
    }

    @Override
    public Mono<Result> synthesize(String provider, VoiceService settings, List<Turn> turns, IntConsumer progress) {
        return Mono.defer(() -> {
            validate(settings, turns);
            if (turns.isEmpty()) throw new IllegalArgumentException("播客台词不能为空");
            var stream = new DoubaoPodcastStream(settings, turns, progress);
            var headers = Map.of("x-api-key", settings.getApiKey().strip(), "x-api-resource-id", "volc.service_type.10050");
            return transport.events(URI.create("https://openspeech.bytedance.com/api/v3/podcast/sse"), headers,
                    DoubaoPodcastRequest.body(settings, turns))
                .doOnNext(stream::accept).takeUntil(event -> "152".equals(event.event()))
                .then(Mono.fromSupplier(stream::result));
        });
    }
}
