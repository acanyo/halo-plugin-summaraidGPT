package com.handsome.summary.service;

import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;

public interface InitSummaryService {
    Mono<Void> initSummary();
    Mono<Post> initSummary(Post post,String postName);
}
