package com.handsome.summary.service;

import dev.langchain4j.model.chat.response.ChatResponse;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;

public interface ChatLanguageService {
    Mono<Void> model(String content, Post post);

}
