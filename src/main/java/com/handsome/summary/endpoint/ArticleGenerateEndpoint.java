package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.service.ArticleGenerateService;
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

    public record GenerateRequest(
        String topic,
        String format,
        String style,
        String type,
        Integer maxLength
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

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
