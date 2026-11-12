package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.mcp.model.McpSettings;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class McpClientServiceTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void negotiatesSessionsDiscoversAllPagesCallsToolsAndClosesJsonAndSseSessions(boolean sse)
        throws Exception {
        var methods = new CopyOnWriteArrayList<String>();
        var closed = new AtomicInteger();
        var authFailures = new AtomicInteger();
        var http = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        http.createContext("/custom/mcp", exchange -> {
            try {
                if (!"Bearer fixture-token".equals(exchange.getRequestHeaders().getFirst("Authorization"))
                    || !"fixture-key".equals(exchange.getRequestHeaders().getFirst("X-API-Key"))) {
                    authFailures.incrementAndGet();
                }
                if ("DELETE".equals(exchange.getRequestMethod())) {
                    closed.incrementAndGet();
                    exchange.sendResponseHeaders(200, -1);
                    return;
                }
                if (!"POST".equals(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }
                var body = mapper.readTree(exchange.getRequestBody());
                var method = body.path("method").asText();
                methods.add(method);
                if (!body.has("id")) {
                    exchange.sendResponseHeaders(202, -1);
                    return;
                }
                Object result;
                if ("initialize".equals(method)) {
                    exchange.getResponseHeaders().set("Mcp-Session-Id", "session-test");
                    result = Map.of("protocolVersion", "2025-11-25", "capabilities", Map.of("tools", Map.of()),
                        "serverInfo", Map.of("name", "MCP fixture", "version", "1.0"));
                } else {
                    if (!"session-test".equals(exchange.getRequestHeaders().getFirst("Mcp-Session-Id"))) {
                        authFailures.incrementAndGet();
                    }
                    if ("tools/list".equals(method)) {
                        var tool = Map.of("name", body.path("params").has("cursor") ? "read_document" : "web_search",
                            "description", "Fixture tool", "inputSchema", Map.of("type", "object",
                                "properties", Map.of("query", Map.of("type", "string"))));
                        result = body.path("params").has("cursor") ? Map.of("tools", List.of(tool))
                            : Map.of("tools", List.of(tool), "nextCursor", "page-2");
                    } else if ("tools/call".equals(method)) {
                        result = Map.of("content", List.of(Map.of("type", "text", "text", "资料内容")),
                            "structuredContent", Map.of("query", body.path("params").path("arguments").path("query").asText()),
                            "isError", false);
                    } else result = Map.of();
                }
                var json = mapper.writeValueAsString(Map.of("jsonrpc", "2.0", "id", body.get("id"), "result", result));
                var payload = (sse ? "event: message\ndata: " + json + "\n\n" : json).getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", sse ? "text/event-stream" : "application/json");
                exchange.sendResponseHeaders(200, payload.length);
                exchange.getResponseBody().write(payload);
            } finally { exchange.close(); }
        });
        http.start();
        try {
            var service = new McpClientService(new McpServerValidator());
            var server = new McpSettings.Server("fixture", "测试", true,
                "http://127.0.0.1:" + http.getAddress().getPort() + "/custom/mcp", "fixture-token",
                List.of(new McpSettings.Header("X-API-Key", "fixture-key")), true, 5, List.of());
            var discovery = service.discover(server).block(Duration.ofSeconds(10));
            assertThat(discovery.serverName()).isEqualTo("MCP fixture");
            assertThat(discovery.tools()).extracting(tool -> tool.name()).containsExactly("web_search", "read_document");
            var result = service.call(server, "web_search", Map.of("query", "Halo")).block(Duration.ofSeconds(10));
            assertThat(result.isError()).isFalse();
            assertThat(mapper.valueToTree(result.structuredContent()).path("query").asText()).isEqualTo("Halo");
            assertThat(methods).contains("notifications/initialized", "tools/call");
            assertThat(authFailures).hasValue(0);
            assertThat(closed).hasValue(2);
        } finally { http.stop(0); }
    }
}
