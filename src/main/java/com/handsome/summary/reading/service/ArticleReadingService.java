package com.handsome.summary.reading.service;

import com.handsome.summary.reading.extension.ArticleReading;
import com.handsome.summary.reading.extension.ArticleReadingInteraction;
import com.handsome.summary.reading.model.ArticleReadingInteractionCommand;
import reactor.core.publisher.Mono;

public interface ArticleReadingService {

    Mono<ArticleReading> getExisting(String postName);

    Mono<ArticleReading> getOrGenerate(String postName, boolean refresh);

    Mono<ArticleReading> ensureGenerated(String postName);

    Mono<ArticleReadingInteraction> recordInteraction(ArticleReadingInteractionCommand command);
}
