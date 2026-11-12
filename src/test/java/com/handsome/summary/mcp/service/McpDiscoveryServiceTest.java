package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.handsome.summary.ai.service.AiCallLogService;
import com.handsome.summary.mcp.model.McpSettings;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

class McpDiscoveryServiceTest {
    private final McpClientService clients = mock(McpClientService.class);
    private final McpDiscoveryService catalogs = new McpDiscoveryService(clients,
        new McpObservations(mock(AiCallLogService.class)));

    @Test
    void coalescesConcurrentDiscoveryAndPreservesCacheWhenOnlyToolPoliciesChange() {
        var server = server("https://example.com/mcp", List.of());
        var sink = Sinks.<McpClientService.Discovery>one();
        when(clients.discover(server)).thenReturn(sink.asMono());
        var combined = Mono.zip(catalogs.discover(server), catalogs.discover(server)).toFuture();
        assertThat(combined).isNotDone();
        sink.tryEmitValue(new McpClientService.Discovery("docs", "1", List.of()));
        assertThat(combined.join().getT1()).isSameAs(combined.join().getT2());
        var policies = server(server.url(), List.of(new McpSettings.ToolPolicy("search", true, true, false)));
        catalogs.reconcile(new McpSettings(true, List.of(policies)));
        assertThat(catalogs.discover(policies).block()).isSameAs(combined.join().getT1());
        verify(clients, times(1)).discover(any());
        assertThat(catalogs.status().cacheHits()).isEqualTo(2);
        catalogs.reconcile(new McpSettings(true, List.of(server("https://other.example/mcp", List.of()))));
        assertThat(catalogs.status().services()).isEmpty();
    }

    @Test
    void cachesFailuresBrieflyAndExplicitRefreshRecoversImmediately() {
        var server = server("https://example.com/mcp", List.of());
        when(clients.discover(server)).thenReturn(Mono.error(new java.util.concurrent.TimeoutException("secret")));
        assertThatThrownBy(() -> catalogs.discover(server).block()).hasCauseInstanceOf(java.util.concurrent.TimeoutException.class);
        assertThatThrownBy(() -> catalogs.discover(server).block());
        verify(clients, times(1)).discover(server);
        var status = catalogs.status().services().getFirst();
        assertThat(status.error()).contains("超时").doesNotContain("secret");
        assertThat(Duration.between(status.checkedAt(), status.expiresAt()).toSeconds()).isBetween(9L, 11L);
        when(clients.discover(server)).thenReturn(Mono.just(new McpClientService.Discovery("docs", "1", List.of())));
        assertThat(catalogs.refresh(server).block().serverName()).isEqualTo("docs");
        verify(clients, times(2)).discover(server);
    }

    private McpSettings.Server server(String url, List<McpSettings.ToolPolicy> tools) {
        return new McpSettings.Server("docs", "文档", true, url, "", List.of(), false, 5, tools);
    }
}
