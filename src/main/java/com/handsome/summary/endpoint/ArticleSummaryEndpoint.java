package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ServerWebInputException;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ExtensionClient;
import run.halo.app.extension.GroupVersion;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import com.handsome.summary.service.ArticleSummaryService;
import run.halo.app.extension.ReactiveExtensionClient;

/**
 * 文章摘要端点
 * 提供文章摘要相关的API接口
 *
 * @author handsome
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArticleSummaryEndpoint implements CustomEndpoint {

    private final ArticleSummaryService articleSummaryService;
    private final ReactiveExtensionClient extensionClient;
    private final PostContentService postContentService;

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticleSummary";

        return SpringdocRouteBuilder.route()
            .POST("/summaries/{postName}", this::generateSummaryByPostName,
                builder -> builder.operationId("GenerateSummaryByPostName")
                    .tag(tag)
                    .description("根据文章名称生成摘要并保存")
                    .parameter(
                        parameterBuilder().name("postName").in(ParameterIn.PATH).required(true)
                            .implementation(String.class))
                    .response(responseBuilder().implementation(String.class))
            )
            .build();
    }

    /**
     * 根据postName生成摘要
     */
    private Mono<ServerResponse> generateSummaryByPostName(ServerRequest request) {
        String postName = request.pathVariable("postName");
        if (postName.trim().isEmpty()) {
            throw new ServerWebInputException("postName不能为空");
        }
        return extensionClient.fetch(Post.class, postName)
            .flatMap(post -> articleSummaryService.getSummary(post)
                .onErrorResume(e -> Mono.just("摘要生成失败：" + e.getMessage()))
            )
            .flatMap(summary -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(summary));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }

}