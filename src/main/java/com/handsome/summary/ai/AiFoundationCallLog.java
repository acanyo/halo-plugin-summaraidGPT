package com.handsome.summary.ai;

import java.util.Collection;
import java.util.List;
import org.springframework.util.StringUtils;
import run.halo.aifoundation.chat.GenerateTextRequest;
import run.halo.aifoundation.message.ModelMessage;
import run.halo.aifoundation.message.ModelMessagePart;
import run.halo.aifoundation.part.PartType;

/**
 * Shared logging helpers for AI Foundation calls. It intentionally records sizes and metadata
 * instead of prompt or article content.
 */
public final class AiFoundationCallLog {

    private static final String DEFAULT_MODEL = "<default>";

    private AiFoundationCallLog() {
    }

    public static long startNanos() {
        return System.nanoTime();
    }

    public static long elapsedMillis(long startNanos) {
        return Math.max(0, (System.nanoTime() - startNanos) / 1_000_000);
    }

    public static String modelName(String modelName) {
        return StringUtils.hasText(modelName) ? modelName.strip() : DEFAULT_MODEL;
    }

    public static TextStats textStats(String text) {
        var length = safeLength(text);
        return new TextStats(StringUtils.hasText(text) ? 1 : 0, length, length);
    }

    public static TextStats textStats(Collection<String> texts) {
        if (texts == null || texts.isEmpty()) {
            return new TextStats(0, 0, 0);
        }
        long totalChars = 0;
        var maxChars = 0;
        var count = 0;
        for (var text : texts) {
            if (!StringUtils.hasText(text)) {
                continue;
            }
            var length = text.length();
            totalChars += length;
            maxChars = Math.max(maxChars, length);
            count += 1;
        }
        return new TextStats(count, totalChars, maxChars);
    }

    public static GenerateRequestStats generateRequestStats(GenerateTextRequest request) {
        if (request == null) {
            return new GenerateRequestStats(0, 0, 0, 0, 0, 0);
        }
        var messageStats = messageStats(request.getMessages());
        var systemChars = safeLength(request.getSystem());
        var promptChars = safeLength(request.getPrompt());
        var totalInputChars = systemChars + promptChars + messageStats.totalChars();
        return new GenerateRequestStats(
            request.getMessages() == null ? 0 : request.getMessages().size(),
            systemChars,
            promptChars,
            messageStats.totalChars(),
            messageStats.maxChars(),
            totalInputChars
        );
    }

    public static Throwable rootCause(Throwable error) {
        var current = error;
        while (current != null && current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current == null ? error : current;
    }

    public static String rootErrorMessage(Throwable error) {
        var root = rootCause(error);
        if (root == null) {
            return "Unknown error";
        }
        return StringUtils.hasText(root.getMessage()) ? root.getMessage() : root.toString();
    }

    public static String rootErrorType(Throwable error) {
        var root = rootCause(error);
        return root == null ? "Unknown" : root.getClass().getSimpleName();
    }

    public static int safeLength(String text) {
        return text == null ? 0 : text.length();
    }

    private static TextStats messageStats(List<ModelMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return new TextStats(0, 0, 0);
        }
        long totalChars = 0;
        var maxChars = 0;
        for (var message : messages) {
            var length = messageTextLength(message);
            totalChars += length;
            maxChars = Math.max(maxChars, length);
        }
        return new TextStats(messages.size(), totalChars, maxChars);
    }

    private static int messageTextLength(ModelMessage message) {
        if (message == null || message.getContent() == null) {
            return 0;
        }
        var length = 0;
        for (ModelMessagePart part : message.getContent()) {
            if (part != null && PartType.isText(part.getType())) {
                length += safeLength(part.getText());
            }
        }
        return length;
    }

    public record TextStats(int count, long totalChars, int maxChars) {
    }

    public record GenerateRequestStats(
        int messageCount,
        int systemChars,
        int promptChars,
        long messageChars,
        int maxMessageChars,
        long totalInputChars
    ) {
    }
}
