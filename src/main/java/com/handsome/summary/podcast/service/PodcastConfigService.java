package com.handsome.summary.podcast.service;

import com.handsome.summary.podcast.model.PodcastSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Service
@RequiredArgsConstructor
public class PodcastConfigService {
    private final ReactiveSettingFetcher settingFetcher;
    private final PodcastCredentialsService credentials;

    public Mono<PodcastSettings> get() {
        return settingFetcher.fetch(PodcastSettings.GROUP, PodcastSettings.class)
            .defaultIfEmpty(new PodcastSettings()).flatMap(credentials::resolve);
    }
}
