package com.handsome.summary.extension;

import com.handsome.summary.service.ChatLanguageService;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.jsoup.Jsoup;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebInputException;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.event.post.PostPublishedEvent;
import run.halo.app.extension.ExtensionClient;

@Component
@RequiredArgsConstructor
public class AiChatPublisher {
    private final ExtensionClient client;
    private final ChatLanguageService chatSvc;
    private final PostContentService postContentService;
    @Async
    @EventListener(PostPublishedEvent.class)
    public void onPostPublished(PostPublishedEvent event) {
        client.fetch(Post.class, event.getName())
            .ifPresent(post -> {
                Mono<String> postContent = getPostContent(event);
                postContent.flatMap(content -> {
                    try {
                        return chatSvc.model(content, post);
                    } catch (Exception e) {
                        return Mono.error(() -> new ServerWebInputException("处理文章摘要时出错: " + e.getMessage()));
                    }
                }).subscribe();
            });
    }

    @NotNull
    private Mono<String> getPostContent(PostPublishedEvent event) {
        return postContentService.getReleaseContent(event.getName())
            .flatMap(contentWrapper -> Mono.just(Jsoup.parse(contentWrapper.getContent()).text()))
            .onErrorResume(e -> Mono.error(() -> new ServerWebInputException("获取文章内容时出错: " + e.getMessage())));
    }

}
