package com.handsome.summary.extension;

import com.handsome.summary.service.ArticleSummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import run.halo.app.core.extension.content.Post;
import run.halo.app.event.post.PostPublishedEvent;
import run.halo.app.extension.ExtensionClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class SummaryPublisher {
    private final ExtensionClient client;
    private final ArticleSummaryService articleSummaryService;

    @Async
    @EventListener(PostPublishedEvent.class)
    public void onPostPublished(PostPublishedEvent event) {
        client.fetch(Post.class, event.getName())
            .ifPresent(post -> {
                log.info("开始处理文章发布事件: {}", event.getName());
                articleSummaryService.getSummary(post)
                    .subscribe(
                        response -> log.info("摘要同步成功！: {}", response),
                        error -> log.error("摘要同步失败", error)
                    );
            });
    }
}
