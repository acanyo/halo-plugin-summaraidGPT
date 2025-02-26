package com.handsome.summary.service.impl;

import com.handsome.summary.service.ChatService;
import com.handsome.summary.service.InitSummaryService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.index.query.Query;
import run.halo.app.extension.index.query.QueryFactory;
import java.time.Duration;

@Component
@EnableScheduling
@AllArgsConstructor
@Slf4j
public class InitSummaryServiceImpl implements InitSummaryService {
    private final PostContentService postContentService;
    private final ChatService chatService;
    private final ReactiveExtensionClient client;
    @Override
    public Mono<Void> initSummary() {
        updateSummary();
        return Mono.empty();
    }

    @Override
    public Mono<Post> initSummary(Post post,String postName) {
        Mono<Post> postMono = updatePostSummary(post, postName);
        return postMono;
    }

    public void updateSummary() {
        Query annotationQuery = QueryFactory.isNull("metadata.annotations.isSummary");
        ListOptions listOptions = ListOptions.builder()
            .fieldQuery(annotationQuery)
            .build();

        client.listAll(Post.class, listOptions, null)
            .parallel()
            .runOn(Schedulers.boundedElastic())
            .flatMap(post ->
                pushAi(post.getMetadata().getName())
                    .timeout(Duration.ofSeconds(30))
                    .flatMap(summary -> updatePostSummary(post, summary))
                    .onErrorResume(e -> {
                        log.error("处理文章[{}]失败", post.getMetadata().getName(), e);
                        return Mono.empty();
                    })
            )
            .subscribe(
                null,
                e -> log.error("定时任务异常", e),
                () -> log.info("定时任务完成")
            );
    }
    private Mono<Post> updatePostSummary(Post post, String summary) {
        post.getMetadata().getAnnotations().put("isSummary", "true");
        if (post.getStatus() == null) {
            post.setStatus(new Post.PostStatus());
        }
        post.getStatus().setExcerpt(summary);
        return client.update(post)
            .doOnSuccess(p -> log.info("文章[{}]摘要更新成功", p.getMetadata().getName()));
    }

    private Mono<String> pushAi(String postName) {
        return
            postContentService.getReleaseContent(postName).flatMap(contentWrapper -> {
                String articleContent = Jsoup.parse(contentWrapper.getContent()).text();
                return chatService.getSummary(articleContent);
            });
    }
}
