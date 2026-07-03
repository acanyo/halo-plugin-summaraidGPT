package com.handsome.summary.agent.service;

import com.handsome.summary.agent.model.AgentChatTraceContext;
import com.handsome.summary.agent.model.AgentToolSet;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.ui.UIMessageChatRequest;
import run.halo.aifoundation.ui.UIMessageStreamResponse;

public interface AiAgentChatService {

    Mono<UIMessageStreamResponse> streamChatCompletion(String modelName, String systemMessage,
        UIMessageChatRequest<Void> chatRequest, AgentToolSet agentToolSet);

    default Mono<UIMessageStreamResponse> streamChatCompletion(String modelName,
        String systemMessage, UIMessageChatRequest<Void> chatRequest, AgentToolSet agentToolSet,
        AgentChatTraceContext traceContext) {
        return streamChatCompletion(modelName, systemMessage, chatRequest, agentToolSet);
    }

    UIMessageStreamResponse errorResponse(String message);
}
