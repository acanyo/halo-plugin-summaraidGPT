package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayInputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.junit.jupiter.api.Test;

class HttpSpeechTransportTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void httpFailureExplainsInvalidWorkspaceWithoutReturningProviderText() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/speech", exchange -> {
            var body = """
                {"code":"BadRequest.IllegalEndpoint","message":"Workspace endpoint is invalid. sk-secret"}
                """.getBytes(StandardCharsets.UTF_8);
            exchange.getRequestBody().close();
            exchange.sendResponseHeaders(400, body.length);
            try (var output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/speech");
            assertThatThrownBy(() -> new HttpSpeechTransport().post(uri, Map.of(), Map.of()).block())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContainingAll("业务空间端点无效", "BadRequest.IllegalEndpoint", "北京")
                .hasMessageNotContaining("sk-secret")
                .hasMessageNotContaining("Workspace endpoint")
                .hasMessageNotContaining("127.0.0.1")
                .hasNoCause();
        } finally {
            server.stop(0);
        }
    }

    @Test
    void successfulHttpStatusStillChecksProviderErrorCodes() throws Exception {
        var error = mapper.readTree("""
            {"code":"BadRequest.IllegalEndpoint","message":"sk-secret"}
            """);
        assertThatThrownBy(() -> SpeechServiceErrors.checkResponse(error))
            .hasMessageContaining("业务空间端点无效")
            .hasMessageNotContaining("sk-secret");
        SpeechServiceErrors.checkResponse(mapper.readTree("{\"code\":0}"));
        SpeechServiceErrors.checkResponse(mapper.readTree("{\"code\":20000000}"));
        SpeechServiceErrors.checkResponse(mapper.readTree("{\"output\":{}}"));
    }

    @Test
    void genericHttpFailuresUseFixedMessagesAndNeverEchoUntrustedFields() {
        assertThat(SpeechServiceErrors.fromHttp(400, body("""
            {"code":"InvalidParameter","message":"The product is not activated sk-secret"}
            """))).hasMessageContaining("尚未开通所选模型服务").hasMessageNotContaining("sk-secret");
        var error = SpeechServiceErrors.fromHttp(401, body("""
            {"code":"sk-secret","message":"Authorization: Bearer sk-secret"}
            """));
        assertThat(error).hasMessageContainingAll("HTTP 401", "API Key").hasMessageNotContaining("sk-secret");
        assertThat(SpeechServiceErrors.fromHttp(403, body("{}")))
            .hasMessageContaining("访问权限");
        assertThat(SpeechServiceErrors.fromHttp(429, body("{}")))
            .hasMessageContaining("限流或额度不足");
        assertThat(SpeechServiceErrors.fromHttp(502, body("<html>sk-secret</html>")))
            .hasMessage("语音服务返回 HTTP 502，请检查语音服务配置").hasNoCause();
    }

    @Test
    void errorBodyReadsAreBoundedAndOversizedBodiesUseGenericMessage() {
        var bytes = ("{\"code\":\"BadRequest.IllegalEndpoint\",\"message\":\""
            + "x".repeat(SpeechServiceErrors.MAX_ERROR_BYTES * 2) + "\"}").getBytes(StandardCharsets.UTF_8);
        var input = new ByteArrayInputStream(bytes);
        assertThat(SpeechServiceErrors.fromHttp(400, input))
            .hasMessage("语音服务返回 HTTP 400，请检查语音服务配置");
        assertThat(input.available()).isEqualTo(bytes.length - SpeechServiceErrors.MAX_ERROR_BYTES - 1);
    }

    @Test
    void malformedSuccessResponseNeverExposesJsonParserPayload() throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/speech", exchange -> {
            var bytes = "{\"secret-sk-sensitive\": broken-json}".getBytes(StandardCharsets.UTF_8);
            exchange.getRequestBody().close();
            exchange.sendResponseHeaders(200, bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
        });
        server.start();
        try {
            var uri = URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/speech");
            assertThatThrownBy(() -> new HttpSpeechTransport().post(uri, Map.of(), Map.of()).block())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("语音服务未返回有效 JSON，请重新合成")
                .hasMessageNotContaining("secret-sk-sensitive")
                .hasNoCause();
        } finally {
            server.stop(0);
        }
    }

    private ByteArrayInputStream body(String json) {
        return new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8));
    }
}
