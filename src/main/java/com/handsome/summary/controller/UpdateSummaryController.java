package com.handsome.summary.controller;

import com.handsome.summary.service.ChatLanguageService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.plugin.ApiVersion;

/**
 * 更新摘要控制器
 *
 * @author handsome
 */
@Slf4j
@ApiVersion("v1alpha1")
@RestController
@RequestMapping("/summary")
@AllArgsConstructor
public class UpdateSummaryController {

    private final PostContentService postContentService;
    private final ChatLanguageService chatLanguageSvc;

    @PutMapping("/update")
    public Mono<Void> updateSummary(@RequestBody Post post) {
        String postName = post.getMetadata().getName();
        log.info("开始更新文章摘要, 文章名称: {}", postName);
        
        return postContentService.getReleaseContent(postName)
            .flatMap(contentWrapper -> {
                String articleContent = Jsoup.parse(contentWrapper.getContent()).text();
                log.info("获取到文章内容, 长度: {}", articleContent.length());
                return chatLanguageSvc.model(articleContent,post);
            }).then();
    }
}
