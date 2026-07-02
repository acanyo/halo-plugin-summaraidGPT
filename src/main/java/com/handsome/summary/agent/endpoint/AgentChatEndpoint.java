package com.handsome.summary.agent.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.content.Builder.contentBuilder;
import static org.springdoc.core.fn.builders.requestbody.Builder.requestBodyBuilder;
import static org.springdoc.core.fn.builders.schema.Builder.schemaBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.agent.model.AgentSettings;
import com.handsome.summary.agent.service.AgentChatTurnRecorder;
import com.handsome.summary.agent.service.AgentToolService;
import com.handsome.summary.agent.service.AiAgentChatService;
import com.handsome.summary.ai.ConditionalOnHaloAiFoundation;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import java.security.Principal;
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
                    .description("RAG assistant Agent chat with Halo AI Foundation tools.")
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
            .flatMap(context -> chatCompletion(request, context))
            .onErrorMap(InvalidUIMessageException.class,
                throwable -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    throwable.getMessage(), throwable))
            .onErrorResume(IllegalArgumentException.class,
                throwable -> Mono.just(aiAgentChatService.errorResponse(throwable.getMessage())))
            .flatMap(response -> ServerResponse.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .headers(headers -> headers.setAll(response.headers()))
                .body(response.stream()
                    .map(chunk -> ServerSentEvent.builder(serializeChunk(chunk)).build())
                    .concatWithValues(ServerSentEvent.builder(
                        UIMessageStreamResponse.DONE_MARKER).build()), ServerSentEvent.class)
            );
    }

    private Mono<UIMessageStreamResponse> chatCompletion(ServerRequest request,
        RequestContext context) {
        return settingConfigGetter.getAssistantConfig()
            .flatMap(assistantConfig -> {
                if (assistantConfig.getEnableAssistant() != null
                    && !assistantConfig.getEnableAssistant()) {
                    return Mono.just(aiAgentChatService.errorResponse("RAG 智能助手未启用"));
                }
                return Mono.zip(
                    settingConfigGetter.getAiConfigForFunction("rag"),
                    settingConfigGetter.getAgentSettings(),
                    settingConfigGetter.getAiSecurityConfig(),
                    isAuthenticated(request)
                ).flatMap(tuple -> {
                    var aiConfig = tuple.getT1();
                    var agentSettings = tuple.getT2();
                    var accessMode = aiRequestSecurityService.resolveAccessMode(tuple.getT3());
                    var authenticated = tuple.getT4();
                    var toolSet = agentToolService.buildTools(agentSettings, authenticated,
                        accessMode.agentAllowed());
                    var turn = agentChatTurnRecorder.start(aiConfig.getModelName(),
                        context.knowledgeBase(), context.conversationId(), context.visitorId(),
                        userAgent(request), context.chatRequest(),
                        shouldRecordUserMessage(context));
                    return agentChatTurnRecorder.recordUserMessage(turn)
                        .then(aiAgentChatService.streamChatCompletion(
                            aiConfig.getModelName(),
                            agentToolService.appendCapabilityPrompt(aiConfig.getSystemPrompt(),
                                toolSet),
                            context.chatRequest(),
                            toolSet
                        ))
                        .map(response -> observeResponse(response, turn));
                });
            });
    }

    private UIMessageStreamResponse observeResponse(UIMessageStreamResponse response,
        AgentChatTurnRecorder.AgentChatTurn turn) {
        var stream = response.stream()
            .doOnNext(chunk -> agentChatTurnRecorder.observe(turn, chunk))
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
        return new RequestContext(request, stringInput(body, "conversationId"),
            stringInput(body, "visitorId"), stringInput(body, "knowledgeBase"),
            !Boolean.FALSE.equals(body.get("recordUserMessage")));
    }

    private String stringInput(Map<?, ?> input, String key) {
        var value = input == null ? null : input.get(key);
        return value == null ? null : StringUtils.trimWhitespace(String.valueOf(value));
    }

    private String serializeChunk(UIMessageChunk chunk) {
        try {
            return objectMapper.writeValueAsString(UIMessageTransportCodec.chunkToMap(chunk));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize UI message chunk", e);
        }
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }

    private record RequestContext(UIMessageChatRequest<Void> chatRequest, String conversationId,
                                  String visitorId, String knowledgeBase,
                                  boolean recordUserMessage) {
    }
}
