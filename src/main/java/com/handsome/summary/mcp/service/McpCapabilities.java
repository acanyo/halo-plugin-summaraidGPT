package com.handsome.summary.mcp.service;

import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/** Public capability hints contain only names and prompts explicitly published by the owner. */
@Component
@RequiredArgsConstructor
public class McpCapabilities {
    private final SettingConfigGetter settings;
    private final AiRequestSecurityService security;
    public record Capability(String id, String title, String service, String prompt, boolean approval) { }

    public Mono<List<Capability>> list(boolean authenticated) {
        return Mono.zip(settings.getMcpSettings(), settings.getAgentSettings(),
            settings.getAiSecurityConfig(), settings.getAssistantConfig()).map(tuple -> {
            var access = security.resolveAccessMode(tuple.getT3());
            if (!Boolean.TRUE.equals(tuple.getT1().enabled()) || !tuple.getT2().isEnabled()
                || Boolean.FALSE.equals(tuple.getT4().getEnableAssistant()) || !access.agentAllowed()
                || (!authenticated && !access.anonymousChatAllowed())) return List.<Capability>of();
            return tuple.getT1().servers().stream().filter(server -> Boolean.TRUE.equals(server.enabled()))
                .flatMap(server -> server.tools().stream()
                    .filter(tool -> Boolean.TRUE.equals(tool.enabled())
                        && (!Boolean.TRUE.equals(tool.authenticatedOnly()) || authenticated))
                    .map(tool -> capability(server, tool))).limit(12).toList();
        });
    }

    private Capability capability(McpSettings.Server server, McpSettings.ToolPolicy tool) {
        var label = tool.label().isBlank() ? tool.name().replace('_', ' ') : tool.label();
        return new Capability(server.id() + ":" + tool.name(), label, server.name(),
            tool.prompt().isBlank() ? "请使用「" + label + "」帮我查询：" : tool.prompt(),
            Boolean.TRUE.equals(tool.requireApproval()));
    }
}
