package com.handsome.summary.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.handsome.summary.service.ConfigCenter;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Component
@EnableScheduling
@AllArgsConstructor
@Slf4j
public class ConfigCenterImpl implements ConfigCenter {
    private final ReactiveSettingFetcher settingFetcher;
    @Override
    public Mono<JsonNode> getAppConfigsByGroupName(String groupName) {
        return settingFetcher.get(groupName)
            .switchIfEmpty(Mono.error(new RuntimeException("配置不存在")));
    }
}
