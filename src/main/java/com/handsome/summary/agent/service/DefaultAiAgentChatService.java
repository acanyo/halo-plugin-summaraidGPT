package com.handsome.summary.agent.service;

import com.handsome.summary.agent.model.AgentChatTraceContext;
import com.handsome.summary.agent.model.AgentToolSet;
import com.handsome.summary.ai.AiFoundationCallLog;
import com.handsome.summary.ai.ConditionalOnHaloAiFoundation;
import com.handsome.summary.ai.HaloAiFoundationAvailability;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.agent.service.AgentToolProtocolTextParser.ParsedToolCall;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.AiModelService;
import run.halo.aifoundation.chat.GenerateTextRequest;
import run.halo.aifoundation.chat.LanguageModel;
import run.halo.aifoundation.chat.StopCondition;
import run.halo.aifoundation.exception.ModelDisabledException;
import run.halo.aifoundation.exception.ModelNotFoundException;
import run.halo.aifoundation.exception.ProviderApiException;
import run.halo.aifoundation.exception.ProviderDisabledException;
import run.halo.aifoundation.tool.ToolChoice;
import run.halo.aifoundation.tool.ToolDefinition;
import run.halo.aifoundation.tool.ToolExecutionContext;
import run.halo.aifoundation.ui.ErrorChunk;
import run.halo.aifoundation.ui.InvalidUIMessageException;
import run.halo.aifoundation.ui.TextDeltaChunk;
import run.halo.aifoundation.ui.UIMessageChatHandlers;
import run.halo.aifoundation.ui.UIMessageChatRequest;
import run.halo.aifoundation.ui.UIMessageChunk;
import run.halo.aifoundation.ui.UIMessageChunks;
import run.halo.aifoundation.ui.UIMessageStream;
import run.halo.aifoundation.ui.UIMessageStreamResponse;
import run.halo.aifoundation.ui.UIMessageStreams;
import run.halo.aifoundation.ui.UIMessageTransportCodec;
import run.halo.app.plugin.extensionpoint.ExtensionGetter;

@Slf4j
@Component
@ConditionalOnHaloAiFoundation
@RequiredArgsConstructor
public class DefaultAiAgentChatService implements AiAgentChatService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ExtensionGetter extensionGetter;
    private final HaloAiFoundationAvailability haloAiFoundationAvailability;
    private final AgentToolProtocolTextParser toolProtocolTextParser;

    @Override
    public Mono<UIMessageStreamResponse> streamChatCompletion(String modelName,
        String systemMessage, UIMessageChatRequest<Void> chatRequest, AgentToolSet agentToolSet) {
        return streamChatCompletion(modelName, systemMessage, chatRequest, agentToolSet,
            AgentChatTraceContext.from("agent-chat", null, null, null, chatRequest, false));
    }

    @Override
    public Mono<UIMessageStreamResponse> streamChatCompletion(String modelName,
        String systemMessage, UIMessageChatRequest<Void> chatRequest, AgentToolSet agentToolSet,
        AgentChatTraceContext traceContext) {
        var trace = traceContext == null
            ? AgentChatTraceContext.from("agent-chat", null, null, null, chatRequest, false)
            : traceContext;
        log.info("Agent chat pipeline entered: {} model={} systemChars={} tools={} toolNames={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName),
            AiFoundationCallLog.safeLength(systemMessage), toolCount(agentToolSet),
            toolNames(agentToolSet));
        return haloAiFoundationAvailability.isEnabled()
            .flatMap(enabled -> {
                if (!enabled) {
                    log.warn("Agent chat rejected because Halo AI Foundation is disabled: {} "
                            + "model={}",
                        trace.summary(), AiFoundationCallLog.modelName(modelName));
                    return Mono.just(errorResponse("Halo AI Foundation 插件未安装或未启用，请联系站长"));
                }
                if (!StringUtils.hasText(modelName)) {
                    log.warn("Agent chat rejected because modelName is blank: {}", trace.summary());
                    return Mono.just(errorResponse("请先在插件设置中配置 Halo AI 模型"));
                }

                log.info("AI Foundation agent-chat resolving model: {} model={}",
                    trace.summary(), AiFoundationCallLog.modelName(modelName));
                return aiModelService()
                    .flatMap(service -> service.languageModel(modelName))
                    .doOnSuccess(model -> log.info("AI Foundation agent-chat model resolved: {} "
                            + "model={} modelClass={}",
                        trace.summary(), AiFoundationCallLog.modelName(modelName),
                        modelClass(model)))
                    .map(model -> withToolProtocolFallback(model, modelName, systemMessage,
                        chatRequest, agentToolSet, trace, chatResponse(model, modelName,
                            systemMessage, chatRequest, agentToolSet, trace, "primary-tools")));
            })
            .onErrorResume(throwable -> {
                logChatError(modelName, throwable, agentToolSet, trace, "pipeline");
                return Mono.just(errorResponse(resolveErrorMessage(throwable)));
            });
    }

    @Override
    public UIMessageStreamResponse errorResponse(String message) {
        var stream = UIMessageStreams.create(writer -> writer.write(UIMessageChunks.error(
            resolveErrorMessageText(message))));
        return new UIMessageStreamResponse(stream);
    }

    private Mono<AiModelService> aiModelService() {
        return extensionGetter.getEnabledExtension(AiModelService.class);
    }

    private void logPreparedRequest(String modelName, LanguageModel model,
        AgentChatTraceContext trace, String phase, GenerateTextRequest request) {
        log.info("Agent model request prepared: {} phase={} model={} modelClass={} "
                + "messages={} messageChars={} systemChars={} tools={} toolChoice={} "
                + "stopWhen={} toolSchemas={}",
            trace.summary(), phase, AiFoundationCallLog.modelName(modelName), modelClass(model),
            request.getMessages() == null ? 0 : request.getMessages().size(),
            request.getMessages() == null ? 0 : AiFoundationCallLog.safeLength(
                request.getMessages().toString()),
            AiFoundationCallLog.safeLength(request.getSystem()),
            request.getTools() == null ? 0 : request.getTools().size(),
            request.getToolChoice(),
            request.getStopWhen() == null ? "none" : request.getStopWhen().getClass().getName(),
            toolSchemaSummaries(request.getTools()));
    }

    private void logStreamChunk(String modelName, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, String phase, int index, UIMessageChunk chunk) {
        var toolLike = containsToolLikePart(chunk);
        var protocolError = isToolCallIdProtocolError(chunk);
        var errorChunk = chunk instanceof ErrorChunk;
        if (!toolLike && !protocolError && !errorChunk && index > 3) {
            return;
        }
        var level = (protocolError || errorChunk) ? "warn" : "info";
        var message = "Agent stream chunk observed: {} phase={} chunkIndex={} model={} "
            + "tools={} toolNames={} chunkType={} toolLike={} blankToolCallId={} chunk={}";
        var chunkType = chunk == null ? "null" : chunk.type();
        if ("warn".equals(level)) {
            log.warn(message, trace.summary(), phase, index, AiFoundationCallLog.modelName(modelName),
                toolCount(agentToolSet), toolNames(agentToolSet), chunkType, toolLike,
                protocolError, chunkForLog(chunk));
            return;
        }
        log.info(message, trace.summary(), phase, index, AiFoundationCallLog.modelName(modelName),
            toolCount(agentToolSet), toolNames(agentToolSet), chunkType, toolLike,
            protocolError, chunkForLog(chunk));
    }

    private UIMessageStreamResponse chatResponse(LanguageModel model, String modelName,
        String systemMessage, UIMessageChatRequest<Void> chatRequest, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, String phase) {
        var hasTools = hasTools(agentToolSet);
        log.info("AI Foundation agent-chat stream start: {} phase={} model={} modelClass={} "
                + "systemChars={} tools={} toolNames={} toolChoice={} maxSteps={}",
            trace.summary(), phase, AiFoundationCallLog.modelName(modelName), modelClass(model),
            AiFoundationCallLog.safeLength(systemMessage), toolCount(agentToolSet),
            toolNames(agentToolSet), hasTools ? "auto" : "none", hasTools ? 5 : 0);
        var chat = UIMessageChatHandlers.<Void>streamText(options -> options
            .model(model)
            .chatRequest(chatRequest)
            .request(builder -> builder
                .system(systemMessage)
                .tools(hasTools ? agentToolSet.tools() : null)
                .toolChoice(hasTools ? ToolChoice.auto() : ToolChoice.none())
                .stopWhen(hasTools ? StopCondition.stepCountIs(5) : null))
            .prepare(context -> {
                logPreparedRequest(modelName, model, trace, phase,
                    context.getRequestBuilder().build());
                return Mono.empty();
            })
            .onError(error -> {
                logChatError(modelName, error, agentToolSet, trace, phase + ".onError");
                return resolveErrorMessage(error);
            }));
        return chat.response();
    }

    private UIMessageStreamResponse withToolProtocolFallback(LanguageModel model, String modelName,
        String systemMessage, UIMessageChatRequest<Void> chatRequest, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, UIMessageStreamResponse primary) {
        if (!hasTools(agentToolSet)) {
            return primary;
        }
        var stream = Flux.defer(() -> {
            var fallbackStarted = new AtomicBoolean();
            var toolProtocolText = new StringBuilder();
            var chunkIndex = new java.util.concurrent.atomic.AtomicInteger();
            return primary.stream()
                .concatMap(chunk -> {
                    logStreamChunk(modelName, agentToolSet, trace, "primary",
                        chunkIndex.incrementAndGet(), chunk);
                    if (fallbackStarted.get()) {
                        return Mono.empty();
                    }
                    if (!toolProtocolText.isEmpty()) {
                        appendToolProtocolText(toolProtocolText, chunk);
                        if (isCompleteToolProtocolText(toolProtocolText)
                            && fallbackStarted.compareAndSet(false, true)) {
                            return fallbackFromToolProtocolText(model, modelName, systemMessage,
                                chatRequest, agentToolSet, trace, toolProtocolText.toString())
                                .stream();
                        }
                        if (isToolCallIdProtocolError(chunk)
                            && fallbackStarted.compareAndSet(false, true)) {
                            return fallbackFromToolProtocolText(model, modelName, systemMessage,
                                chatRequest, agentToolSet, trace, toolProtocolText.toString())
                                .stream();
                        }
                        return Mono.empty();
                    }
                    if (isToolProtocolTextLeak(chunk)) {
                        appendToolProtocolText(toolProtocolText, chunk);
                        if (!isCompleteToolProtocolText(toolProtocolText)) {
                            return Mono.empty();
                        }
                        if (!fallbackStarted.compareAndSet(false, true)) {
                            return Mono.empty();
                        }
                        return fallbackFromToolProtocolText(model, modelName, systemMessage,
                            chatRequest, agentToolSet, trace, toolProtocolText.toString())
                            .stream();
                    }
                    if (!isToolCallIdProtocolError(chunk)) {
                        return Mono.just(chunk);
                    }
                    if (!fallbackStarted.compareAndSet(false, true)) {
                        return Mono.empty();
                    }
                    logToolProtocolChunkFallback(modelName, agentToolSet, trace, chunk);
                    return fallbackWithoutTools(model, modelName, systemMessage, chatRequest,
                        trace, "blank-toolCallId-chunk").stream();
                })
                .onErrorResume(error -> {
                    if (!toolProtocolText.isEmpty()
                        && fallbackStarted.compareAndSet(false, true)) {
                        return fallbackFromToolProtocolText(model, modelName, systemMessage,
                            chatRequest, agentToolSet, trace, toolProtocolText.toString())
                            .stream();
                    }
                    if (fallbackStarted.get() && isToolCallIdProtocolError(error)) {
                        log.warn("Suppress Agent primary stream protocol error after fallback: {} "
                                + "model={} errorType={} error={}",
                            trace.summary(), AiFoundationCallLog.modelName(modelName),
                            AiFoundationCallLog.rootErrorType(error),
                            AiFoundationCallLog.rootErrorMessage(error));
                        return Flux.empty();
                    }
                    if (!isToolCallIdProtocolError(error)
                        || !fallbackStarted.compareAndSet(false, true)) {
                        log.error("Agent primary stream failed before fallback decision: {} "
                                + "phase=primary model={} tools={} toolNames={} errorType={} "
                                + "error={} errorChain={}",
                            trace.summary(), AiFoundationCallLog.modelName(modelName),
                            toolCount(agentToolSet), toolNames(agentToolSet),
                            AiFoundationCallLog.rootErrorType(error),
                            AiFoundationCallLog.rootErrorMessage(error),
                            AiFoundationCallLog.errorChain(error), error);
                        return Flux.error(error);
                    }
                    logToolProtocolThrowableFallback(modelName, agentToolSet, trace, error);
                    return fallbackWithoutTools(model, modelName, systemMessage, chatRequest,
                        trace, "blank-toolCallId-error").stream();
                })
                .concatWith(Flux.defer(() -> {
                    if (!toolProtocolText.isEmpty()
                        && fallbackStarted.compareAndSet(false, true)) {
                        return fallbackFromToolProtocolText(model, modelName, systemMessage,
                            chatRequest, agentToolSet, trace, toolProtocolText.toString())
                            .stream();
                    }
                    return Flux.empty();
                }));
        });
        return new UIMessageStreamResponse(new UIMessageStream(stream));
    }

    private UIMessageStreamResponse fallbackWithoutTools(LanguageModel model, String modelName,
        String systemMessage, UIMessageChatRequest<Void> chatRequest, AgentChatTraceContext trace,
        String reason) {
        log.info("Agent fallback without tools start: {} model={} reason={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName), reason);
        var fallbackPrompt = (systemMessage == null ? "" : systemMessage)
            + "\n\n【运行时降级】\n"
            + "当前模型返回了不完整的工具调用流，本轮已自动关闭工具调用。"
            + "请基于已有对话上下文直接回答；不要声称已经调用工具、检索站点、打开页面或提交内容。";
        return chatResponse(model, modelName, fallbackPrompt, chatRequest, AgentToolSet.disabled(),
            trace, "fallback-no-tools");
    }

    private UIMessageStreamResponse fallbackFromToolProtocolText(LanguageModel model,
        String modelName, String systemMessage, UIMessageChatRequest<Void> chatRequest,
        AgentToolSet agentToolSet, AgentChatTraceContext trace, String protocolText) {
        var calls = toolProtocolTextParser.parse(protocolText, agentToolSet);
        if (calls.isEmpty()) {
            logToolProtocolTextLeakFallback(modelName, agentToolSet, trace, protocolText);
            return fallbackWithoutTools(model, modelName, systemMessage, chatRequest, trace,
                "tool-call-text-leak");
        }
        log.error("Agent tool-call protocol text leaked, parsed compatibility tool calls: {} "
                + "phase=primary-text model={} tools={} toolNames={} parsedCalls={} text={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName), toolCount(agentToolSet),
            toolNames(agentToolSet), parsedCallNames(calls), truncate(protocolText),
            new IllegalStateException("model emitted tool-call protocol markers as text"));
        return fallbackWithCompatibilityTools(model, modelName, systemMessage, chatRequest,
            agentToolSet, trace, calls);
    }

    private UIMessageStreamResponse fallbackWithCompatibilityTools(LanguageModel model,
        String modelName, String systemMessage, UIMessageChatRequest<Void> chatRequest,
        AgentToolSet agentToolSet, AgentChatTraceContext trace, List<ParsedToolCall> calls) {
        var tools = toolMap(agentToolSet);
        var results = new ArrayList<CompatibilityToolResult>();
        var toolChunks = Flux.fromIterable(calls)
            .concatMap(call -> compatibilityToolChunks(call, tools, trace, modelName)
                .doOnNext(result -> results.add(result))
                .flatMapMany(this::toCompatibilityToolChunks));
        var stream = toolChunks.concatWith(Flux.defer(() -> {
            if (results.stream().anyMatch(CompatibilityToolResult::delegatedToBrowser)) {
                return Flux.empty();
            }
            return fallbackAfterCompatibilityTools(model, modelName, systemMessage, chatRequest,
                trace, results).stream()
                .filter(chunk -> !"start".equals(chunk.type()));
        }));
        return new UIMessageStreamResponse(new UIMessageStream(stream));
    }

    private Mono<CompatibilityToolResult> compatibilityToolChunks(ParsedToolCall call,
        Map<String, ToolDefinition> tools, AgentChatTraceContext trace, String modelName) {
        var tool = tools.get(call.toolName());
        if (tool == null) {
            return Mono.just(CompatibilityToolResult.error(call, "工具未启用"));
        }
        if (tool.getExecutor() == null) {
            log.info("Agent compatibility tool call delegated to browser: {} model={} "
                    + "toolName={} toolCallId={} input={}",
                trace.summary(), AiFoundationCallLog.modelName(modelName), call.toolName(),
                call.toolCallId(), safeJson(call.input()));
            return Mono.just(CompatibilityToolResult.browser(call));
        }
        var context = ToolExecutionContext.builder()
            .toolCallId(call.toolCallId())
            .toolName(call.toolName())
            .input(call.input())
            .stepIndex(0)
            .providerMetadata(Map.of("summaraidCompatibility", true,
                "rawToolName", call.rawToolName()))
            .build();
        return tool.getExecutor().execute(context)
            .defaultIfEmpty(Map.of("ok", true))
            .map(output -> {
                log.info("Agent compatibility server tool executed: {} model={} toolName={} "
                        + "toolCallId={} input={} output={}",
                    trace.summary(), AiFoundationCallLog.modelName(modelName), call.toolName(),
                    call.toolCallId(), safeJson(call.input()), truncate(safeJson(output)));
                return CompatibilityToolResult.output(call, output);
            })
            .onErrorResume(error -> {
                log.error("Agent compatibility server tool failed: {} model={} toolName={} "
                        + "toolCallId={} input={} errorType={} error={}",
                    trace.summary(), AiFoundationCallLog.modelName(modelName), call.toolName(),
                    call.toolCallId(), safeJson(call.input()),
                    AiFoundationCallLog.rootErrorType(error),
                    AiFoundationCallLog.rootErrorMessage(error), error);
                return Mono.just(CompatibilityToolResult.error(call,
                    resolveErrorMessageText(AiFoundationCallLog.rootErrorMessage(error))));
            });
    }

    private Flux<UIMessageChunk> toCompatibilityToolChunks(CompatibilityToolResult result) {
        var call = result.call();
        var metadata = Map.<String, Object>of("summaraidCompatibility", true,
            "rawToolName", call.rawToolName());
        var input = UIMessageChunks.toolInputAvailable(call.toolCallId(), call.toolName(),
            call.input(), metadata);
        if (result.delegatedToBrowser()) {
            return Flux.just(input);
        }
        if (result.errorText() != null) {
            return Flux.just(input, UIMessageChunks.toolOutputError(call.toolCallId(),
                call.toolName(), result.errorText(), metadata));
        }
        return Flux.just(input, UIMessageChunks.toolOutputAvailable(call.toolCallId(),
            call.toolName(), result.output(), metadata));
    }

    private UIMessageStreamResponse fallbackAfterCompatibilityTools(LanguageModel model,
        String modelName, String systemMessage, UIMessageChatRequest<Void> chatRequest,
        AgentChatTraceContext trace, List<CompatibilityToolResult> results) {
        log.info("Agent fallback after compatibility tools start: {} model={} toolResults={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName), results.size());
        var fallbackPrompt = (systemMessage == null ? "" : systemMessage)
            + "\n\n【运行时工具兼容】\n"
            + "当前模型把工具调用协议作为普通文本输出，系统已拦截并执行可在后端执行的工具。"
            + "请只基于下面的工具结果和已有对话上下文回答；不要再输出工具协议标记，"
            + "也不要声称执行了未出现在结果中的工具。\n"
            + compatibilityToolResultsPrompt(results);
        return chatResponse(model, modelName, fallbackPrompt, chatRequest, AgentToolSet.disabled(),
            trace, "fallback-compatibility-tools");
    }

    private String compatibilityToolResultsPrompt(List<CompatibilityToolResult> results) {
        var builder = new StringBuilder("\n【已执行工具结果】\n");
        for (var result : results) {
            builder.append("- toolName: ").append(result.call().toolName())
                .append("\n  input: ").append(truncate(safeJson(result.call().input())));
            if (result.errorText() != null) {
                builder.append("\n  error: ").append(result.errorText());
            } else if (result.delegatedToBrowser()) {
                builder.append("\n  output: 工具已交给浏览器端执行，当前后端无结果。");
            } else {
                builder.append("\n  output: ").append(truncate(safeJson(result.output())));
            }
            builder.append('\n');
        }
        return builder.toString();
    }

    private Map<String, ToolDefinition> toolMap(AgentToolSet agentToolSet) {
        if (!hasTools(agentToolSet)) {
            return Map.of();
        }
        var tools = new LinkedHashMap<String, ToolDefinition>();
        for (var tool : agentToolSet.tools()) {
            if (tool != null && StringUtils.hasText(tool.getName())) {
                tools.put(tool.getName(), tool);
            }
        }
        return tools;
    }

    private String parsedCallNames(List<ParsedToolCall> calls) {
        return calls.stream()
            .map(call -> call.rawToolName() + "->" + call.toolName())
            .toList()
            .toString();
    }

    private String safeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }

    private record CompatibilityToolResult(ParsedToolCall call, Object output, String errorText,
                                           boolean delegatedToBrowser) {
        static CompatibilityToolResult output(ParsedToolCall call, Object output) {
            return new CompatibilityToolResult(call, output, null, false);
        }

        static CompatibilityToolResult error(ParsedToolCall call, String errorText) {
            return new CompatibilityToolResult(call, null, errorText, false);
        }

        static CompatibilityToolResult browser(ParsedToolCall call) {
            return new CompatibilityToolResult(call, null, null, true);
        }
    }

    private void logToolProtocolChunkFallback(String modelName, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, UIMessageChunk chunk) {
        var protocolError = new IllegalStateException(
            "tool-call stream part toolCallId must not be blank");
        log.error("Agent tool-call stream protocol error, retrying this turn without tools: {} "
                + "phase=primary-chunk model={} tools={} toolNames={} error={} chunk={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName), toolCount(agentToolSet),
            toolNames(agentToolSet), protocolError.getMessage(), chunkForLog(chunk), protocolError);
    }

    private void logToolProtocolThrowableFallback(String modelName, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, Throwable error) {
        log.error("Agent tool-call stream failed, retrying this turn without tools: {} "
                + "phase=primary-stream model={} tools={} toolNames={} errorType={} "
                + "error={} errorChain={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName), toolCount(agentToolSet),
            toolNames(agentToolSet), AiFoundationCallLog.rootErrorType(error),
            AiFoundationCallLog.rootErrorMessage(error), AiFoundationCallLog.errorChain(error),
            error);
    }

    private void logToolProtocolTextLeakFallback(String modelName, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, String protocolText) {
        var protocolError = new IllegalStateException(
            "model emitted tool-call protocol markers as text");
        log.error("Agent tool-call protocol text leaked, retrying this turn without tools: {} "
                + "phase=primary-text model={} tools={} toolNames={} error={} text={}",
            trace.summary(), AiFoundationCallLog.modelName(modelName), toolCount(agentToolSet),
            toolNames(agentToolSet), protocolError.getMessage(), truncate(protocolText),
            protocolError);
    }

    private String resolveErrorMessageText(String message) {
        return StringUtils.hasText(message) ? message : "对话接口异常了，请稍后重试";
    }

    private String resolveErrorMessage(Throwable throwable) {
        if (throwable instanceof InvalidUIMessageException) {
            return "对话上下文异常了，请刷新后重试";
        }
        if (throwable instanceof ModelNotFoundException
            || throwable instanceof ModelDisabledException) {
            return "当前配置的 Halo AI 模型不可用，请联系站长检查配置";
        }
        if (throwable instanceof ProviderDisabledException) {
            return "Halo AI 提供商未启用，请联系站长检查配置";
        }
        if (throwable instanceof ProviderApiException) {
            return "Halo AI 提供商调用失败，请稍后再试";
        }
        if (throwable instanceof IllegalStateException) {
            return "AI 基础设施未启用，请联系站长";
        }
        return throwable != null && StringUtils.hasText(throwable.getMessage())
            ? throwable.getMessage()
            : "对话接口异常了，请稍后重试";
    }

    private void logChatError(String modelName, Throwable throwable, AgentToolSet agentToolSet,
        AgentChatTraceContext trace, String phase) {
        if (throwable instanceof InvalidUIMessageException invalid) {
            log.error("Invalid Halo UI messages in Agent chat: {} phase={} model={} tools={} "
                    + "toolNames={} issues={} errorChain={}",
                trace.summary(), phase, AiFoundationCallLog.modelName(modelName),
                toolCount(agentToolSet), toolNames(agentToolSet), invalid.issues(),
                AiFoundationCallLog.errorChain(throwable), throwable);
            return;
        }
        log.error("Error occurred while generating Agent chat result: {} phase={} model={} "
                + "tools={} toolNames={} errorType={} error={} errorChain={}",
            trace.summary(), phase, AiFoundationCallLog.modelName(modelName),
            toolCount(agentToolSet), toolNames(agentToolSet),
            AiFoundationCallLog.rootErrorType(throwable),
            AiFoundationCallLog.rootErrorMessage(throwable),
            AiFoundationCallLog.errorChain(throwable), throwable);
    }

    private boolean hasTools(AgentToolSet agentToolSet) {
        return agentToolSet != null && agentToolSet.tools() != null
            && !agentToolSet.tools().isEmpty();
    }

    private int toolCount(AgentToolSet agentToolSet) {
        return hasTools(agentToolSet) ? agentToolSet.tools().size() : 0;
    }

    private String toolNames(AgentToolSet agentToolSet) {
        if (!hasTools(agentToolSet)) {
            return "[]";
        }
        return agentToolSet.tools().stream()
            .map(ToolDefinition::getName)
            .toList()
            .toString();
    }

    private String toolSchemaSummaries(List<ToolDefinition> tools) {
        if (tools == null || tools.isEmpty()) {
            return "[]";
        }
        return tools.stream()
            .map(tool -> {
                if (tool == null) {
                    return "null";
                }
                return tool.getName()
                    + "{executor=" + (tool.getExecutor() != null)
                    + ", properties=" + schemaProperties(tool.getInputSchema())
                    + ", required=" + schemaRequired(tool.getInputSchema())
                    + "}";
            })
            .toList()
            .toString();
    }

    private String schemaProperties(Map<String, Object> schema) {
        if (schema == null || !(schema.get("properties") instanceof Map<?, ?> properties)) {
            return "[]";
        }
        return properties.keySet().stream()
            .map(String::valueOf)
            .toList()
            .toString();
    }

    private String schemaRequired(Map<String, Object> schema) {
        if (schema == null || schema.get("required") == null) {
            return "[]";
        }
        return String.valueOf(schema.get("required"));
    }

    private String modelClass(LanguageModel model) {
        return model == null ? "null" : model.getClass().getName();
    }

    private boolean isToolCallIdProtocolError(UIMessageChunk chunk) {
        return chunk instanceof ErrorChunk error && isToolCallIdProtocolErrorText(error.errorText())
            || containsBlankToolCallId(chunk);
    }

    private boolean isToolProtocolTextLeak(UIMessageChunk chunk) {
        return chunk instanceof TextDeltaChunk text && containsToolProtocolMarker(text.delta());
    }

    private void appendToolProtocolText(StringBuilder builder, UIMessageChunk chunk) {
        if (chunk instanceof TextDeltaChunk text) {
            builder.append(text.delta());
            return;
        }
        if (chunk instanceof ErrorChunk error && StringUtils.hasText(error.errorText())) {
            builder.append("\n").append(error.errorText());
        }
    }

    private boolean isCompleteToolProtocolText(StringBuilder builder) {
        var text = builder.toString();
        return text.contains("<|tool_calls_section_end|>")
            || text.contains("<|tool_call_end|>");
    }

    private boolean containsToolProtocolMarker(String text) {
        return StringUtils.hasText(text)
            && (text.contains("<|tool_")
            || text.contains("tool_calls_section_begin")
            || text.contains("tool_call_begin")
            || text.contains("tool_call_argument_begin"));
    }

    private boolean isToolCallIdProtocolError(Throwable error) {
        var current = error;
        while (current != null) {
            if (isToolCallIdProtocolErrorText(current.getMessage())) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private boolean isToolCallIdProtocolErrorText(String message) {
        return StringUtils.hasText(message)
            && (message.contains("tool-call stream part toolCallId must not be blank")
            || message.contains("stream part toolCallId must not be blank")
            || message.contains("Tool call id must not be blank")
            || message.contains("chunk.tool.id.required"));
    }

    private String errorText(UIMessageChunk chunk) {
        return chunk instanceof ErrorChunk error ? error.errorText() : String.valueOf(chunk);
    }

    private String chunkForLog(UIMessageChunk chunk) {
        try {
            return truncate(String.valueOf(UIMessageTransportCodec.chunkToMap(chunk)));
        } catch (RuntimeException e) {
            return truncate(String.valueOf(chunk));
        }
    }

    private String truncate(String text) {
        if (text == null || text.length() <= 2000) {
            return text;
        }
        return text.substring(0, 2000) + "...<truncated>";
    }

    private boolean containsBlankToolCallId(UIMessageChunk chunk) {
        try {
            return containsBlankToolCallId(UIMessageTransportCodec.chunkToMap(chunk));
        } catch (RuntimeException e) {
            return false;
        }
    }

    private boolean containsToolLikePart(UIMessageChunk chunk) {
        try {
            return containsToolLikePart(UIMessageTransportCodec.chunkToMap(chunk));
        } catch (RuntimeException e) {
            return false;
        }
    }

    private boolean containsBlankToolCallId(Object value) {
        if (value instanceof Map<?, ?> map) {
            var toolLike = isToolLikePart(map);
            if (toolLike && !StringUtils.hasText(valueAsString(map.get("toolCallId")))) {
                return true;
            }
            return map.values().stream().anyMatch(this::containsBlankToolCallId);
        }
        if (value instanceof Collection<?> collection) {
            return collection.stream().anyMatch(this::containsBlankToolCallId);
        }
        return false;
    }

    private boolean containsToolLikePart(Object value) {
        if (value instanceof Map<?, ?> map) {
            if (isToolLikePart(map)) {
                return true;
            }
            return map.values().stream().anyMatch(this::containsToolLikePart);
        }
        if (value instanceof Collection<?> collection) {
            return collection.stream().anyMatch(this::containsToolLikePart);
        }
        return false;
    }

    private boolean isToolLikePart(Map<?, ?> map) {
        var type = valueAsString(map.get("type"));
        return "tool-call".equals(type)
            || (type != null && type.startsWith("tool-"))
            || map.containsKey("toolName");
    }

    private String valueAsString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
