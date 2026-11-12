package com.handsome.summary.mcp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.HashMap;
import java.util.HashSet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.extension.ConfigMap;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

/** Own the MCP group independently of the generic settings page. */
@Component
@RequiredArgsConstructor
public class McpConfigService {
    private static final String CONFIG_NAME = "plugin-summaraidGPT-configMap";
    private final ReactiveExtensionClient client;
    private final SettingConfigGetter settings;
    private final McpServerValidator validator;
    private final McpDiscoveryService catalogs;
    private final ObjectMapper mapper = new ObjectMapper();

    public Mono<McpSettings> read() { return settings.getMcpSettings(); }

    public Mono<McpSettings> save(McpSettings config) {
        return Mono.fromCallable(() -> {
            if (config.servers().size() > 8) throw new IllegalArgumentException("最多添加 8 个服务");
            var ids = new HashSet<String>();
            for (var server : config.servers()) {
                if (!ids.add(server.id())) throw new IllegalArgumentException("服务标识不能重复");
                validator.validateConfiguration(server);
                if (server.name() == null || server.name().isBlank() || server.name().length() > 100
                    || server.tools().size() > 200) throw new IllegalArgumentException("请填写服务名称，工具数量不能超过 200");
                var names = new HashSet<String>();
                for (var tool : server.tools()) {
                    if (tool.name() == null || tool.name().isBlank() || tool.name().length() > 200
                        || !names.add(tool.name()) || tool.label().length() > 80 || tool.prompt().length() > 300) {
                        throw new IllegalArgumentException("工具名称、展示名称或示例问题不合法");
                    }
                }
            }
            return mapper.writeValueAsString(config);
        }).subscribeOn(Schedulers.boundedElastic()).flatMap(json ->
            client.fetch(ConfigMap.class, CONFIG_NAME).defaultIfEmpty(empty())
                .flatMap(current -> {
                    var data = new HashMap<>(current.getData() == null ? java.util.Map.<String, String>of() : current.getData());
                    data.put("mcp", json);
                    current.setData(data);
                    return current.getMetadata().getVersion() == null ? client.create(current) : client.update(current);
                }))
            .doOnSuccess(ignored -> catalogs.reconcile(config)).thenReturn(config);
    }

    private ConfigMap empty() {
        var config = new ConfigMap();
        config.setMetadata(new Metadata());
        config.getMetadata().setName(CONFIG_NAME);
        return config;
    }
}
