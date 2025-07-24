package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;
import static run.halo.app.extension.index.query.QueryFactory.and;
import static run.halo.app.extension.index.query.QueryFactory.equal;
import static run.halo.app.extension.index.query.QueryFactory.isNotNull;

import com.handsome.summary.extension.Summary;
import com.handsome.summary.service.ArticleSummaryService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.router.selector.FieldSelector;
import java.util.Map;

/**
 * 文章摘要端点
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArticleSummaryEndpoint implements CustomEndpoint {

    private final ArticleSummaryService articleSummaryService;
    private final ReactiveExtensionClient extensionClient;

    // 使用记录类定义API响应
    public record ApiResponse(boolean success, String message, String summaryContent, boolean blackList) {
        public static ApiResponse success(String message, String content, boolean blackList) {
            return new ApiResponse(true, message, content, blackList);
        }
        
        public static ApiResponse error(String message) {
            return new ApiResponse(false, message, "", false);
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticleSummary";

        return SpringdocRouteBuilder.route()
            .POST("/summaries/{postName}", this::generateSummary,
                builder -> builder.operationId("GenerateSummary")
                    .tag(tag).description("生成摘要")
                    .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true))
                    .response(responseBuilder().implementation(String.class))
            )
            .GET("/findSummaries/{postName}", this::findSummary,
                builder -> builder.operationId("FindSummary")
                    .tag(tag).description("查找摘要")
                    .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true))
                    .response(responseBuilder().implementation(String.class))
            )
            .POST("/updateContent/{permalink}", this::updateContent,
                builder -> builder.operationId("UpdateContent")
                    .tag(tag).description("更新文章内容")
                    .parameter(parameterBuilder().name("permalink").in(ParameterIn.PATH).required(true))
                    .response(responseBuilder().implementation(String.class))
            )
            .build();
    }

    private Mono<ServerResponse> generateSummary(ServerRequest request) {
        var postName = request.pathVariable("postName");

        return extensionClient.fetch(Post.class, postName)
            .flatMap(articleSummaryService::getSummary)
            .onErrorResume(e -> Mono.just("生成失败：" + e.getMessage()))
            .flatMap(summary -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(summary));
    }

    private Mono<ServerResponse> findSummary(ServerRequest request) {
        var postName = request.pathVariable("postName");

        return articleSummaryService.findSummaryByPostName(postName)
            .collectList()
            .flatMap(list -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(list));
    }

    private Mono<ServerResponse> updateContent(ServerRequest request) {
        var permalink = request.pathVariable("permalink");
        var actualPermalink = normalizePermalink(permalink);

        return findSummaryByPermalink(actualPermalink)
            .flatMap(this::processUpdateRequest)
            .flatMap(response -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response))
            .onErrorResume(this::handleUpdateError);
    }

    // 规范化permalink处理
    private String normalizePermalink(String permalink) {
        var processed = permalink.replace("__", "/");
        return processed.startsWith("/") ? processed : "/" + processed;
    }

    private Mono<ApiResponse> processUpdateRequest(Summary summary) {
        var postName = summary.getSummarySpec().getPostMetadataName();

        return articleSummaryService.updatePostContentWithSummary(postName)
            .map(this::convertToApiResponse)
            .onErrorResume(e -> Mono.just(ApiResponse.error("更新失败：" + e.getMessage())));
    }

    // 使用模式匹配处理Map响应
    private ApiResponse convertToApiResponse(Map<String, Object> resultMap) {
        return switch (resultMap.get("success")) {
            case Boolean success when success ->
                ApiResponse.success(
                    (String) resultMap.get("message"),
                    (String) resultMap.get("summaryContent"),
                    (Boolean) resultMap.get("blackList")
                );
            case Boolean ignored ->
                ApiResponse.error((String) resultMap.get("message"));
            case null, default ->
                ApiResponse.error("未知响应格式");
        };
    }

    private Mono<ServerResponse> handleUpdateError(Throwable e) {
        var errorResponse = ApiResponse.error("系统异常：" + e.getMessage());
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(errorResponse);
    }

    private Mono<Summary> findSummaryByPermalink(String permalink) {
        var listOptions = new ListOptions();
        listOptions.setFieldSelector(FieldSelector.of(
            and(equal("summarySpec.postUrl", permalink), 
                isNotNull("summarySpec.postUrl"))
        ));
        
        return extensionClient.listAll(Summary.class, listOptions, Sort.unsorted())
            .next()
            .switchIfEmpty(Mono.error(new IllegalArgumentException(
                "未找到对应的摘要记录：" + permalink)));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}