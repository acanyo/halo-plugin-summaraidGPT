package com.handsome.summary.mcp.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.mcp.model.McpSettings.Server;
import io.modelcontextprotocol.client.McpAsyncClient;
import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.json.jackson2.JacksonMcpJsonMapper;
import io.modelcontextprotocol.json.schema.jackson2.DefaultJsonSchemaValidator;
import io.modelcontextprotocol.spec.McpSchema;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
@RequiredArgsConstructor
public class McpClientService {
    private final McpServerValidator validator;
    private final ObjectMapper mapper = new ObjectMapper()
        .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

    public record Discovery(String serverName, String serverVersion, List<McpSchema.Tool> tools) { }

    public Mono<Discovery> discover(Server server) {
        return withClient(server, client -> client.initialize().flatMap(init ->
            listPage(client, null, new ArrayList<>(), 0)
                .map(tools -> new Discovery(init.serverInfo().name(), init.serverInfo().version(), tools))));
    }

    public Mono<McpSchema.CallToolResult> call(Server server, String tool, Map<String, Object> input) {
        return withClient(server, client -> client.initialize()
            .then(client.callTool(new McpSchema.CallToolRequest(tool, input))));
    }

    private Mono<List<McpSchema.Tool>> listPage(McpAsyncClient client, String cursor,
        List<McpSchema.Tool> tools, int page) {
        return client.listTools(cursor).flatMap(result -> {
            if (result.tools() != null) tools.addAll(result.tools());
            if (tools.size() > 200 || page >= 19) {
                return Mono.error(new IllegalArgumentException("单个服务最多支持 200 个工具或 20 页工具列表"));
            }
            return result.nextCursor() == null || result.nextCursor().isBlank()
                ? Mono.just(List.copyOf(tools)) : listPage(client, result.nextCursor(), tools, page + 1);
        });
    }

    private <T> Mono<T> withClient(Server server, Function<McpAsyncClient, Mono<T>> action) {
        return Mono.usingWhen(Mono.fromCallable(() -> createClient(server))
                .subscribeOn(Schedulers.boundedElastic()),
            client -> action.apply(client).timeout(Duration.ofSeconds(server.timeoutSeconds() + 3)),
            this::close, (client, error) -> close(client), this::close);
    }

    private Mono<Void> close(McpAsyncClient client) {
        return client.closeGracefully().timeout(Duration.ofSeconds(2))
            .onErrorResume(error -> Mono.fromRunnable(client::close));
    }

    private McpAsyncClient createClient(Server server) {
        var uri = validator.validate(server);
        var headers = HttpRequest.newBuilder();
        if (server.token() != null && !server.token().isBlank()) {
            headers.header("Authorization", "Bearer " + server.token().strip());
        }
        server.headers().forEach(header -> headers.header(header.name(), header.value()));
        var origin = uri.getScheme() + "://" + uri.getRawAuthority();
        var path = uri.getRawPath().isEmpty() ? "/" : uri.getRawPath();
        var transport = HttpClientStreamableHttpTransport.builder(origin)
            .endpoint(path).requestBuilder(headers)
            .customizeClient(client -> client.followRedirects(HttpClient.Redirect.NEVER))
            .jsonMapper(new JacksonMcpJsonMapper(mapper))
            .asyncHttpRequestCustomizer((request, method, target, body, context) ->
                Mono.fromCallable(() -> {
                    validator.validateAddress(target, Boolean.TRUE.equals(server.allowPrivateNetwork()));
                    return request;
                }).subscribeOn(Schedulers.boundedElastic()))
            .connectTimeout(Duration.ofSeconds(Math.min(server.timeoutSeconds(), 10)))
            .build();
        return McpClient.async(transport)
            // PF4J worker threads cannot discover plugin-scoped SPI providers via TCCL.
            .jsonSchemaValidator(new DefaultJsonSchemaValidator(mapper))
            .clientInfo(new McpSchema.Implementation("summaraidGPT", "4.0.7"))
            .requestTimeout(Duration.ofSeconds(server.timeoutSeconds()))
            .initializationTimeout(Duration.ofSeconds(server.timeoutSeconds()))
            .build();
    }
}
