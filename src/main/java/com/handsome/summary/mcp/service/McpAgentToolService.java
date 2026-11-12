package com.handsome.summary.mcp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.agent.model.AgentToolSet;
import com.handsome.summary.ai.ConditionalOnHaloAiFoundation;
import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.service.SettingConfigGetter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.schema.JsonSchema;
import run.halo.aifoundation.tool.ToolDefinition;

@Component
@ConditionalOnHaloAiFoundation
@RequiredArgsConstructor
@Slf4j
public class McpAgentToolService {
    private final SettingConfigGetter settings;
    private final McpClientService clients;
    private final McpResultMapper results;
    private final McpDiscoveryService catalogs;
    private final McpObservations observations;
    private final ObjectMapper mapper = new ObjectMapper();

    public Mono<AgentToolSet> appendTools(AgentToolSet base, boolean authenticated) {
        if (!base.agentEnabled()) return Mono.just(base);
        return settings.getMcpSettings().flatMap(config -> {
            if (!Boolean.TRUE.equals(config.enabled())) return Mono.just(base);
            return Flux.fromIterable(config.servers()).filter(server -> Boolean.TRUE.equals(server.enabled()))
                .distinct(McpSettings.Server::id).take(8)
                .filter(server -> server.tools().stream().anyMatch(policy -> allowed(policy, authenticated)))
                .flatMap(server -> catalogs.discover(server)
                    .flatMapMany(discovery -> Flux.fromIterable(discovery.tools()))
                    .flatMap(tool -> Mono.justOrEmpty(server.tools().stream()
                        .filter(policy -> policy.name() != null && policy.name().equals(tool.name()))
                        .filter(policy -> allowed(policy, authenticated)).findFirst())
                        .map(policy -> definition(server, tool, policy, authenticated)))
                    .onErrorResume(error -> {
                        log.warn("MCP tool discovery failed: serverId={} errorType={}", server.id(),
                            error.getClass().getSimpleName());
                        return Flux.empty();
                    }), 4)
                .take(64).collectList().map(external -> {
                    var tools = new ArrayList<>(base.tools());
                    tools.addAll(external);
                    return new AgentToolSet(true, List.copyOf(tools));
                });
        });
    }

    private ToolDefinition definition(McpSettings.Server server,
        io.modelcontextprotocol.spec.McpSchema.Tool tool, McpSettings.ToolPolicy policy,
        boolean authenticated) {
        var schema = mapper.convertValue(tool.inputSchema(), new TypeReference<Map<String, Object>>() { });
        if (schema == null || !"object".equals(schema.get("type"))) {
            throw new IllegalArgumentException("MCP 工具需提供 object 输入 Schema");
        }
        return ToolDefinition.builder().name(toolName(server.id(), tool.name()))
            .description(clip("MCP 服务「" + label(server) + "」工具「" + tool.name() + "」："
                + (tool.description() == null ? "" : tool.description()), 2500))
            .inputSchema(JsonSchema.fromMap(schema))
            .requiresApproval(Boolean.TRUE.equals(policy.requireApproval()))
            .executor(context -> execute(server.id(), tool.name(), context.getInput(), authenticated))
            .build();
    }

    private Mono<Object> execute(String serverId, String tool, Map<String, Object> input,
        boolean authenticated) {
        // Resolve again on approval continuations so disabling a tool revokes it immediately.
        return settings.getMcpSettings().filter(config -> Boolean.TRUE.equals(config.enabled()))
            .flatMap(config -> Mono.justOrEmpty(config.servers().stream()
                .filter(server -> serverId.equals(server.id()) && Boolean.TRUE.equals(server.enabled()))
                .filter(server -> server.tools().stream().anyMatch(policy -> tool.equals(policy.name())
                    && allowed(policy, authenticated))).findFirst()))
            .switchIfEmpty(Mono.error(new IllegalArgumentException("此 MCP 工具已停用或无权使用")))
            .flatMap(server -> Mono.defer(() -> {
                var start = java.time.Instant.now();
                return clients.call(server, tool, input)
                    .doOnSuccess(result -> observations.record(server, tool, "call", start,
                        Boolean.TRUE.equals(result.isError()) ? new IllegalStateException("ToolError") : null))
                    .doOnError(error -> observations.record(server, tool, "call", start, error))
                    .doOnCancel(() -> observations.record(server, tool, "call", start,
                        new java.util.concurrent.CancellationException()))
                    .map(result -> (Object) results.map(label(server), tool, result));
            }))
            .onErrorResume(error -> Mono.just(Map.of("kind", "mcp", "ok", false,
                "server", "MCP", "tool", tool, "content", List.of(Map.of("type", "text",
                    "text", "外部工具调用失败或已停用，请稍后重试")))));
    }

    private boolean allowed(McpSettings.ToolPolicy policy, boolean authenticated) {
        return Boolean.TRUE.equals(policy.enabled())
            && (!Boolean.TRUE.equals(policy.authenticatedOnly()) || authenticated);
    }

    static String toolName(String serverId, String tool) {
        try {
            var digest = MessageDigest.getInstance("SHA-256")
                .digest((serverId + ":" + tool).getBytes(StandardCharsets.UTF_8));
            var readable = tool.toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9_]", "_");
            if (readable.isBlank()) readable = "external_tool";
            return "mcp_" + HexFormat.of().formatHex(digest, 0, 6) + "_"
                + readable.substring(0, Math.min(readable.length(), 47));
        } catch (java.security.NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }

    private String label(McpSettings.Server server) {
        return server.name() == null || server.name().isBlank() ? server.id() : clip(server.name(), 100);
    }

    private String clip(String value, int max) {
        return value.substring(0, Math.min(value.length(), max));
    }
}
