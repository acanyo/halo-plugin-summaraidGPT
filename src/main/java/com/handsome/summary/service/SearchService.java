package com.handsome.summary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import run.halo.app.content.ExcerptGenerator;
import run.halo.app.plugin.extensionpoint.ExtensionGetter;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final ExtensionGetter extensionGetter;

    public Flux<ExcerptGenerator> getSearchEngine() {
        return extensionGetter.getExtensions(ExcerptGenerator.class);
    }

}
