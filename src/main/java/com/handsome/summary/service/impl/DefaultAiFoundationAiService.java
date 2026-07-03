package com.handsome.summary.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.ai.AiFoundationCallLog;
import com.handsome.summary.ai.ConditionalOnHaloAiFoundation;
import com.handsome.summary.ai.model.AiCallLogRecord;
import com.handsome.summary.ai.service.AiCallLogService;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.SettingConfigGetter;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.AiModelService;
import run.halo.aifoundation.chat.GenerateTextRequest;
import run.halo.aifoundation.chat.GenerateTextResult;
import run.halo.aifoundation.message.ModelMessage;
import run.halo.aifoundation.part.PartType;
import run.halo.app.plugin.extensionpoint.ExtensionGetter;

/**
 * Halo AI Foundation text generation service.
 */
@Slf4j
@Component
@ConditionalOnHaloAiFoundation
@RequiredArgsConstructor
public class DefaultAiFoundationAiService implements AiFoundationAiService {

    private static final String AI_SERVICE_NAME = "AI Foundation";
    private static final Duration REQUEST_TIMEOUT = Duration.ofMinutes(3);

    private final ExtensionGetter extensionGetter;
    private final AiCallLogService aiCallLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<String> generateText(String prompt, SettingConfigGetter.AiConfigResult config) {
        return Mono.defer(() -> {
            var request = GenerateTextRequest.builder()
                .messages(List.of(ModelMessage.user(defaultString(prompt))))
                .build();
            return requestText("text-generate", modelName(config), request);
        }).onErrorMap(e -> {
            log.error("AI Foundation generation failed", e);
            return new IllegalStateException(AI_SERVICE_NAME + " 生成异常：" + errorMessage(e), e);
        });
    }

    @Override
    public Mono<String> chat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config) {
        return Mono.defer(() -> {
            var conversation = parseConversationHistory(conversationHistory, systemPrompt);
            var request = GenerateTextRequest.builder()
                .system(conversation.systemPrompt())
                .messages(conversation.messages())
                .build();
            return requestText("chat-generate", modelName(config), request);
        }).onErrorMap(e -> {
            log.error("AI Foundation multi-turn chat failed", e);
            return new IllegalStateException(AI_SERVICE_NAME + " 多轮对话异常：" + errorMessage(e), e);
        });
    }

    @Override
    public void streamChat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config, Consumer<String> onData, Runnable onComplete,
        Consumer<String> onError) {
        try {
            var conversation = parseConversationHistory(conversationHistory, systemPrompt);
            var request = GenerateTextRequest.builder()
                .system(conversation.systemPrompt())
                .messages(conversation.messages())
                .build();
            var modelName = config == null ? null : config.getModelName();
            var logModelName = AiFoundationCallLog.modelName(modelName);
            var stats = AiFoundationCallLog.generateRequestStats(request);
            var startedAt = Instant.now();
            var startNanos = AiFoundationCallLog.startNanos();
            var chunks = new AtomicInteger();
            var outputChars = new AtomicLong();

            aiModelService()
                .doOnSubscribe(subscription -> log.info(
                    "AI Foundation stream-chat start model={} messages={} inputChars={} "
                        + "systemChars={} promptChars={} timeoutMs={}",
                    logModelName, stats.messageCount(), stats.totalInputChars(),
                    stats.systemChars(), stats.promptChars(), REQUEST_TIMEOUT.toMillis()))
                .flatMap(service -> service.languageModel(resolveModelName(modelName)))
                .flatMapMany(model -> model.streamText(request).textStream())
                .doOnNext(delta -> {
                    chunks.incrementAndGet();
                    outputChars.addAndGet(AiFoundationCallLog.safeLength(delta));
                })
                .timeout(REQUEST_TIMEOUT)
                .doOnComplete(() -> log.info(
                    "AI Foundation stream-chat success model={} chunks={} outputChars={} "
                        + "durationMs={}",
                    logModelName, chunks.get(), outputChars.get(),
                    AiFoundationCallLog.elapsedMillis(startNanos)))
                .doOnComplete(() -> recordGenerateCall("stream-chat", logModelName, stats,
                    startedAt, AiFoundationCallLog.elapsedMillis(startNanos), chunks.get(),
                    outputChars.get(), null))
                .doOnError(error -> log.error(
                    "AI Foundation stream-chat failed model={} chunks={} outputChars={} "
                        + "durationMs={} errorType={} error={}",
                    logModelName, chunks.get(), outputChars.get(),
                    AiFoundationCallLog.elapsedMillis(startNanos),
                    AiFoundationCallLog.rootErrorType(error),
                    AiFoundationCallLog.rootErrorMessage(error), error))
                .doOnError(error -> recordGenerateCall("stream-chat", logModelName, stats,
                    startedAt, AiFoundationCallLog.elapsedMillis(startNanos), chunks.get(),
                    outputChars.get(), error))
                .subscribe(
                    onData,
                    error -> {
                        onError.accept(AI_SERVICE_NAME + " 流式对话异常：" + errorMessage(error));
                    },
                    onComplete
                );
        } catch (Exception e) {
            log.error("AI Foundation stream chat setup failed", e);
            onError.accept(AI_SERVICE_NAME + " 流式对话异常：" + errorMessage(e));
        }
    }

    private Mono<String> requestText(String operation, String modelName, GenerateTextRequest request) {
        var logModelName = AiFoundationCallLog.modelName(modelName);
        var stats = AiFoundationCallLog.generateRequestStats(request);
        var startedAt = Instant.now();
        var startNanos = AiFoundationCallLog.startNanos();
        return aiModelService()
            .doOnSubscribe(subscription -> log.info(
                "AI Foundation {} start model={} messages={} inputChars={} systemChars={} "
                    + "promptChars={} timeoutMs={}",
                operation, logModelName, stats.messageCount(), stats.totalInputChars(),
                stats.systemChars(), stats.promptChars(), REQUEST_TIMEOUT.toMillis()))
            .flatMap(service -> service.languageModel(resolveModelName(modelName)))
            .flatMap(model -> model.generateText(request))
            .map(this::extractText)
            .timeout(REQUEST_TIMEOUT)
            .doOnSuccess(text -> log.info(
                "AI Foundation {} success model={} outputChars={} durationMs={}",
                operation, logModelName, AiFoundationCallLog.safeLength(text),
                AiFoundationCallLog.elapsedMillis(startNanos)))
            .doOnSuccess(text -> recordGenerateCall(operation, logModelName, stats, startedAt,
                AiFoundationCallLog.elapsedMillis(startNanos), StringUtils.hasText(text) ? 1 : 0,
                (long) AiFoundationCallLog.safeLength(text), null))
            .doOnError(error -> log.error(
                "AI Foundation {} failed model={} durationMs={} errorType={} error={}",
                operation, logModelName, AiFoundationCallLog.elapsedMillis(startNanos),
                AiFoundationCallLog.rootErrorType(error),
                AiFoundationCallLog.rootErrorMessage(error), error))
            .doOnError(error -> recordGenerateCall(operation, logModelName, stats, startedAt,
                AiFoundationCallLog.elapsedMillis(startNanos), 0, 0L, error));
    }

    private Mono<AiModelService> aiModelService() {
        return extensionGetter.getEnabledExtension(AiModelService.class)
            .switchIfEmpty(Mono.error(new IllegalStateException("AI Foundation 插件未安装或未启用")));
    }

    private ConversationMessages parseConversationHistory(String conversationHistory,
        String systemPrompt) {
        var effectiveSystemPrompt = blankToNull(systemPrompt);
        var messages = new ArrayList<ModelMessage>();

        try {
            var rootNode = objectMapper.readTree(defaultString(conversationHistory));
            if (rootNode.isArray()) {
                for (JsonNode messageNode : rootNode) {
                    var role = messageNode.path("role").asText("");
                    var content = extractMessageContentText(messageNode.path("content"));
                    if (!StringUtils.hasText(content)) {
                        continue;
                    }

                    switch (role) {
                        case "system" -> {
                            if (!StringUtils.hasText(effectiveSystemPrompt)) {
                                effectiveSystemPrompt = content.strip();
                            }
                        }
                        case "assistant" -> messages.add(ModelMessage.assistant(content.strip()));
                        case "user" -> messages.add(ModelMessage.user(content.strip()));
                        default -> messages.add(ModelMessage.user(content.strip()));
                    }
                }
            } else {
                messages.add(ModelMessage.user(defaultString(conversationHistory)));
            }
        } catch (Exception e) {
            log.debug("Conversation history parse failed, treating as plain text: {}",
                e.getMessage());
            messages.add(ModelMessage.user(defaultString(conversationHistory)));
        }

        if (messages.isEmpty()) {
            messages.add(ModelMessage.user(defaultString(conversationHistory)));
        }
        return new ConversationMessages(effectiveSystemPrompt, messages);
    }

    private String extractMessageContentText(JsonNode contentNode) {
        if (contentNode == null || contentNode.isMissingNode() || contentNode.isNull()) {
            return "";
        }
        if (contentNode.isTextual()) {
            return contentNode.asText();
        }
        if (contentNode.isArray()) {
            var builder = new StringBuilder();
            for (JsonNode block : contentNode) {
                if ("text".equals(block.path("type").asText())) {
                    builder.append(block.path("text").asText());
                }
            }
            return builder.toString();
        }
        return contentNode.asText("");
    }

    private String extractText(GenerateTextResult result) {
        if (result == null) {
            return "";
        }
        var text = firstText(result.getText(), result.getOutputText());
        if (StringUtils.hasText(text)) {
            return text;
        }
        var content = result.getContent();
        if (content == null || content.isEmpty()) {
            return "";
        }
        return content.stream()
            .filter(part -> part != null && PartType.isText(part.getType()))
            .map(part -> part.getText())
            .filter(StringUtils::hasText)
            .collect(Collectors.joining("\n"));
    }

    private String firstText(String... values) {
        for (var value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private String resolveModelName(String modelName) {
        return blankToNull(modelName);
    }

    private String modelName(SettingConfigGetter.AiConfigResult config) {
        return config == null ? null : config.getModelName();
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.strip() : null;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String errorMessage(Throwable error) {
        return AiFoundationCallLog.rootErrorMessage(error);
    }

    private void recordGenerateCall(String operation, String modelName,
        AiFoundationCallLog.GenerateRequestStats stats, Instant startedAt, long durationMillis,
        int outputCount, long outputChars, Throwable error) {
        var failure = error != null;
        aiCallLogService.record(AiCallLogRecord.builder()
            .operation(operation)
            .modelType("language")
            .modelName(modelName)
            .success(!failure)
            .startedAt(startedAt)
            .durationMillis(durationMillis)
            .inputCount(stats.messageCount())
            .inputChars(stats.totalInputChars())
            .maxInputChars(stats.maxMessageChars())
            .outputCount(outputCount)
            .outputChars(outputChars)
            .maxOutputChars(safeLongToInt(outputChars))
            .errorType(failure ? AiFoundationCallLog.rootErrorType(error) : null)
            .errorMessage(failure ? AiFoundationCallLog.rootErrorMessage(error) : null)
            .metadata(Map.of(
                "systemChars", String.valueOf(stats.systemChars()),
                "promptChars", String.valueOf(stats.promptChars()),
                "messageChars", String.valueOf(stats.messageChars())
            ))
            .build());
    }

    private int safeLongToInt(long value) {
        return value > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) Math.max(0, value);
    }

    private record ConversationMessages(String systemPrompt, List<ModelMessage> messages) {
    }
}
