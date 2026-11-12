package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

import com.handsome.summary.agent.model.AgentToolSet;
import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.service.SettingConfigGetter;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.tool.ToolDefinition;
import run.halo.aifoundation.tool.ToolExecutionContext;

class McpAgentToolServiceTest {
    private final SettingConfigGetter settings = mock(SettingConfigGetter.class);
    private final McpClientService clients = mock(McpClientService.class);
    private final McpObservations observations = new McpObservations(mock(com.handsome.summary.ai.service.AiCallLogService.class));
    private final McpDiscoveryService catalogs = new McpDiscoveryService(clients, observations);
    private final McpAgentToolService service = new McpAgentToolService(settings, clients, new McpResultMapper(), catalogs, observations);
    private final AgentToolSet base = new AgentToolSet(true,
        List.of(ToolDefinition.builder().name("get_pages").build()));

    @Test
    void exposesOnlyExplicitlyEnabledToolsAndEnforcesLoginAndApproval() {
        var server = server(List.of(new McpSettings.ToolPolicy("web_search", true, true, false),
            new McpSettings.ToolPolicy("private_docs", true, false, true),
            new McpSettings.ToolPolicy("delete_document", false, true, true)));
        when(settings.getMcpSettings()).thenReturn(Mono.just(new McpSettings(true, List.of(server))));
        when(clients.discover(server)).thenReturn(Mono.just(discovery()));
        var anonymous = service.appendTools(base, false).block();
        assertThat(anonymous.tools()).extracting(ToolDefinition::getName)
            .containsExactly("get_pages", McpAgentToolService.toolName("docs", "web_search"));
        assertThat(anonymous.tools().get(1).getApprovalPolicy().requiresApproval(ToolExecutionContext.builder().build())).isTrue();
        var loggedIn = service.appendTools(base, true).block();
        assertThat(loggedIn.tools()).hasSize(3);
        assertThat(loggedIn.tools().get(2).getApprovalPolicy().requiresApproval(ToolExecutionContext.builder().build())).isFalse();
        assertThat(anonymous.toString()).doesNotContain("server-secret");
    }

    @Test
    void rechecksRevocationsBeforeExecutionAndNeverExposesRemoteConnectionErrors() {
        var server = server(List.of(new McpSettings.ToolPolicy("web_search", true, false, false)));
        when(settings.getMcpSettings()).thenReturn(Mono.just(new McpSettings(true, List.of(server))));
        when(clients.discover(server)).thenReturn(Mono.just(discovery()));
        var tool = service.appendTools(base, false).block().tools().get(1);
        when(settings.getMcpSettings()).thenReturn(Mono.just(McpSettings.defaults()));
        var result = tool.getExecutor().execute(ToolExecutionContext.builder().input(Map.of()).build()).block();
        assertThat(result).isInstanceOf(Map.class);
        assertThat(((Map<?, ?>) result).get("ok")).isEqualTo(false);
        verify(clients, never()).call(any(), any(), any());
        when(settings.getMcpSettings()).thenReturn(Mono.just(new McpSettings(true, List.of(server))));
        when(clients.call(any(), any(), any())).thenReturn(Mono.error(new RuntimeException("server-secret")));
        assertThat(tool.getExecutor().execute(ToolExecutionContext.builder().input(Map.of()).build()).block().toString())
            .doesNotContain("server-secret");
    }

    @Test
    void disabledAgentDoesNotConnectAndUnavailableServerKeepsBuiltInTools() {
        assertThat(service.appendTools(AgentToolSet.disabled(), false).block().tools()).isEmpty();
        verifyNoInteractions(settings, clients);
        var server = server(List.of(new McpSettings.ToolPolicy("web_search", true, false, false)));
        when(settings.getMcpSettings()).thenReturn(Mono.just(new McpSettings(true, List.of(server))));
        when(clients.discover(server)).thenReturn(Mono.error(new RuntimeException("offline")));
        assertThat(service.appendTools(base, false).block().tools()).isEqualTo(base.tools());
    }

    @Test
    void namesAreStableBoundedAndDistinctAcrossServersAndTools() {
        var name = McpAgentToolService.toolName("one", "search.tools/" + "x".repeat(100));
        assertThat(name).hasSizeLessThanOrEqualTo(64).matches("mcp_[a-f0-9]{12}_[a-z0-9_]+");
        assertThat(name).isEqualTo(McpAgentToolService.toolName("one", "search.tools/" + "x".repeat(100)));
        assertThat(McpAgentToolService.toolName("one", "search")).isNotEqualTo(McpAgentToolService.toolName("two", "search"));
    }

    private McpSettings.Server server(List<McpSettings.ToolPolicy> policies) {
        return new McpSettings.Server("docs", "文档", true, "https://example.com/mcp", "server-secret",
            List.of(), false, 5, policies);
    }

    private McpClientService.Discovery discovery() {
        return new McpClientService.Discovery("Documents", "1", List.of("web_search", "private_docs", "delete_document").stream()
            .map(name -> McpSchema.Tool.builder().name(name).description(name)
                .inputSchema(new McpSchema.JsonSchema("object", Map.of(), List.of(), false, null, null)).build())
            .toList());
    }
}
