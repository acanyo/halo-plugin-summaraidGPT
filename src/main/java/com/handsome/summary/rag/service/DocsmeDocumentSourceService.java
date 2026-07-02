package com.handsome.summary.rag.service;

import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DocsmeDocumentSourceService {

    Mono<Boolean> isAvailable();

    Flux<DocsmeDocument> listPublished(String keyword);

    Flux<DocsmeDocument> listPublishedByNames(List<String> docNames);

    record DocsmeDocument(
        String docName,
        String docTreeName,
        String title,
        String url,
        String content,
        String projectName,
        String projectDisplayName,
        String versionName,
        String versionSlug
    ) {
    }
}
