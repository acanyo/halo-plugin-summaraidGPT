package com.handsome.summary.podcast.theme;

import com.handsome.summary.podcast.service.PodcastConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.theme.ReactivePostContentHandler;

@Component
@RequiredArgsConstructor
public class PodcastPostContentHandler implements ReactivePostContentHandler {
    private final PodcastConfigService config;

    @Override
    public Mono<PostContentContext> handle(PostContentContext context) {
        return config.get().map(settings -> {
            if (Boolean.TRUE.equals(settings.getEnabled()) && Boolean.TRUE.equals(settings.getEnableUiInjection())) {
                var name = org.springframework.web.util.HtmlUtils.htmlEscape(context.getPost().getMetadata().getName());
                context.setContent("<likcc-article-podcast post-name=\"" + name + "\"></likcc-article-podcast>" + context.getContent());
            }
            return context;
        }).onErrorReturn(context);
    }
}
