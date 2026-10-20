package com.handsome.summary.podcast.service;

import com.handsome.summary.podcast.audio.PcmAudio;
import com.handsome.summary.podcast.model.PodcastSettings;
import java.net.URI;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.service.AttachmentService;

@Service
@RequiredArgsConstructor
public class PodcastAudioStorage {
    private final AttachmentService attachments;

    public record StoredAudio(String attachmentName, String url) { }

    public Mono<StoredAudio> save(byte[] pcm, PodcastSettings config) {
        var wav = PcmAudio.wav(pcm);
        Flux<DataBuffer> content = Flux.defer(() -> Flux.just(DefaultDataBufferFactory.sharedInstance.wrap(wav)));
        return attachments.upload(config.getPolicyName(), config.getGroupName() == null ? "" : config.getGroupName(),
                "podcast-" + UUID.randomUUID() + ".wav", content, MediaType.parseMediaType("audio/wav"))
            .flatMap(attachment -> {
                var name = attachment.getMetadata().getName();
                var status = attachment.getStatus();
                if (status != null && status.getPermalink() != null && !status.getPermalink().isBlank()) {
                    return Mono.just(new StoredAudio(name, status.getPermalink()));
                }
                return attachments.getPermalink(attachment).map(URI::toString)
                    .map(url -> new StoredAudio(name, url))
                    .switchIfEmpty(Mono.error(new IllegalStateException("附件库未返回音频访问地址")));
            });
    }
}
