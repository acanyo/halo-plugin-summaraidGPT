package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.service.ArticleSummaryService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.util.Map;
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
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.ListOptions;
import static run.halo.app.extension.index.query.QueryFactory.and;
import static run.halo.app.extension.index.query.QueryFactory.equal;
import static run.halo.app.extension.index.query.QueryFactory.isNotNull;
import org.springframework.data.domain.Sort;
import run.halo.app.extension.router.selector.FieldSelector;
import com.handsome.summary.extension.Summary;

/**
 * 文章摘要API端点
 * @author handsome
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArticleSummaryEndpoint implements CustomEndpoint {

    private final ArticleSummaryService articleSummaryService;
    private final ReactiveExtensionClient extensionClient;

    public record ApiResponse(boolean success, String message, String summaryContent, boolean blackList) {
        public static ApiResponse success(String message, String content, boolean blackList) {
            return new ApiResponse(true, message, content, blackList);
        }

        public static ApiResponse error(String message) {
            return new ApiResponse(false, message, "", false);
        }

        public static ApiResponse error(String message, String content, boolean blackList) {
            return new ApiResponse(false, message, content, blackList);
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticleSummary";

        return SpringdocRouteBuilder.route()
            .POST("/summaries", this::generateSummary,
                builder -> builder.operationId("GenerateSummary")
                    .tag(tag)
                    .description("根据文章对象生成AI摘要")
                    .response(responseBuilder().implementation(String.class))
            )
            .GET("/findSummaries/{postName}", this::findSummary,
                builder -> builder.operationId("FindSummary")
                    .tag(tag)
                    .description("根据文章名称查询已生成的摘要")
                    .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
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

    /**
     * 生成文章摘要
     */
    private Mono<ServerResponse> generateSummary(ServerRequest request) {
        return request.bodyToMono(Post.class)
            .flatMap(articleSummaryService::getSummary)
            .flatMap(summary -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(summary))
            .onErrorResume(e -> {
                log.error("生成摘要失败，错误: {}", e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue("生成失败：" + e.getMessage());
            });
    }

    /**
     * 查询文章摘要
     */
    private Mono<ServerResponse> findSummary(ServerRequest request) {
        String postName = extractPostName(request);

        return articleSummaryService.findSummaryByPostName(postName)
            .collectList()
            .flatMap(summaries -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(summaries))
            .onErrorResume(e -> {
                log.error("查询摘要失败，文章: {}, 错误: {}", postName, e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue("查询失败：" + e.getMessage());
            });
    }

    /**
     * 更新文章内容
     */
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

    private Mono<ApiResponse> processUpdateRequest(Summary summary) {
        var postName = summary.getSummarySpec().getPostMetadataName();

        return articleSummaryService.updatePostContentWithSummary(postName)
            .map(this::convertToApiResponse)
            .onErrorResume(e -> Mono.just(ApiResponse.error("更新失败：" + e.getMessage())));
    }

    private Mono<ServerResponse> handleUpdateError(Throwable e) {
        var errorResponse = ApiResponse.error("系统异常：" + e.getMessage());
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(errorResponse);
    }

    /**
     * 提取并验证文章名称参数
     */
    private String extractPostName(ServerRequest request) {
        String postName = request.pathVariable("postName");
        if (postName.trim().isEmpty()) {
            throw new ServerWebInputException("postName参数不能为空");
        }
        return postName.trim();
    }

    /**
     * 将服务层返回的Map转换为API响应对象
     */
    private ApiResponse convertToApiResponse(Map<String, Object> resultMap) {
        Boolean success = (Boolean) resultMap.get("success");
        String message = (String) resultMap.get("message");
        String summaryContent = (String) resultMap.get("summaryContent");
        Boolean blackList = (Boolean) resultMap.get("blackList");

        if (success == null) {
            return ApiResponse.error("未知响应格式");
        }

        if (success) {
            return ApiResponse.success(message, summaryContent, blackList != null ? blackList : false);
        } else {
            return ApiResponse.error(message, summaryContent, blackList != null ? blackList : false);
        }
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}