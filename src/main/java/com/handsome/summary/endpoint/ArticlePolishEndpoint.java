package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.service.ArticlePolishService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

/**
 * 文章润色端点
 * 
 * @author Handsome
 * @since 3.1.1
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArticlePolishEndpoint implements CustomEndpoint {
    
    private final ArticlePolishService articlePolishService;

    public record PolishRequest(String content) {}
    
    public record PolishResponse(
        boolean success, 
        String originalContent, 
        String polishedContent, 
        String message, 
        int originalLength, 
        int polishedLength
    ) {
        public static PolishResponse success(String originalContent, String polishedContent) {
            return new PolishResponse(true, originalContent, polishedContent, "文章润色成功", 
                originalContent.length(), polishedContent.length());
        }

        public static PolishResponse error(String originalContent, String message) {
            return new PolishResponse(false, originalContent, "", message, 
                originalContent.length(), 0);
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticlePolish";

        return SpringdocRouteBuilder.route()
            .POST("/polish", this::polishArticleSegment,
                builder -> builder.operationId("PolishArticleSegment")
                    .tag(tag)
                    .description("润色文章片段，使用AI服务对选中的文章片段进行润色，改善语言表达和流畅性")
                    .response(responseBuilder().implementation(PolishResponse.class))
            )
            .build();
    }

    /**
     * 润色文章片段接口
     */
    private Mono<ServerResponse> polishArticleSegment(ServerRequest request) {
        return request.bodyToMono(PolishRequest.class)
            .doOnNext(req -> log.info("收到润色请求体: {}", req))
            .flatMap(this::processPolishRequest)
            .flatMap(response -> {
                log.info("润色响应: {}", response);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(response);
            })
            .onErrorResume(e -> {
                log.error("文章润色处理失败，错误: {}", e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(PolishResponse.error("", "文章润色处理失败：" + e.getMessage()));
            });
    }

    /**
     * 处理润色请求
     */
    private Mono<PolishResponse> processPolishRequest(PolishRequest request) {
        log.info("收到文章润色请求，内容长度: {}", 
                request.content() != null ? request.content().length() : 0);

        // 验证请求参数
        if (request.content() == null || request.content().trim().isEmpty()) {
            return Mono.just(PolishResponse.error(request.content(), "文章内容不能为空"));
        }
        if (request.content().length() > 8000) {
            return Mono.just(PolishResponse.error(request.content(), "文章内容长度不能超过8000个字符"));
        }

        return articlePolishService.polishArticleSegment(request.content())
            .map(polishedContent -> PolishResponse.success(request.content(), polishedContent))
            .onErrorResume(throwable -> {
                log.error("文章润色失败", throwable);
                return Mono.just(PolishResponse.error(request.content(), throwable.getMessage()));
            });
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
