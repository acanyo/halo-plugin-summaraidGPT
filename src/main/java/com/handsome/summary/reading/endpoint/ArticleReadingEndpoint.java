package com.handsome.summary.reading.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.reading.extension.ArticleReading;
import com.handsome.summary.reading.extension.ArticleReadingInteraction;
import com.handsome.summary.reading.model.ArticleReadingInteractionCommand;
import com.handsome.summary.reading.service.ArticleReadingService;
import com.handsome.summary.service.AiRequestSecurityService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.net.InetSocketAddress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Slf4j
@Component
@RequiredArgsConstructor
public class ArticleReadingEndpoint implements CustomEndpoint {

    private final AiRequestSecurityService aiRequestSecurityService;
    private final ArticleReadingService articleReadingService;

    public record ReadingRequest(String postName, Boolean refresh) {
    }

    public record InteractionRequest(
        String postName,
        String nodeId,
        String interactionType,
        String value,
        String visitorId
    ) {
    }

    public record ErrorResponse(boolean success, String message) {
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticleReading";

        return SpringdocRouteBuilder.route()
            .GET("articleReadings/{postName}", this::getExisting,
                builder -> builder.operationId("GetArticleReading")
                    .tag(tag)
                    .description("Get generated article insight graph.")
                    .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH)
                        .required(true).implementation(String.class))
                    .response(responseBuilder().implementation(ArticleReading.class))
            )
            .POST("articleReadings", this::getOrGenerate,
                builder -> builder.operationId("GenerateArticleReading")
                    .tag(tag)
                    .description("Generate or get article insight graph.")
                    .response(responseBuilder().implementation(ArticleReading.class))
            )
            .POST("articleReadingInteractions", this::recordInteraction,
                builder -> builder.operationId("RecordArticleReadingInteraction")
                    .tag(tag)
                    .description("Record article reading node feedback.")
                    .response(responseBuilder().implementation(ArticleReadingInteraction.class))
            )
            .build();
    }

    private Mono<ServerResponse> getExisting(ServerRequest request) {
        var postName = request.pathVariable("postName");
        return articleReadingService.getExisting(postName)
            .flatMap(this::ok)
            .onErrorResume(this::error);
    }

    private Mono<ServerResponse> getOrGenerate(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(ReadingRequest.class))
            .flatMap(readingRequest -> articleReadingService.getOrGenerate(
                normalizePostName(readingRequest.postName()),
                Boolean.TRUE.equals(readingRequest.refresh())
            ))
            .flatMap(this::ok)
            .onErrorResume(this::error);
    }

    private Mono<ServerResponse> recordInteraction(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(InteractionRequest.class))
            .map(body -> toCommand(body, remoteAddress(request)))
            .flatMap(articleReadingService::recordInteraction)
            .flatMap(this::ok)
            .onErrorResume(this::error);
    }

    private ArticleReadingInteractionCommand toCommand(InteractionRequest request,
        String remoteAddress) {
        return new ArticleReadingInteractionCommand(
            request.postName(),
            request.nodeId(),
            request.interactionType(),
            request.value(),
            StringUtils.hasText(request.visitorId()) ? request.visitorId() : remoteAddress
        );
    }

    private String remoteAddress(ServerRequest request) {
        return request.remoteAddress()
            .map(InetSocketAddress::getHostString)
            .orElse("");
    }

    private Mono<ServerResponse> ok(Object body) {
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body);
    }

    private Mono<ServerResponse> error(Throwable error) {
        if (error instanceof ResponseStatusException) {
            return Mono.error(error);
        }
        log.error("洞察图谱 API 处理失败: {}", error.getMessage(), error);
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new ErrorResponse(false, error.getMessage()));
    }

    private String normalizePostName(String postName) {
        if (!StringUtils.hasText(postName)) {
            throw new IllegalArgumentException("文章名称不能为空");
        }
        return postName.strip();
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
