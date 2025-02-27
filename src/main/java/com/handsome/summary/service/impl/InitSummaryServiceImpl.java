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
    public Mono<Post> initSummary(Post post) {
        return pushAi(post.getMetadata().getName())
            .timeout(Duration.ofSeconds(30))
            .flatMap(summary -> updatePostSummary(post, summary))
            .onErrorResume(e -> {
                log.error("处理文章[{}]失败", post.getMetadata().getName(), e);

                return Mono.just(post);
            });
    }


    public void updateSummary() {
        // 构建查询条件（已优化标签选择器）
        ListOptions listOptions = ListOptions.builder()
            .labelSelector()
            .notExists("isSummary")
            .end()
            .build();

        client.listAll(Post.class, listOptions, null)
            .doOnSubscribe(sub -> log.info("开始查询未摘要文章...")) // 添加开始日志
            .doOnNext(post -> log.debug("找到待处理文章: {}", post.getMetadata().getName())) // 打印每个找到的文章
            .doOnComplete(() -> log.info("共发现 {} 篇待处理文章", listOptions.toString())) // 实际数量需要调整实现
            .parallel()
            .runOn(Schedulers.boundedElastic())
            .flatMap(post ->
                pushAi(post.getMetadata().getName())
                    .timeout(Duration.ofSeconds(30))
                    .flatMap(summary -> updatePostSummary(post, summary))
                    .doOnSuccess(p -> log.info("文章[{}]处理完成", p.getMetadata().getName())) // 添加成功日志
                    .onErrorResume(e -> {
                        log.error("处理文章[{}]失败: {}", post.getMetadata().getName(), e.getMessage());
                        return Mono.empty();
                    })
            )
            .subscribe(
                null,
                e -> log.error("处理文章整体失败: ", e), // 增强异常日志
                () -> log.info("处理文章完成，已处理所有待摘要文章")
            );
    }

    private Mono<Post> updatePostSummary(Post post, String summary) {
        post.getMetadata().getLabels().put("isSummary", "true");
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
