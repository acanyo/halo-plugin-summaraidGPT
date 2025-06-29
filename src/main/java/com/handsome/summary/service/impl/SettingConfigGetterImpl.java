package com.handsome.summary.service.impl;

import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Component
@RequiredArgsConstructor
public class SettingConfigGetterImpl implements SettingConfigGetter {
    private final ReactiveSettingFetcher settingFetcher;

    @Override
    public Mono<BasicConfig> getBasicConfig() {
        return settingFetcher.fetch(BasicConfig.GROUP, BasicConfig.class)
            .defaultIfEmpty(new BasicConfig());
    }

    @Override
    public Mono<SummaryConfig> getSummaryConfig() {
        return settingFetcher.fetch(SummaryConfig.GROUP, SummaryConfig.class)
            .defaultIfEmpty(new SummaryConfig());
    }

    @Override
    public Mono<StyleConfig> getStyleConfig() {
        return settingFetcher.fetch(StyleConfig.GROUP, StyleConfig.class)
            .defaultIfEmpty(new StyleConfig());
    }
}
