package com.handsome.summary.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import reactor.core.publisher.Mono;

public interface ChatLanguageService {
    Mono<ChatResponse> model(String content);

}
