package com.handsome.summary.glossary.process;

import com.handsome.summary.glossary.service.ArticleGlossaryService;
import com.handsome.summary.glossary.service.GlossaryContentLoader;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.theme.ReactivePostContentHandler;

@Component
@RequiredArgsConstructor
public class GlossaryPostContentHandler implements ReactivePostContentHandler {
    private final SettingConfigGetter settings;
    private final ArticleGlossaryService glossary;

    @Override
    public Mono<PostContentContext> handle(PostContentContext context) {
        if (!GlossaryContentLoader.isPublic(context.getPost())) return Mono.just(context);
        return settings.getGlossaryConfig().map(config -> {
            if (!Boolean.TRUE.equals(config.getEnable())) return context;
            var postName = context.getPost().getMetadata().getName();
            if (Boolean.TRUE.equals(config.getAutoGenerate())) glossary.schedule(postName);
            var marker = new Element("ai-summaraidgpt-glossary")
                .attr("name", postName).attr("hidden", "")
                .attr("poll", String.valueOf(Boolean.TRUE.equals(config.getAutoGenerate())));
            context.setContent(marker.outerHtml() + context.getContent());
            return context;
        }).onErrorReturn(context);
    }
}
