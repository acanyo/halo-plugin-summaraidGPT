package com.handsome.summary.search.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.search.service.SmartSearchService;
import com.handsome.summary.search.service.SearchDiscoveryService;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
import run.halo.app.search.SearchOption;

@Component
@RequiredArgsConstructor
public class SmartSearchEndpoint implements CustomEndpoint {
    private final SmartSearchService search;
    private final SettingConfigGetter settings;
    private final AiRequestSecurityService security;
    private final SearchDiscoveryService discovery;

    public record Request(String query, String mode, SearchOption options) { }
    public record ErrorResponse(String message) { }
    public record DiscoveryRequest(SearchOption options, java.util.List<String> excludeIds) { }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/SmartSearch";
        return SpringdocRouteBuilder.route()
            .GET("smartSearchConfig", request -> settings.getSmartSearchConfig().flatMap(this::ok),
                builder -> builder.operationId("GetSmartSearchConfig").tag(tag)
                    .description("Get public smart search display settings.")
                    .response(responseBuilder().implementation(SettingConfigGetter.SmartSearchConfig.class)))
            .POST("smartSearch", this::search,
                builder -> builder.operationId("SmartSearch").tag(tag)
                    .description("Search public content by keyword or semantic similarity.")
                    .response(responseBuilder().implementation(SmartSearchService.Result.class)))
            .POST("smartSearchAnswer", this::answer,
                builder -> builder.operationId("SmartSearchAnswer").tag(tag)
                    .description("Stream an answer grounded in currently public, published articles.")
                    .response(responseBuilder().implementation(RagChatStreamEvent.class)))
            .POST("smartSearchDiscovery", this::discover,
                builder -> builder.operationId("SmartSearchDiscovery").tag(tag)
                    .description("Get random and popular public articles within the theme search scope.")
                    .response(responseBuilder().implementation(SearchDiscoveryService.Result.class)))
            .build();
    }

    private Mono<ServerResponse> discover(ServerRequest request) {
        return search.requireEnabled().then(request.bodyToMono(DiscoveryRequest.class)
                .defaultIfEmpty(new DiscoveryRequest(null, null)))
            .flatMap(body -> discovery.discover(body.options(), body.excludeIds()))
            .flatMap(this::ok).onErrorResume(this::error);
    }

    private Mono<ServerResponse> search(ServerRequest request) {
        return search.requireEnabled().flatMap(config -> body(request).flatMap(body -> {
            var options = options(body);
            if ("keyword".equals(body.mode()) || body.mode() == null) {
                return search.keyword(options);
            }
            if (!"semantic".equals(body.mode())) {
                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "不支持的搜索方式"));
            }
            if (!Boolean.TRUE.equals(config.getEnableSemantic())) {
                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "智能搜索尚未启用"));
            }
            return security.secure(request).then(Mono.defer(() -> search.semantic(options)));
        })).flatMap(this::ok).onErrorResume(this::error);
    }

    private Mono<ServerResponse> answer(ServerRequest request) {
        return search.requireEnabled().flatMap(config -> {
            if (!Boolean.TRUE.equals(config.getEnableAi())) {
                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "AI 解答尚未启用"));
            }
            return security.secure(request).then(body(request)).flatMap(body -> {
                var stream = search.answer(options(body)).map(event -> ServerSentEvent.builder(event)
                    .event(event.getType()).build());
                return ServerResponse.ok().contentType(MediaType.TEXT_EVENT_STREAM)
                    .header("Cache-Control", "no-store")
                    .body(stream, ServerSentEvent.class);
            });
        }).onErrorResume(this::error);
    }

    private Mono<Request> body(ServerRequest request) {
        return request.bodyToMono(Request.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "请输入搜索内容")));
    }

    private SearchOption options(Request request) {
        if (request.query() == null || request.query().isBlank() || request.query().strip().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "搜索内容需为 1–500 个字符");
        }
        var option = request.options() == null ? new SearchOption() : request.options();
        option.setKeyword(request.query().strip());
        option.setLimit(12);
        option.setFilterExposed(true);
        option.setFilterPublished(true);
        option.setFilterRecycled(false);
        option.setHighlightPreTag("");
        option.setHighlightPostTag("");
        return option;
    }

    private Mono<ServerResponse> ok(Object value) {
        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
            .header("Cache-Control", "no-store").bodyValue(value);
    }

    private Mono<ServerResponse> error(Throwable error) {
        if (error instanceof ResponseStatusException status) {
            return ServerResponse.status(status.getStatusCode()).bodyValue(new ErrorResponse(status.getReason()));
        }
        if (error instanceof org.springframework.core.codec.DecodingException
            || error instanceof org.springframework.web.server.ServerWebInputException) {
            return ServerResponse.badRequest().bodyValue(new ErrorResponse("搜索请求格式不正确"));
        }
        return ServerResponse.status(HttpStatus.BAD_GATEWAY)
            .bodyValue(new ErrorResponse("搜索暂时不可用，请稍后重试"));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
