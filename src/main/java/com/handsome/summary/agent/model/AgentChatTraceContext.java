package com.handsome.summary.agent.model;

import com.handsome.summary.ai.AiFoundationCallLog;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.util.StringUtils;
import run.halo.aifoundation.ui.UIMessage;
import run.halo.aifoundation.ui.UIMessageChatRequest;
import run.halo.aifoundation.ui.UIMessageRole;

/**
 * Per-turn log context for Agent chat. It keeps enough IDs and sizes to connect request, model,
 * stream, fallback, and SSE logs without writing prompt content into application logs.
 */
public record AgentChatTraceContext(
    String traceId,
    String route,
    String chatRequestId,
    String conversationId,
    String visitorHash,
    String knowledgeBase,
    String trigger,
    String messageId,
    int uiMessageCount,
    AiFoundationCallLog.TextStats inputStats,
    int latestUserChars,
    boolean recordUserMessage
) {

    private static final String DEFAULT_ROUTE = "agent-chat";

    public AgentChatTraceContext {
        traceId = StringUtils.hasText(traceId) ? traceId : UUID.randomUUID().toString();
        route = StringUtils.hasText(route) ? route : DEFAULT_ROUTE;
        chatRequestId = safeText(chatRequestId);
        conversationId = safeText(conversationId);
        visitorHash = safeText(visitorHash);
        knowledgeBase = safeText(knowledgeBase);
        trigger = safeText(trigger);
        messageId = safeText(messageId);
        inputStats = inputStats == null ? AiFoundationCallLog.textStats(List.of()) : inputStats;
        uiMessageCount = Math.max(0, uiMessageCount);
        latestUserChars = Math.max(0, latestUserChars);
    }

    public static AgentChatTraceContext from(String route, String conversationId,
        String visitorId, String knowledgeBase, UIMessageChatRequest<?> chatRequest,
        boolean recordUserMessage) {
        var messages = chatRequest == null ? List.<UIMessage<?>>of() : chatRequest.messages();
        var trigger = chatRequest == null || chatRequest.trigger() == null
            ? ""
            : chatRequest.trigger().value();
        return new AgentChatTraceContext(
            UUID.randomUUID().toString(),
            route,
            chatRequest == null ? "" : chatRequest.id(),
            conversationId,
            hash(visitorId),
            knowledgeBase,
            trigger,
            chatRequest == null ? "" : chatRequest.messageId(),
            messages.size(),
            inputStats(messages),
            latestUserChars(messages),
            recordUserMessage
        );
    }

    public static AgentChatTraceContext fallback(String route) {
        return new AgentChatTraceContext(UUID.randomUUID().toString(), route, "", "", "",
            "", "", "", 0, AiFoundationCallLog.textStats(List.of()), 0, false);
    }

    public String summary() {
        return "traceId=" + traceId
            + " route=" + route
            + " chatRequestId=" + blankAsDash(chatRequestId)
            + " trigger=" + blankAsDash(trigger)
            + " conversationId=" + blankAsDash(conversationId)
            + " knowledgeBase=" + blankAsDash(knowledgeBase)
            + " visitorHash=" + blankAsDash(visitorHash)
            + " messageId=" + blankAsDash(messageId)
            + " uiMessages=" + uiMessageCount
            + " inputCount=" + inputStats.count()
            + " inputChars=" + inputStats.totalChars()
            + " maxInputChars=" + inputStats.maxChars()
            + " latestUserChars=" + latestUserChars
            + " recordUserMessage=" + recordUserMessage;
    }

    private static AiFoundationCallLog.TextStats inputStats(List<? extends UIMessage<?>> messages) {
        if (messages == null || messages.isEmpty()) {
            return AiFoundationCallLog.textStats(List.of());
        }
        return AiFoundationCallLog.textStats(messages.stream()
            .map(message -> message == null ? "" : message.text())
            .toList());
    }

    private static int latestUserChars(List<? extends UIMessage<?>> messages) {
        if (messages == null || messages.isEmpty()) {
            return 0;
        }
        for (var i = messages.size() - 1; i >= 0; i--) {
            var message = messages.get(i);
            if (message != null && message.role() == UIMessageRole.USER
                && StringUtils.hasText(message.text())) {
                return AiFoundationCallLog.safeLength(message.text().strip());
            }
        }
        return 0;
    }

    private static String hash(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        try {
            var digest = MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest, 0, 6);
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(value.hashCode());
        }
    }

    private static String safeText(String value) {
        return StringUtils.hasText(value) ? value.strip() : "";
    }

    private static String blankAsDash(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }
}
