package com.handsome.summary.mcp.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.ai.extension.AiCallLog;
import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.mcp.service.McpCapabilities;
import com.handsome.summary.mcp.service.McpConfigService;
import com.handsome.summary.mcp.service.McpDiscoveryService;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;

@Component
@RequiredArgsConstructor
public class McpManagementEndpoint implements CustomEndpoint {
    private final McpConfigService config;
    private final McpDiscoveryService catalogs;
    private final McpCapabilities capabilities;
    private final ReactiveExtensionClient client;

    public record Calls(List<AiCallLog> items, int page, int size, long total) { }

    @Override public RouterFunction<ServerResponse> endpoint() {
        return SpringdocRouteBuilder.route()
            .GET("mcpConfig", request -> config.read().flatMap(this::ok),
                b -> b.operationId("ReadMcpConfiguration").tag("MCP").response(responseBuilder().implementation(McpSettings.class)))
            .PUT("mcpConfig", request -> request.bodyToMono(McpSettings.class)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("请填写 MCP 配置")))
                    .flatMap(config::save).flatMap(this::ok).onErrorResume(this::badRequest),
                b -> b.operationId("SaveMcpConfiguration").tag("MCP").response(responseBuilder().implementation(McpSettings.class)))
            .GET("mcpStatus", request -> ok(catalogs.status()),
                b -> b.operationId("GetMcpStatus").tag("MCP").response(responseBuilder().implementation(McpDiscoveryService.Snapshot.class)))
            .GET("mcpCalls", this::calls,
                b -> b.operationId("ListMcpCalls").tag("MCP").response(responseBuilder().implementation(Calls.class)))
            .GET("mcpCapabilities", request -> request.principal()
                    .map(p -> !"anonymousUser".equals(p.getName())).defaultIfEmpty(false)
                    .flatMap(capabilities::list).flatMap(this::ok),
                b -> b.operationId("ListMcpCapabilities").tag("MCP").response(responseBuilder().implementation(List.class)))
            .build();
    }

    private Mono<ServerResponse> calls(ServerRequest request) {
        int page = number(request, "page", 1, 100000), size = number(request, "size", 20, 100);
        var server = request.queryParam("serverId").orElse("");
        var state = request.queryParam("state").orElse("");
        var phase = request.queryParam("phase").orElse("");
        return client.listAll(AiCallLog.class, ListOptions.builder()
                .fieldQuery(run.halo.app.extension.index.query.Queries.equal("spec.modelType", "mcp")).build(), Sort.unsorted())
            .filter(log -> log.getSpec() != null && "mcp".equals(log.getSpec().getModelType()))
            .filter(log -> server.isBlank() || server.equals(metadata(log).get("serverId")))
            .filter(log -> phase.isBlank() || phase.equals(metadata(log).get("phase")))
            .filter(log -> state.isBlank() || ("success".equals(state) == Boolean.TRUE.equals(log.getSpec().getSuccess())))
            .sort(Comparator.comparing((AiCallLog log) -> log.getSpec().getStartedAt(),
                Comparator.nullsFirst(Comparator.naturalOrder())).reversed())
            .collectList().flatMap(logs -> ok(new Calls(logs.stream().skip((long) (page - 1) * size)
                .limit(size).toList(), page, size, logs.size())));
    }

    private Map<String, String> metadata(AiCallLog log) {
        return log.getSpec().getMetadata() == null ? Map.of() : log.getSpec().getMetadata();
    }

    private int number(ServerRequest request, String name, int fallback, int max) {
        try { return Math.clamp(Integer.parseInt(request.queryParam(name).orElse("")), 1, max); }
        catch (NumberFormatException error) { return fallback; }
    }

    private Mono<ServerResponse> ok(Object value) {
        return ServerResponse.ok().header("Cache-Control", "no-store").bodyValue(value);
    }

    private Mono<ServerResponse> badRequest(Throwable error) {
        if (!(error instanceof IllegalArgumentException)) return Mono.error(error);
        return ServerResponse.status(HttpStatus.BAD_REQUEST).bodyValue(Map.of("message", error.getMessage()));
    }

    @Override public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
