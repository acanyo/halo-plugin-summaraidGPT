package com.handsome.summary.rag.service;

import com.handsome.summary.rag.extension.RagIndexTask;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RagIndexTaskService {

    Mono<RagIndexTask> startFullRebuild(String knowledgeBase);

    Mono<RagIndexTask> forceFullRebuild(String knowledgeBase);

    Mono<RagIndexTask> forceStop(String knowledgeBase);

    Mono<RagIndexTask> startDocumentRebuild(String knowledgeBase, List<String> documentNames);

    Mono<RagIndexTask> get(String name);

    Mono<RagIndexTask> latest(String knowledgeBase);

    Flux<RagIndexTask> list(String knowledgeBase, int limit);
}
