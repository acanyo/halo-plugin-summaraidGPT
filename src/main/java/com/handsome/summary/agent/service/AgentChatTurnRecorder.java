package com.handsome.summary.agent.service;

import com.handsome.summary.ai.AiFoundationCallLog;
import com.handsome.summary.ai.model.AiCallLogRecord;
import com.handsome.summary.ai.service.AiCallLogService;
import com.handsome.summary.rag.model.RagSourceReference;
import com.handsome.summary.rag.service.RagConversationService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class AgentChatTurnRecorder {

    private final RagConversationService ragConversationService;
    private final AiCallLogService aiCallLogService;

    public AgentChatTurn start(String modelName, String knowledgeBase, String conversationId,
        String visitorId, String userAgent, UIMessageChatRequest<Void> chatRequest,
        boolean recordUserMessage) {
        var turn = new AgentChatTurn(modelName, knowledgeBase, conversationId, visitorId,
            userAgent, latestUserText(chatRequest), inputStats(chatRequest), recordUserMessage,
            chatRequest == null || chatRequest.trigger() == null
                ? ""
                : chatRequest.trigger().value(),
            chatRequest == null ? 0 : chatRequest.messages().size());
        ingestMessageSources(turn, chatRequest);
        return turn;
    }

    public Mono<Void> recordUserMessage(AgentChatTurn turn) {
        if (turn == null || !turn.recordUserMessage || !StringUtils.hasText(turn.question)) {
            return Mono.empty();
        }
        return ragConversationService.recordUserMessage(turn.knowledgeBase, turn.conversationId,
                turn.visitorId, turn.userAgent, turn.question)
            .doOnNext(conversation -> {
                if (conversation.getMetadata() != null) {
                    turn.conversationId = conversation.getMetadata().getName();
                }
            })
            .then()
            .onErrorResume(error -> {
                log.warn("Failed to persist Agent user message: {}", error.getMessage());
                return Mono.empty();
            });
    }

    public void observe(AgentChatTurn turn, UIMessageChunk chunk) {
        if (turn == null || chunk == null) {
            return;
        }
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
        if (turn == null || !turn.finished.compareAndSet(false, true)) {
            return Mono.empty();
        }
        if (error != null) {
            turn.markError(AiFoundationCallLog.rootErrorType(error),
                AiFoundationCallLog.rootErrorMessage(error));
        }
        recordAiCall(turn);

        var content = turn.answerText.toString();
        if (!StringUtils.hasText(content) && turn.failed) {
            content = StringUtils.hasText(turn.errorMessage) ? turn.errorMessage : "Agent 问答失败";
        }
        if (!StringUtils.hasText(content) || !StringUtils.hasText(turn.conversationId)) {
            return Mono.empty();
        }
        return ragConversationService.recordAssistantMessage(turn.conversationId, content,
                new ArrayList<>(turn.sources.values()), turn.failed)
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
        private final int uiMessageCount;
        private final Instant startedAt = Instant.now();
        private final long startNanos = AiFoundationCallLog.startNanos();
        private final AtomicInteger outputChunks = new AtomicInteger();
        private final AtomicLong outputChars = new AtomicLong();
        private final StringBuilder answerText = new StringBuilder();
        private final Map<String, RagSourceReference> sources = new LinkedHashMap<>();
        private final AtomicBoolean finished = new AtomicBoolean(false);
        private String conversationId;
        private boolean failed;
        private String errorType;
        private String errorMessage;

        AgentChatTurn(String modelName, String knowledgeBase, String conversationId,
            String visitorId, String userAgent, String question,
            AiFoundationCallLog.TextStats inputStats, boolean recordUserMessage,
            String trigger, int uiMessageCount) {
            this.modelName = modelName;
            this.knowledgeBase = knowledgeBase;
            this.conversationId = conversationId;
            this.visitorId = visitorId;
            this.userAgent = userAgent;
            this.question = question;
            this.inputStats = inputStats;
            this.recordUserMessage = recordUserMessage;
            this.trigger = trigger;
            this.uiMessageCount = uiMessageCount;
        }

        void markError(String type, String message) {
            failed = true;
            errorType = StringUtils.hasText(type) ? type : "AgentError";
            errorMessage = StringUtils.hasText(message) ? message : "Agent 问答失败";
        }

        Map<String, String> metadata() {
            var metadata = new LinkedHashMap<String, String>();
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
