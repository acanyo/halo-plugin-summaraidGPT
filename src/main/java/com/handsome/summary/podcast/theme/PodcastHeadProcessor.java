package com.handsome.summary.podcast.theme;

import com.handsome.summary.podcast.service.PodcastConfigService;
import lombok.RequiredArgsConstructor;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

@Component
@RequiredArgsConstructor
public class PodcastHeadProcessor implements TemplateHeadProcessor {
    private final PodcastConfigService config;
    private final PluginWrapper plugin;

    @Override
    public Mono<Void> process(ITemplateContext context, IModel model, IElementModelStructureHandler handler) {
        return config.get().doOnNext(settings -> {
            if (Boolean.TRUE.equals(settings.getEnabled()) && Boolean.TRUE.equals(settings.getEnableUiInjection())) {
                var version = org.springframework.web.util.HtmlUtils.htmlEscape(plugin.getDescriptor().getVersion());
                model.add(context.getModelFactory().createText("<script defer src=\"/plugins/summaraidGPT/assets/static/ArticlePodcast.js?v=" + version + "\"></script>"));
            }
        }).then().onErrorResume(error -> Mono.empty());
    }
}
