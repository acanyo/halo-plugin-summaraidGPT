package com.handsome.summary.rag.service;

import com.handsome.summary.rag.extension.RagConversation;
import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagSourceReference;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RagConversationService {

    Mono<ConversationPage> list(String knowledgeBase, String keyword, int page, int size);

    Mono<RagConversation> get(String name);

    Mono<RagConversation> getForVisitor(String name, String visitorId);

    Mono<Void> delete(String name);

    Mono<RagAnswer> ask(String knowledgeBase, String conversationId, String visitorId,
        String userAgent, String question, Integer limit);

    Flux<RagChatStreamEvent> stream(String knowledgeBase, String conversationId, String visitorId,
        String userAgent, String question, Integer limit);

    Mono<RagConversation> recordUserMessage(String knowledgeBase, String conversationId,
        String visitorId, String userAgent, String content);

    Mono<RagConversation> recordAssistantMessage(String conversationId, String content,
        List<RagSourceReference> sources, boolean error);

    record ConversationPage(List<RagConversation> items, int page, int size, int total) {
    }
}
