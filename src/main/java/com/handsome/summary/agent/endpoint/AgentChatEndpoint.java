package com.handsome.summary.agent.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.content.Builder.contentBuilder;
import static org.springdoc.core.fn.builders.requestbody.Builder.requestBodyBuilder;
import static org.springdoc.core.fn.builders.schema.Builder.schemaBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.agent.model.AgentChatTraceContext;
import com.handsome.summary.agent.model.AgentToolSet;
import com.handsome.summary.agent.service.AgentChatTurnRecorder;
import com.handsome.summary.agent.service.AgentToolService;
import com.handsome.summary.agent.service.AiAgentChatService;
import com.handsome.summary.ai.ConditionalOnHaloAiFoundation;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import java.security.Principal;
import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.tool.ToolDefinition;
import run.halo.aifoundation.ui.InvalidUIMessageException;
import run.halo.aifoundation.ui.UIMessageChatRequest;
import run.halo.aifoundation.ui.UIMessageChatTrigger;
import run.halo.aifoundation.ui.UIMessageChunk;
import run.halo.aifoundation.ui.UIMessageStream;
import run.halo.aifoundation.ui.UIMessageStreamResponse;
import run.halo.aifoundation.ui.UIMessageTransportCodec;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Slf4j
@Component
@ConditionalOnHaloAiFoundation
@RequiredArgsConstructor
public class AgentChatEndpoint implements CustomEndpoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AiRequestSecurityService aiRequestSecurityService;
    private final SettingConfigGetter settingConfigGetter;
    private final AgentToolService agentToolService;
    private final AgentChatTurnRecorder agentChatTurnRecorder;
    private final AiAgentChatService aiAgentChatService;

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = groupVersion().toString();
        return SpringdocRouteBuilder.route()
            .POST("ragAgentChat", this::chatProcess,
                builder -> builder.operationId("RagAgentChat")
                    .description("Frontend assistant Agent chat with Halo AI Foundation tools.")
                    .tag(tag)
                    .requestBody(requestBodyBuilder()
                        .required(true)
                        .content(contentBuilder()
                            .mediaType(MediaType.APPLICATION_JSON_VALUE)
                            .schema(schemaBuilder().implementation(Map.class))
                        ))
                    .response(responseBuilder().implementation(String.class))
            )
            .build();
    }

    private Mono<ServerResponse> chatProcess(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(Map.class))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Chat request body is required")))
            .map(this::toRequestContext)
            .flatMap(context -> chatCompletion(request, context)
                .map(response -> new ResponseContext(context.traceContext(), response)))
            .onErrorMap(InvalidUIMessageException.class,
                throwable -> {
                    log.error("Invalid Agent UI message request", throwable);
                    return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        throwable.getMessage(), throwable);
                })
            .onErrorResume(IllegalArgumentException.class,
                throwable -> {
                    log.error("Invalid Agent chat request", throwable);
                    return Mono.just(new ResponseContext(
                        AgentChatTraceContext.fallback("ragAgentChat"),
                        aiAgentChatService.errorResponse(throwable.getMessage())));
                })
            .flatMap(responseContext -> ServerResponse.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .headers(headers -> {
                    headers.setAll(responseContext.response().headers());
                    headers.set("X-SummaraidGPT-Trace-Id",
                        responseContext.traceContext().traceId());
                })
                .body(responseContext.response().stream()
                    .map(chunk -> ServerSentEvent.builder(
                        serializeChunk(chunk, responseContext.traceContext())).build())
                    .concatWithValues(ServerSentEvent.builder(
                        UIMessageStreamResponse.DONE_MARKER).build())
                    .doOnError(error -> log.error("Agent SSE response stream failed: {}",
                        responseContext.traceContext().summary(), error)),
                    ServerSentEvent.class)
            );
    }

    private Mono<UIMessageStreamResponse> chatCompletion(ServerRequest request,
        RequestContext context) {
        log.info("Agent chat request accepted: {}", context.traceContext().summary());
        return settingConfigGetter.getAssistantConfig()
            .flatMap(assistantConfig -> {
                if (assistantConfig.getEnableAssistant() != null
                    && !assistantConfig.getEnableAssistant()) {
                    log.warn("Agent chat rejected because assistant is disabled: {}",
                        context.traceContext().summary());
                    return Mono.just(aiAgentChatService.errorResponse("智能助手未启用"));
                }
                return Mono.zip(
                    settingConfigGetter.getAiConfigForFunction("agent"),
                    settingConfigGetter.getAgentSettings(),
                    settingConfigGetter.getAiSecurityConfig(),
                    settingConfigGetter.getRagConfig(),
                    isAuthenticated(request)
                ).flatMap(tuple -> {
                    var aiConfig = tuple.getT1();
                    var agentSettings = tuple.getT2();
                    var accessMode = aiRequestSecurityService.resolveAccessMode(tuple.getT3());
                    var ragConfig = tuple.getT4();
                    var authenticated = tuple.getT5();
                    var ragAvailableForAgent = context.ragEnabledForAgent()
                        && !Boolean.FALSE.equals(ragConfig.getEnableRag());
                    var toolSet = agentToolService.buildTools(agentSettings, authenticated,
                        accessMode.agentAllowed(), ragAvailableForAgent);
                    log.info("Agent chat settings resolved: {} model={} accessMode={} "
                            + "authenticated={} ragEnabledForAgent={} ragAvailable={} tools={} "
                            + "toolNames={}",
                        context.traceContext().summary(), aiConfig.getModelName(),
                        accessMode.value(), authenticated, context.ragEnabledForAgent(),
                        ragAvailableForAgent, toolCount(toolSet),
                        toolNames(toolSet));
                    var turn = agentChatTurnRecorder.start(aiConfig.getModelName(),
                        context.knowledgeBase(), context.conversationId(), context.visitorId(),
                        userAgent(request), context.chatRequest(),
                        shouldRecordUserMessage(context), context.traceContext().traceId());
                    return agentChatTurnRecorder.recordUserMessage(turn)
                        .then(aiAgentChatService.streamChatCompletion(
                            aiConfig.getModelName(),
                            agentToolService.appendCapabilityPrompt(aiConfig.getSystemPrompt(),
                                toolSet),
                            context.chatRequest(),
                            toolSet,
                            context.traceContext()
                        ))
                        .map(response -> observeResponse(response, turn, context.traceContext()));
                });
            });
    }

    private UIMessageStreamResponse observeResponse(UIMessageStreamResponse response,
        AgentChatTurnRecorder.AgentChatTurn turn, AgentChatTraceContext traceContext) {
        var stream = response.stream()
            .doOnNext(chunk -> agentChatTurnRecorder.observe(turn, chunk))
            .doOnError(error -> log.error("Agent chat stream failed: {}",
                traceContext.summary(), error))
            .onErrorResume(error -> agentChatTurnRecorder.finish(turn, error)
                .then(Mono.error(error)))
            .concatWith(Mono.defer(() -> agentChatTurnRecorder.finish(turn)
                .then(Mono.empty())));
        return new UIMessageStreamResponse(new UIMessageStream(stream));
    }

    private boolean shouldRecordUserMessage(RequestContext context) {
        var chatRequest = context.chatRequest();
        return context.recordUserMessage()
            && chatRequest != null
            && chatRequest.trigger() == UIMessageChatTrigger.SUBMIT_MESSAGE
            && !StringUtils.hasText(chatRequest.messageId());
    }

    private Mono<Boolean> isAuthenticated(ServerRequest request) {
        return request.principal()
            .map(Principal::getName)
            .map(name -> StringUtils.hasText(name) && !"anonymousUser".equals(name))
            .defaultIfEmpty(false);
    }

    private String userAgent(ServerRequest request) {
        return request.headers().firstHeader("User-Agent");
    }

    @SuppressWarnings("unchecked")
    private RequestContext toRequestContext(Map<?, ?> body) {
        UIMessageChatRequest<Void> request =
            UIMessageTransportCodec.chatRequestFromMap((Map<String, Object>) body,
            ignored -> null);
        var conversationId = stringInput(body, "conversationId");
        var visitorId = stringInput(body, "visitorId");
        var knowledgeBase = stringInput(body, "knowledgeBase");
        var recordUserMessage = !Boolean.FALSE.equals(body.get("recordUserMessage"));
        var ragEnabledForAgent = Boolean.TRUE.equals(body.get("ragEnabledForAgent"));
        return new RequestContext(request, conversationId, visitorId, knowledgeBase,
            recordUserMessage, ragEnabledForAgent, AgentChatTraceContext.from("ragAgentChat", conversationId,
                visitorId, knowledgeBase, request, recordUserMessage));
    }

    private String stringInput(Map<?, ?> input, String key) {
        var value = input == null ? null : input.get(key);
        return value == null ? null : StringUtils.trimWhitespace(String.valueOf(value));
    }

    private String serializeChunk(UIMessageChunk chunk, AgentChatTraceContext traceContext) {
        Map<String, Object> chunkMap;
        try {
            chunkMap = UIMessageTransportCodec.chunkToMap(chunk);
        } catch (RuntimeException e) {
            log.error("Failed to convert Agent UI message chunk: {} chunkType={} chunk={}",
                traceContext.summary(), chunk == null ? null : chunk.getClass().getName(),
                chunkForLog(chunk), e);
            throw e;
        }
        try {
            if (containsBlankToolCallId(chunkMap)) {
                log.error("Agent emitted invalid tool-call stream chunk with blank "
                    + "toolCallId: {} chunk={}", traceContext.summary(), chunkForLog(chunkMap));
            }
            if ("error".equals(valueAsString(chunkMap.get("type")))) {
                log.error("Agent UI message stream emitted error chunk: {} chunk={}",
                    traceContext.summary(), chunkForLog(chunkMap));
            }
            return objectMapper.writeValueAsString(chunkMap);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize Agent UI message chunk: {} chunk={}",
                traceContext.summary(), chunkForLog(chunkMap), e);
            throw new IllegalStateException("Failed to serialize UI message chunk", e);
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

    private boolean isToolLikePart(Map<?, ?> map) {
        var type = valueAsString(map.get("type"));
        return "tool-call".equals(type)
            || (type != null && type.startsWith("tool-"))
            || map.containsKey("toolName");
    }

    private String valueAsString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String chunkForLog(Object chunkMap) {
        try {
            var text = objectMapper.writeValueAsString(chunkMap);
            return text.length() > 2000 ? text.substring(0, 2000) + "...<truncated>" : text;
        } catch (JsonProcessingException e) {
            return String.valueOf(chunkMap);
        }
    }

    private int toolCount(AgentToolSet toolSet) {
        return toolSet == null || toolSet.tools() == null ? 0 : toolSet.tools().size();
    }

    private String toolNames(AgentToolSet toolSet) {
        if (toolSet == null || toolSet.tools() == null || toolSet.tools().isEmpty()) {
            return "[]";
        }
        return toolSet.tools().stream()
            .map(ToolDefinition::getName)
            .toList()
            .toString();
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }

    private record RequestContext(UIMessageChatRequest<Void> chatRequest, String conversationId,
                                  String visitorId, String knowledgeBase,
                                  boolean recordUserMessage, boolean ragEnabledForAgent,
                                  AgentChatTraceContext traceContext) {
    }

    private record ResponseContext(AgentChatTraceContext traceContext,
                                   UIMessageStreamResponse response) {
    }
}
