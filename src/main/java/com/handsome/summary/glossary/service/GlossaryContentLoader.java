package com.handsome.summary.glossary.service;

import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ReactiveExtensionClient;

@Component
@RequiredArgsConstructor
public class GlossaryContentLoader {
    private final ReactiveExtensionClient client;
    private final PostContentService contentService;

    public record Source(String postName, String title, String content) {
    }

    public Mono<Source> load(String postName) {
        return client.fetch(Post.class, postName)
            .filter(GlossaryContentLoader::isPublic)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "文章不存在或尚未公开发布")))
            .flatMap(post -> contentService.getReleaseContent(postName)
                .map(wrapper -> {
                    var document = Jsoup.parseBodyFragment(
                        wrapper.getContent() == null ? "" : wrapper.getContent());
                    document.select("script,style,noscript,template,pre,code,"
                        + "ai-summaraidgpt,ai-summaraidgpt-reading,ai-summaraidgpt-glossary,"
                        + "ai-summaraidgpt-data,likcc-article-podcast").remove();
                    return new Source(postName, post.getSpec().getTitle(), document.text());
                }))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "文章没有已发布的正文")));
    }

    public static boolean isPublic(Post post) {
        return post != null && post.getMetadata() != null
            && post.getMetadata().getDeletionTimestamp() == null && post.getSpec() != null
            && post.isPublished() && !post.isDeleted() && Post.isPublic(post.getSpec());
    }
}
