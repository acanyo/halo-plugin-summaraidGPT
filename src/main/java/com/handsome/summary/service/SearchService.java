package com.handsome.summary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import run.halo.app.content.ExcerptGenerator;
import run.halo.app.plugin.extensionpoint.ExtensionGetter;
import run.halo.app.search.SearchEngine;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final ExtensionGetter extensionGetter;

    public Mono<ExcerptGenerator> getSearchEngine() {
        return extensionGetter.getEnabledExtension(ExcerptGenerator.class);
    }

}
