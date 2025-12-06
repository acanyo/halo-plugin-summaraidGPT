package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.service.TagService;
import com.handsome.summary.service.TagService.TagInfo;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class TagGenerationEndpoint implements CustomEndpoint {

    private final TagService tagService;
    private final ReactiveExtensionClient extensionClient;

    /**
     * 单个标签信息（包含来源）
     */
    public record TagItem(String name, boolean isExisting) {}
    
    /**
     * 标签生成响应（包含来源信息）
     */
    public record TagResponse(
        boolean success, 
        String message, 
        List<TagItem> tags,
        int totalCount,
        int existingCount,
        int newCount
    ) {
        public static TagResponse ok(List<TagItem> tags, int totalCount, int existingCount, int newCount) { 
            return new TagResponse(true, "success", tags, totalCount, existingCount, newCount); 
        }
        public static TagResponse error(String msg) { 
            return new TagResponse(false, msg, List.of(), 0, 0, 0); 
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/TagGeneration";
        return SpringdocRouteBuilder.route()
            .POST("/generateTags", this::generateTagsByBody,
                builder -> builder.operationId("GenerateTagsByBody")
                    .tag(tag)
                    .description("根据postName生成推荐标签")
                    .response(responseBuilder().implementation(String.class))
            )
            .build();
    }

    private record TagRequest(String postName, boolean ensure) {}

    private Mono<ServerResponse> generateTagsByBody(ServerRequest request) {
        return request.bodyToMono(TagRequest.class)
            .flatMap(body -> {
                String postName = body != null ? body.postName() : null;
                if (postName == null || postName.trim().isEmpty()) {
                    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(TagResponse.error("postName 不能为空"));
                }
                String normalized = postName.trim();
                log.info("开始生成标签，postName: {}", normalized);
                
                return extensionClient.fetch(Post.class, normalized)
                    .doOnNext(post -> log.info("成功获取文章: {}", post.getMetadata().getName()))
                    .flatMap(tagService::generateTagsWithSourceInfo)
                    .doOnNext(result -> log.info("生成标签结果: 总数={}, 已有={}, 新增={}", 
                        result.totalCount(), result.existingCount(), result.newCount()))
                    .flatMap(result -> {
                        List<TagItem> tagItems = result.tags().stream()
                            .map(info -> new TagItem(info.name(), info.isExisting()))
                            .toList();
                        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(TagResponse.ok(tagItems, result.totalCount(), result.existingCount(), result.newCount()));
                    })
                    .onErrorResume(e -> {
                        log.error("生成标签失败: {}", e.getMessage(), e);
                        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(TagResponse.error("生成失败: " + e.getMessage()));
                    });
            })
            .onErrorResume(e -> {
                log.info("请求处理失败: {}", e.getMessage(), e);
                return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(TagResponse.error("请求处理失败: " + e.getMessage()));
            });
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}


