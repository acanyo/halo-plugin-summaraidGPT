package com.handsome.summary.rag.service;

import java.util.List;
import reactor.core.publisher.Mono;

public interface RagDocumentImportService {

    Mono<Integer> importPublishedPosts(String knowledgeBase, List<String> postNames);

    Mono<Integer> importPublishedDocsmeDocuments(String knowledgeBase, List<String> docNames);
}
