package com.handsome.summary.glossary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.glossary.extension.ArticleGlossary;
import com.handsome.summary.glossary.service.ArticleGlossaryService;
import com.handsome.summary.service.AiRequestSecurityService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Component
@RequiredArgsConstructor
public class ArticleGlossaryEndpoint implements CustomEndpoint {
    private final ArticleGlossaryService service;
    private final AiRequestSecurityService security;
    public record GenerateRequest(String postName, Boolean refresh) { }
    public record ErrorResponse(String message) { }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticleGlossary";
        return SpringdocRouteBuilder.route()
            .GET("articleGlossaries/{postName}", request -> service.getExisting(request.pathVariable("postName"))
                .flatMap(value -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(value))
                .switchIfEmpty(ServerResponse.noContent().build()).onErrorResume(this::error),
                builder -> builder.operationId("GetArticleGlossary").tag(tag)
                    .description("Get current glossary for a publicly published article; 204 when not generated.")
                    .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(ArticleGlossary.class)))
            .POST("articleGlossaries", this::generate,
                builder -> builder.operationId("GenerateArticleGlossary").tag(tag)
                    .description("Generate contextual term explanations. Requires management permission.")
                    .response(responseBuilder().implementation(ArticleGlossary.class)))
            .build();
    }

    private Mono<ServerResponse> generate(ServerRequest request) {
        return security.secureManagement(request)
            .then(request.bodyToMono(GenerateRequest.class)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "请指定文章"))))
            .flatMap(body -> service.generate(body.postName(), Boolean.TRUE.equals(body.refresh())))
            .flatMap(value -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(value))
            .onErrorResume(this::error);
    }

    private Mono<ServerResponse> error(Throwable error) {
        if (error instanceof ResponseStatusException status) {
            return ServerResponse.status(status.getStatusCode()).bodyValue(new ErrorResponse(status.getReason()));
        }
        return ServerResponse.status(HttpStatus.BAD_GATEWAY)
            .bodyValue(new ErrorResponse("热词生成失败，请检查 AI 模型配置后重试"));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
