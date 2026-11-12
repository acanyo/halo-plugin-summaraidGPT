package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.handsome.summary.agent.model.AgentAccessMode;
import com.handsome.summary.agent.model.AgentSettings;
import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class McpCapabilitiesTest {
    @Test
    void exposesOnlyPublishedCapabilitiesForCurrentAccessWithoutConnectionSecrets() {
        var settings = mock(SettingConfigGetter.class);
        var security = mock(AiRequestSecurityService.class);
        var service = new McpCapabilities(settings, security);
        var access = new SettingConfigGetter.AiSecurityConfig();
        when(settings.getAiSecurityConfig()).thenReturn(Mono.just(access));
        when(settings.getAssistantConfig()).thenReturn(Mono.just(new SettingConfigGetter.AssistantConfig()));
        when(settings.getAgentSettings()).thenReturn(Mono.just(AgentSettings.defaults()));
        when(security.resolveAccessMode(access)).thenReturn(AgentAccessMode.ANONYMOUS_CHAT_AGENT);
        when(settings.getMcpSettings()).thenReturn(Mono.just(new McpSettings(true, List.of(new McpSettings.Server(
            "docs", "文档", true, "https://secret.example/mcp", "secret-token", List.of(), false, 5, List.of(
                new McpSettings.ToolPolicy("search", true, true, false, "搜索文档", "帮我查资料"),
                new McpSettings.ToolPolicy("private", true, true, true),
                new McpSettings.ToolPolicy("disabled", false, true, false)))))));
        assertThat(service.list(false).block()).extracting(McpCapabilities.Capability::title).containsExactly("搜索文档");
        assertThat(service.list(true).block()).hasSize(2);
        assertThat(service.list(true).block().toString()).doesNotContain("secret-token", "secret.example", "disabled");
        when(security.resolveAccessMode(access)).thenReturn(AgentAccessMode.AUTHENTICATED_CHAT_AGENT);
        assertThat(service.list(false).block()).isEmpty();
        when(security.resolveAccessMode(access)).thenReturn(AgentAccessMode.AUTHENTICATED_CHAT);
        assertThat(service.list(true).block()).isEmpty();
    }
}
