package com.handsome.summary.agent.service;

import com.handsome.summary.ai.AiFoundationCallLog;
import com.handsome.summary.ai.ConditionalOnHaloAiFoundation;
import com.handsome.summary.ai.model.AiCallLogRecord;
import com.handsome.summary.ai.service.AiCallLogService;
import com.handsome.summary.rag.model.RagSourceReference;
import com.handsome.summary.rag.service.RagConversationService;
import com.handsome.summary.mcp.service.McpTurnResults;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.ui.ErrorChunk;
import run.halo.aifoundation.ui.TextDeltaChunk;
import run.halo.aifoundation.ui.ToolChunk;
import run.halo.aifoundation.ui.ToolOutputAvailableChunk;
import run.halo.aifoundation.ui.ToolPart;
import run.halo.aifoundation.ui.ToolPartState;
import run.halo.aifoundation.ui.UIMessage;
import run.halo.aifoundation.ui.UIMessageChatRequest;
import run.halo.aifoundation.ui.UIMessageChunk;
import run.halo.aifoundation.ui.UIMessagePart;
import run.halo.aifoundation.ui.UIMessageRole;
import run.halo.aifoundation.ui.UIMessageTransportCodec;

@Slf4j
@Component
@ConditionalOnHaloAiFoundation
@RequiredArgsConstructor
public class AgentChatTurnRecorder {

    private final RagConversationService ragConversationService;
    private final AiCallLogService aiCallLogService;

    public AgentChatTurn start(String modelName, String knowledgeBase, String conversationId,
        String visitorId, String userAgent, UIMessageChatRequest<Void> chatRequest,
        boolean recordUserMessage, String traceId) {
        var turn = new AgentChatTurn(modelName, knowledgeBase, conversationId, visitorId,
            userAgent, latestUserText(chatRequest), inputStats(chatRequest), recordUserMessage,
            chatRequest == null || chatRequest.trigger() == null
                ? ""
                : chatRequest.trigger().value(), traceId,
            chatRequest == null ? 0 : chatRequest.messages().size());
        ingestMessageSources(turn, chatRequest);
        turn.continuation = !recordUserMessage && chatRequest != null && StringUtils.hasText(chatRequest.messageId());
        if (chatRequest != null && chatRequest.messages() != null && !recordUserMessage) {
            var messages = chatRequest.messages();
            if (!messages.isEmpty() && messages.getLast().role() == UIMessageRole.ASSISTANT) {
                turn.assistantMessageId = messages.getLast().id();
            }
        }
        return turn;
    }

    public Mono<Void> recordUserMessage(AgentChatTurn turn) {
        if (turn == null || !turn.recordUserMessage || !StringUtils.hasText(turn.question)) {
            return turn != null && StringUtils.hasText(turn.conversationId)
                ? ragConversationService.getForVisitor(turn.conversationId, turn.visitorId)
                    .doOnNext(conversation -> {
                        if (conversation.getSpec() == null || conversation.getSpec().getMessages() == null) return;
                        if (!turn.continuation) return;
                        var savedMessages = conversation.getSpec().getMessages();
                        var saved = savedMessages.stream()
                            .filter(message -> turn.assistantMessageId.equals(message.getId())
                                && "assistant".equals(message.getRole()))
                            .findFirst().orElse(savedMessages.isEmpty() ? null : savedMessages.getLast());
                        if (saved != null && "assistant".equals(saved.getRole())) {
                            turn.assistantMessageId = saved.getId();
                            turn.toolResults.restore(saved.getToolResults());
                            turn.answerText.append(saved.getContent() == null ? "" : saved.getContent());
                        }
                    }).then()
                : Mono.empty();
        }
        return ragConversationService.recordUserMessage(turn.knowledgeBase, turn.conversationId,
                turn.visitorId, turn.userAgent, turn.question)
            .doOnNext(conversation -> {
                if (conversation.getMetadata() != null) {
                    turn.conversationId = conversation.getMetadata().getName();
                }
            })
            .then();
    }

    public void observe(AgentChatTurn turn, UIMessageChunk chunk) {
        if (turn == null || chunk == null) {
            return;
        }
        var chunkMap = UIMessageTransportCodec.chunkToMap(chunk);
        if (!turn.continuation && "start".equals(chunkMap.get("type")) && chunkMap.get("messageId") instanceof String id) {
            turn.assistantMessageId = id;
        }
        turn.toolResults.observe(chunkMap);
        if (chunk instanceof TextDeltaChunk text && text.delta() != null) {
            turn.outputChunks.incrementAndGet();
            turn.outputChars.addAndGet(AiFoundationCallLog.safeLength(text.delta()));
            turn.answerText.append(text.delta());
            return;
        }
        if (chunk instanceof ToolOutputAvailableChunk tool) {
            ingestOutput(turn, tool.output());
            return;
        }
        if (chunk instanceof ToolChunk tool) {
            if (tool.state() == ToolPartState.OUTPUT_AVAILABLE) {
                ingestOutput(turn, tool.output());
            }
            if (tool.state() == ToolPartState.OUTPUT_ERROR && StringUtils.hasText(tool.errorText())) {
                turn.markError("ToolError", tool.errorText());
            }
            return;
        }
        if (chunk instanceof ErrorChunk error) {
            turn.markError("AgentStreamError", error.errorText());
        }
    }

    public Mono<Void> finish(AgentChatTurn turn) {
        return finish(turn, null);
    }

    public Mono<Void> finish(AgentChatTurn turn, Throwable error) {
        if (turn == null) return Mono.empty();
        synchronized (turn) {
            if (turn.finishWork == null) {
                // A browser may close the stream as soon as it sees finish. Keep the save alive.
                turn.finishWork = Mono.defer(() -> persistTurn(turn, error)).cache();
            }
            return turn.finishWork;
        }
    }

    private Mono<Void> persistTurn(AgentChatTurn turn, Throwable error) {
        if (error != null) {
            turn.markError(AiFoundationCallLog.rootErrorType(error),
                AiFoundationCallLog.rootErrorMessage(error));
        }
        recordAiCall(turn);

        var content = turn.answerText.toString();
        if (!StringUtils.hasText(content) && turn.failed) {
            content = StringUtils.hasText(turn.errorMessage) ? turn.errorMessage : "Agent 问答失败";
        }
        if ((!StringUtils.hasText(content) && turn.toolResults.snapshot().isEmpty())
            || !StringUtils.hasText(turn.conversationId)) {
            return Mono.empty();
        }
        return ragConversationService.recordAgentMessage(turn.conversationId, turn.assistantMessageId, content,
                new ArrayList<>(turn.sources.values()), turn.failed, turn.toolResults.snapshot())
            .then()
            .onErrorResume(saveError -> {
                log.warn("Failed to persist Agent assistant message: {}", saveError.getMessage());
                return Mono.empty();
            });
    }

    private void recordAiCall(AgentChatTurn turn) {
        aiCallLogService.record(AiCallLogRecord.builder()
            .operation("rag-agent-chat")
            .modelType("language")
            .modelName(AiFoundationCallLog.modelName(turn.modelName))
            .success(!turn.failed)
            .startedAt(turn.startedAt)
            .durationMillis(AiFoundationCallLog.elapsedMillis(turn.startNanos))
            .inputCount(turn.inputStats.count())
            .inputChars(turn.inputStats.totalChars())
            .maxInputChars(turn.inputStats.maxChars())
            .outputCount(turn.outputChunks.get())
            .outputChars(turn.outputChars.get())
            .maxOutputChars(safeLongToInt(turn.outputChars.get()))
            .sourceCount(turn.sources.size())
            .errorType(turn.failed ? turn.errorType : null)
            .errorMessage(turn.failed ? turn.errorMessage : null)
            .metadata(turn.metadata())
            .build());
    }

    private AiFoundationCallLog.TextStats inputStats(UIMessageChatRequest<Void> chatRequest) {
        if (chatRequest == null || chatRequest.messages() == null) {
            return AiFoundationCallLog.textStats(List.of());
        }
        return AiFoundationCallLog.textStats(chatRequest.messages().stream()
            .map(UIMessage::text)
            .toList());
    }

    private String latestUserText(UIMessageChatRequest<Void> chatRequest) {
        if (chatRequest == null || chatRequest.messages() == null) {
            return "";
        }
        var messages = chatRequest.messages();
        for (var i = messages.size() - 1; i >= 0; i--) {
            var message = messages.get(i);
            if (message != null && message.role() == UIMessageRole.USER
                && StringUtils.hasText(message.text())) {
                return message.text().strip();
            }
        }
        return "";
    }

    private void ingestMessageSources(AgentChatTurn turn, UIMessageChatRequest<Void> chatRequest) {
        if (chatRequest == null || chatRequest.messages() == null) {
            return;
        }
        for (var message : chatRequest.messages()) {
            if (message == null || message.parts() == null) {
                continue;
            }
            for (UIMessagePart part : message.parts()) {
                if (part instanceof ToolPart tool && tool.state() == ToolPartState.OUTPUT_AVAILABLE) {
                    ingestOutput(turn, tool.output());
                }
            }
        }
    }

    private void ingestOutput(AgentChatTurn turn, Object output) {
        if (!(output instanceof Map<?, ?> map)) {
            return;
        }
        var resources = map.get("resources");
        if (resources instanceof Iterable<?> iterable) {
            for (var resource : iterable) {
                ingestResource(turn, resource);
            }
        }
        ingestResource(turn, map.get("resource"));
        ingestOutput(turn, map.get("output"));
    }

    private void ingestResource(AgentChatTurn turn, Object resource) {
        if (!(resource instanceof Map<?, ?> map)) {
            return;
        }
        var id = firstText(stringValue(map.get("resourceId")), stringValue(map.get("id")));
        if (!StringUtils.hasText(id) || turn.sources.containsKey(id)) {
            return;
        }
        var content = firstText(stringValue(map.get("excerpt")), stringValue(map.get("content")));
        turn.sources.put(id, RagSourceReference.builder()
            .id(id)
            .sourceType(firstText(stringValue(map.get("resourceType")),
                stringValue(map.get("sourceType"))))
            .title(stringValue(map.get("title")))
            .url(firstText(stringValue(map.get("permalink")), stringValue(map.get("url"))))
            .metadata(Map.of(
                "metadataName", firstText(stringValue(map.get("metadataName")),
                    stringValue(map.get("sourceName"))),
                "content", content
            ))
            .build());
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String firstText(String... values) {
        for (var value : values) {
            if (StringUtils.hasText(value)) {
                return value.strip();
            }
        }
        return "";
    }

    private Integer safeLongToInt(long value) {
        return value > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) Math.max(0, value);
    }

    public static class AgentChatTurn {
        private final String modelName;
        private final String knowledgeBase;
        private final String visitorId;
        private final String userAgent;
        private final String question;
        private final AiFoundationCallLog.TextStats inputStats;
        private final boolean recordUserMessage;
        private final String trigger;
        private final String traceId;
        private final int uiMessageCount;
        private final Instant startedAt = Instant.now();
        private final long startNanos = AiFoundationCallLog.startNanos();
        private final AtomicInteger outputChunks = new AtomicInteger();
        private final AtomicLong outputChars = new AtomicLong();
        private final StringBuilder answerText = new StringBuilder();
        private final McpTurnResults toolResults = new McpTurnResults();
        private String assistantMessageId = "agent-message-" + java.util.UUID.randomUUID();
        private final Map<String, RagSourceReference> sources = new LinkedHashMap<>();
        private Mono<Void> finishWork;
        private boolean continuation;
        private String conversationId;
        private boolean failed;
        private String errorType;
        private String errorMessage;

        AgentChatTurn(String modelName, String knowledgeBase, String conversationId,
            String visitorId, String userAgent, String question,
            AiFoundationCallLog.TextStats inputStats, boolean recordUserMessage,
            String trigger, String traceId, int uiMessageCount) {
            this.modelName = modelName;
            this.knowledgeBase = knowledgeBase;
            this.conversationId = conversationId;
            this.visitorId = visitorId;
            this.userAgent = userAgent;
            this.question = question;
            this.inputStats = inputStats;
            this.recordUserMessage = recordUserMessage;
            this.trigger = trigger;
            this.traceId = traceId;
            this.uiMessageCount = uiMessageCount;
        }

        void markError(String type, String message) {
            failed = true;
            errorType = StringUtils.hasText(type) ? type : "AgentError";
            errorMessage = StringUtils.hasText(message) ? message : "Agent 问答失败";
        }

        Map<String, String> metadata() {
            var metadata = new LinkedHashMap<String, String>();
            put(metadata, "traceId", traceId);
            put(metadata, "conversationId", conversationId);
            put(metadata, "trigger", trigger);
            put(metadata, "uiMessageCount", String.valueOf(uiMessageCount));
            put(metadata, "questionChars", String.valueOf(AiFoundationCallLog.safeLength(question)));
            return Map.copyOf(metadata);
        }

        private void put(Map<String, String> metadata, String key, String value) {
            if (StringUtils.hasText(value)) {
                metadata.put(key, value);
            }
        }
    }
}
