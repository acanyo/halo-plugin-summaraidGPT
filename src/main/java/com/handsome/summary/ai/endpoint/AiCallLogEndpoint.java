package com.handsome.summary.ai.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.ai.extension.AiCallLog;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiCallLogEndpoint implements CustomEndpoint {

    private final ReactiveExtensionClient client;

    public record AiCallLogResponse(List<AiCallLog> items) {
    }

    public record MutationResponse(boolean success, String message) {
    }

    public record ErrorResponse(boolean success, String message) {
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/AiCallLog";
        return SpringdocRouteBuilder.route()
            .GET("aiCallLogs", this::list,
                builder -> builder.operationId("ListAiCallLogs")
                    .tag(tag)
                    .description("List AI Foundation call logs.")
                    .response(responseBuilder().implementation(AiCallLogResponse.class))
            )
            .GET("aiCallLogs/{name}", this::get,
                builder -> builder.operationId("GetAiCallLog")
                    .tag(tag)
                    .description("Get AI Foundation call log.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(AiCallLog.class))
            )
            .DELETE("aiCallLogs/{name}", this::delete,
                builder -> builder.operationId("DeleteAiCallLog")
                    .tag(tag)
                    .description("Delete AI Foundation call log.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(MutationResponse.class))
            )
            .build();
    }

    private Mono<ServerResponse> list(ServerRequest request) {
        var limit = request.queryParam("limit").map(this::parseLimit).orElse(50);
        var operation = request.queryParam("operation").orElse(null);
        var modelType = request.queryParam("modelType").orElse(null);
        var success = request.queryParam("success").map(Boolean::parseBoolean).orElse(null);
        return client.listAll(AiCallLog.class, ListOptions.builder().build(), Sort.unsorted())
            .filter(log -> matches(log, operation, modelType, success))
            .sort(Comparator.comparing(this::startedAt).reversed())
            .take(limit)
            .collectList()
            .map(AiCallLogResponse::new)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> get(ServerRequest request) {
        var name = request.pathVariable("name");
        return client.fetch(AiCallLog.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "AI call log not found")))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> delete(ServerRequest request) {
        var name = request.pathVariable("name");
        return client.fetch(AiCallLog.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "AI call log not found")))
            .flatMap(client::delete)
            .then(ok(new MutationResponse(true, "AI 调用日志已删除")))
            .onErrorResume(this::errorResponse);
    }

    private boolean matches(AiCallLog log, String operation, String modelType, Boolean success) {
        var spec = log.getSpec();
        if (spec == null) {
            return false;
        }
        if (StringUtils.hasText(operation) && !operation.equalsIgnoreCase(spec.getOperation())) {
            return false;
        }
        if (StringUtils.hasText(modelType) && !modelType.equalsIgnoreCase(spec.getModelType())) {
            return false;
        }
        return success == null || success.equals(spec.getSuccess());
    }

    private java.time.Instant startedAt(AiCallLog log) {
        var specStartedAt = log.getSpec() == null ? null : log.getSpec().getStartedAt();
        if (specStartedAt != null) {
            return specStartedAt;
        }
        var metadata = log.getMetadata();
        return metadata == null || metadata.getCreationTimestamp() == null
            ? java.time.Instant.EPOCH
            : metadata.getCreationTimestamp();
    }

    private int parseLimit(String value) {
        try {
            return Math.max(1, Math.min(Integer.parseInt(value), 200));
        } catch (Exception e) {
            return 50;
        }
    }

    private Mono<ServerResponse> ok(Object body) {
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body);
    }

    private Mono<ServerResponse> errorResponse(Throwable error) {
        if (error instanceof ResponseStatusException responseStatusException) {
            return ServerResponse.status(responseStatusException.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new ErrorResponse(false, responseStatusException.getReason()));
        }
        log.error("AI call log endpoint failed", error);
        return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new ErrorResponse(false, error.getMessage()));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
