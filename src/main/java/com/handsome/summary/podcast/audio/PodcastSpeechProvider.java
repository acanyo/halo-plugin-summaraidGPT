package com.handsome.summary.podcast.audio;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.util.List;
import java.util.function.IntConsumer;
import reactor.core.publisher.Mono;

public interface PodcastSpeechProvider {
    boolean supports(String provider);

    Mono<Result> synthesize(String provider, VoiceService settings, List<Turn> turns,
        IntConsumer progress);

    record Result(byte[] pcm, List<Turn> turns) { }
}
