package com.handsome.summary.reading.service;

import com.handsome.summary.reading.model.ArticleReadingSource;
import com.handsome.summary.reading.support.ArticleReadingHash;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.app.content.ContentWrapper;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ReactiveExtensionClient;

@Component
@RequiredArgsConstructor
public class ArticleReadingContentLoader {

    private static final String BLOCK_SELECTOR = String.join(",",
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "blockquote", "pre",
        "figcaption", "td", "th");

    private final ReactiveExtensionClient client;
    private final PostContentService postContentService;

    public Mono<ArticleReadingSource> load(String postName) {
        return client.fetch(Post.class, normalizePostName(postName))
            .switchIfEmpty(Mono.error(() -> new IllegalArgumentException("文章不存在：" + postName)))
            .flatMap(post -> postContentService.getReleaseContent(post.getMetadata().getName())
                .map(this::contentText)
                .defaultIfEmpty("")
                .map(content -> toSource(post, normalizeContent(content))));
    }

    private ArticleReadingSource toSource(Post post, String content) {
        var postName = post.getMetadata().getName();
        var title = post.getSpec() == null ? postName : post.getSpec().getTitle();
        var url = post.getStatus() == null ? null : post.getStatus().getPermalink();
        return new ArticleReadingSource(postName, title, url, content,
            ArticleReadingHash.sha256(content));
    }

    private String contentText(ContentWrapper wrapper) {
        if (wrapper == null) {
            return "";
        }
        if (StringUtils.hasText(wrapper.getContent())) {
            return htmlText(wrapper.getContent());
        }
        return wrapper.getRaw();
    }

    private String htmlText(String html) {
        var document = Jsoup.parse(html);
        document.select("script,style,noscript,template,ai-summaraidGPT,"
            + "ai-summaraidGPT-reading,ai-summaraidGPT-data").remove();

        var blocks = new ArrayList<String>();
        document.select(BLOCK_SELECTOR).forEach(element -> addBlockText(blocks, element));
        if (!blocks.isEmpty()) {
            return String.join("\n\n", blocks);
        }
        return document.text();
    }

    private void addBlockText(List<String> blocks, Element element) {
        if (hasNestedBlock(element)) {
            return;
        }
        var text = element.text();
        if (StringUtils.hasText(text) && !blocks.contains(text)) {
            blocks.add(text);
        }
    }

    private boolean hasNestedBlock(Element element) {
        return element.children().stream()
            .anyMatch(child -> child.is(BLOCK_SELECTOR) || hasNestedBlock(child));
    }

    private String normalizeContent(String content) {
        if (!StringUtils.hasText(content)) {
            return "";
        }
        return content.replace('\u00a0', ' ')
            .replaceAll("[ \\t\\x0B\\f\\r]+", " ")
            .replaceAll("\\n{3,}", "\n\n")
            .strip();
    }

    private String normalizePostName(String postName) {
        if (!StringUtils.hasText(postName)) {
            throw new IllegalArgumentException("文章名称不能为空");
        }
        return postName.strip();
    }
}
