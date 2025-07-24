package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.service.ArticleSummaryService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
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
            .GET("/findSummaries/{postName}", this::findSummaryByPostName,
                builder -> builder.operationId("FindSummaryByPostName")
                    .tag(tag)
                    .description("根据文章名称获取摘要")
                    .parameter(
                        parameterBuilder().name("postName").in(ParameterIn.PATH).required(true)
                            .implementation(String.class))
                    .response(responseBuilder().implementation(String.class))
            )
            .POST("/updateContent/{postName}", this::updatePostContentWithSummary,
                builder -> builder.operationId("UpdatePostContentWithSummary")
                    .tag(tag)
                    .description("根据摘要内容更新文章正文")
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


    private Mono<ServerResponse> findSummaryByPostName(ServerRequest request) {
        String postName = request.pathVariable("postName");
        if (postName.trim().isEmpty()) {
            throw new ServerWebInputException("postName不能为空");
        }
        return articleSummaryService.findSummaryByPostName(postName)
            .collectList()
            .flatMap(list -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(list));
    }

    /**
     * 根据摘要内容更新文章正文
     */
    private Mono<ServerResponse> updatePostContentWithSummary(ServerRequest request) {
        String postName = request.pathVariable("postName");
        if (postName.trim().isEmpty()) {
            throw new ServerWebInputException("postName不能为空");
        }
        return articleSummaryService.updatePostContentWithSummary(postName)
            .flatMap(resultMap -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(resultMap))
            .onErrorResume(e -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                .bodyValue(java.util.Collections.emptyMap()));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }

}