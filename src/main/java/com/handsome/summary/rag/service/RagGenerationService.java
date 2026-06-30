package com.handsome.summary.rag.service;

import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagConversationMessage;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RagGenerationService {

    Mono<RagAnswer> ask(String knowledgeBase, String question, Integer limit);

    Mono<RagAnswer> askWithHistory(String knowledgeBase, String question, Integer limit,
        List<RagConversationMessage> history);

    Flux<RagChatStreamEvent> stream(String knowledgeBase, String question, Integer limit);

    Flux<RagChatStreamEvent> streamWithHistory(String knowledgeBase, String question, Integer limit,
        List<RagConversationMessage> history);
}
