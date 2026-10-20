package com.handsome.summary.podcast.service;

import com.handsome.summary.podcast.extension.ArticlePodcast;
import com.handsome.summary.reading.support.ArticleReadingHash;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Service
@RequiredArgsConstructor
public class PodcastRepository {
    private final ReactiveExtensionClient client;

    public Mono<ArticlePodcast> find(String postName) {
        return client.fetch(ArticlePodcast.class, name(postName));
    }

    public Mono<ArticlePodcast> update(String postName, Consumer<ArticlePodcast> change) {
        return find(postName).flatMap(episode -> {
            change.accept(episode);
            return client.update(episode);
        }).switchIfEmpty(Mono.defer(() -> {
            var episode = new ArticlePodcast();
            var metadata = new Metadata();
            metadata.setName(name(postName));
            episode.setMetadata(metadata);
            episode.getSpec().setPostName(postName);
            change.accept(episode);
            return client.create(episode);
        }));
    }

    public Mono<Void> delete(String postName) {
        return find(postName).flatMap(client::delete).then();
    }

    private String name(String postName) {
        return "podcast-" + ArticleReadingHash.sha256(postName).substring(0, 24);
    }
}
