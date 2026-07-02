package com.handsome.summary.rag.service;

import java.util.List;
import reactor.core.publisher.Mono;

public interface RagDocumentImportService {

    Mono<ImportResult> importPublishedPosts(String knowledgeBase, List<String> postNames);

    Mono<ImportResult> importPublishedDocsmeDocuments(String knowledgeBase, List<String> docNames);

    record ImportResult(int imported, List<String> documentNames) {
    }
}
