package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.service.ArticleGenerateService;
import com.handsome.summary.service.ArticleTitleService;
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
 * 文章生成端点
 * 
 * @author Handsome
 * @since 3.1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ArticleGenerateEndpoint implements CustomEndpoint {
    
    private final ArticleGenerateService articleGenerateService;
    private final ArticleTitleService articleTitleService;

    public record GenerateRequest(
        String topic,
        String format,
        String style,
        String type,
        Integer maxLength
    ) {}
    
    public record TitleRequest(
        String content,
        String style,
        Integer count
    ) {}
    
    public record GenerateResponse(
        boolean success,
        String content,
        String message
    ) {
        public static GenerateResponse success(String content) {
            return new GenerateResponse(true, content, "文章生成成功");
        }

        public static GenerateResponse error(String message) {
            return new GenerateResponse(false, "", message);
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/ArticleGenerate";
        
        return SpringdocRouteBuilder.route()
            .POST("/generate/article", this::generateArticle,
                builder -> builder.operationId("GenerateArticle")
                    .tag(tag)
                    .description("生成完整文章，使用AI服务根据主题和要求生成文章内容")
                    .response(responseBuilder().implementation(GenerateResponse.class))
            )
            .POST("/generate/title", this::generateTitle,
                builder -> builder.operationId("GenerateTitle")
                    .tag(tag)
                    .description("根据文章内容生成标题，使用AI服务分析文章内容并生成合适的标题")
                    .response(responseBuilder().implementation(GenerateResponse.class))
            )
            .build();
    }
    
    /**
     * 生成完整文章接口
     */
    private Mono<ServerResponse> generateArticle(ServerRequest request) {
        return request.bodyToMono(GenerateRequest.class)
            .doOnNext(req -> log.info("收到文章生成请求: topic={}, format={}, style={}", 
                req.topic(), req.format(), req.style()))
            .flatMap(this::processGenerateRequest)
            .flatMap(response -> {
                log.info("文章生成响应: success={}, contentLength={}", 
                    response.success(), response.content() != null ? response.content().length() : 0);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(response);
            })
            .onErrorResume(e -> {
                log.error("文章生成处理失败，错误: {}", e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(GenerateResponse.error("文章生成处理失败：" + e.getMessage()));
            });
    }

    /**
     * 处理文章生成请求
     */
    private Mono<GenerateResponse> processGenerateRequest(GenerateRequest request) {
        log.info("收到文章生成请求，主题: {}, 格式: {}, 风格: {}, 类型: {}, 最大长度: {}", 
                request.topic(), request.format(), request.style(), request.type(), request.maxLength());

        // 验证请求参数
        if (request.topic() == null || request.topic().trim().isEmpty()) {
            return Mono.just(GenerateResponse.error("文章主题不能为空"));
        }
        if (request.topic().length() > 1000) {
            return Mono.just(GenerateResponse.error("文章主题长度不能超过1000个字符"));
        }

        // 构建服务请求
        ArticleGenerateService.GenerateRequest serviceRequest = new ArticleGenerateService.GenerateRequest(
            request.topic(),
            request.format() != null ? request.format() : "markdown",
            request.style() != null ? request.style() : "通俗易懂",
            request.type() != null ? request.type() : "full",
            request.maxLength() != null ? request.maxLength() : 2000
        );

        return articleGenerateService.generateArticle(serviceRequest)
            .map(response -> {
                if (response.success() && response.content() != null) {
                    return GenerateResponse.success(response.content());
                } else {
                    return GenerateResponse.error(response.message() != null ? response.message() : "生成失败");
                }
            })
            .onErrorResume(throwable -> {
                log.error("文章生成失败", throwable);
                return Mono.just(GenerateResponse.error(throwable.getMessage()));
            });
    }

    /**
     * 生成文章标题接口
     */
    private Mono<ServerResponse> generateTitle(ServerRequest request) {
        return request.bodyToMono(TitleRequest.class)
            .doOnNext(req -> log.info("收到标题生成请求: contentLength={}, style={}, count={}", 
                req.content() != null ? req.content().length() : 0, req.style(), req.count()))
            .flatMap(this::processTitleRequest)
            .flatMap(response -> {
                log.info("标题生成响应: success={}, contentLength={}", 
                    response.success(), response.content() != null ? response.content().length() : 0);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(response);
            })
            .onErrorResume(e -> {
                log.error("标题生成处理失败，错误: {}", e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(GenerateResponse.error("标题生成处理失败：" + e.getMessage()));
            });
    }

    /**
     * 处理标题生成请求
     */
    private Mono<GenerateResponse> processTitleRequest(TitleRequest request) {
        log.info("收到标题生成请求，内容长度: {}, 风格: {}, 数量: {}", 
                request.content() != null ? request.content().length() : 0, request.style(), request.count());

        // 验证请求参数
        if (request.content() == null || request.content().trim().isEmpty()) {
            return Mono.just(GenerateResponse.error("文章内容不能为空"));
        }
        if (request.content().length() > 10000) {
            return Mono.just(GenerateResponse.error("文章内容长度不能超过10000个字符"));
        }

        // 构建标题生成服务请求
        ArticleTitleService.TitleRequest serviceRequest = new ArticleTitleService.TitleRequest(
            request.content(),
            request.style() != null ? request.style() : "有利于SEO的标题",
            request.count() != null ? request.count() : 5
        );

        return articleTitleService.generateTitle(serviceRequest)
            .map(response -> {
                if (response.success() && response.content() != null) {
                    return GenerateResponse.success(response.content());
                } else {
                    return GenerateResponse.error(response.message() != null ? response.message() : "生成失败");
                }
            })
            .onErrorResume(throwable -> {
                log.error("标题生成失败", throwable);
                return Mono.just(GenerateResponse.error(throwable.getMessage()));
            });
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
