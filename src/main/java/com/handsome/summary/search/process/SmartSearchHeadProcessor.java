package com.handsome.summary.search.process;

import com.handsome.summary.service.SettingConfigGetter;
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
public class SmartSearchHeadProcessor implements TemplateHeadProcessor {
    private final SettingConfigGetter settings;
    private final PluginWrapper plugin;

    @Override
    public Mono<Void> process(ITemplateContext context, IModel model,
        IElementModelStructureHandler handler) {
        return settings.getSmartSearchConfig().doOnNext(config -> {
            if (Boolean.TRUE.equals(config.getEnable())) {
                model.add(context.getModelFactory().createText(
                    "<script defer src=\"/plugins/summaraidGPT/assets/static/SmartSearch.js?version="
                        + plugin.getDescriptor().getVersion() + "\"></script>"));
            }
        }).then();
    }
}
