package com.handsome.summary.rag.service;

import com.handsome.summary.rag.extension.RagConversation;
import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RagConversationService {

    Flux<RagConversation> list(String knowledgeBase, int limit);

    Mono<RagConversation> get(String name);

    Mono<RagConversation> getForVisitor(String name, String visitorId);

    Mono<Void> delete(String name);

    Mono<RagAnswer> ask(String knowledgeBase, String conversationId, String visitorId,
        String userAgent, String question, Integer limit);

    Flux<RagChatStreamEvent> stream(String knowledgeBase, String conversationId, String visitorId,
        String userAgent, String question, Integer limit);
}
