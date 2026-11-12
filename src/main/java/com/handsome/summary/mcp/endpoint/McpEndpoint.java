package com.handsome.summary.mcp.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.mcp.model.McpSettings;
import com.handsome.summary.mcp.service.McpClientService;
import com.handsome.summary.mcp.service.McpDiscoveryService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

/** Console-only endpoint; deliberately absent from the anonymous role. */
@Component
@RequiredArgsConstructor
@Slf4j
public class McpEndpoint implements CustomEndpoint {
    private final McpDiscoveryService catalogs;

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        return SpringdocRouteBuilder.route()
            .POST("mcpTest", request -> request.bodyToMono(McpSettings.Server.class)
                    .switchIfEmpty(Mono.error(new IllegalArgumentException("请填写服务配置")))
                    .flatMap(catalogs::refresh)
                    .doOnError(error -> log.warn("MCP connection test failed: errorType={} location={}",
                        error.getClass().getSimpleName(), error.getStackTrace().length == 0
                            ? "unknown" : error.getStackTrace()[0]))
                    .flatMap(result -> ServerResponse.ok().header("Cache-Control", "no-store").bodyValue(result))
                    .onErrorResume(error -> ServerResponse.status(HttpStatus.BAD_REQUEST)
                        .bodyValue(Map.of("message", error instanceof IllegalArgumentException
                            ? error.getMessage() : "连接失败，请检查服务地址、鉴权信息和 Streamable HTTP 支持"))),
                builder -> builder.operationId("TestMcpServer").tag("MCP")
                    .description("Test a console-configured MCP server and discover its tools.")
                    .response(responseBuilder().implementation(McpClientService.Discovery.class)))
            .build();
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
