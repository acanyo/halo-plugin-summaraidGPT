package com.handsome.summary.mcp.service;

import com.handsome.summary.ai.model.AiCallLogRecord;
import com.handsome.summary.ai.service.AiCallLogService;
import com.handsome.summary.mcp.model.McpSettings.Server;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Store timings and bounded failure categories, never credentials, inputs or returned data. */
@Component
@RequiredArgsConstructor
public class McpObservations {
    private final AiCallLogService logs;

    public void record(Server server, String tool, String phase, Instant start, Throwable error) {
        logs.record(AiCallLogRecord.builder().operation("mcp-" + phase).modelType("mcp")
            .modelName(server.name() == null || server.name().isBlank() ? server.id() : server.name())
            .startedAt(start).durationMillis(Duration.between(start, Instant.now()).toMillis())
            .success(error == null).errorType(error == null ? null : error.getClass().getSimpleName())
            .errorMessage(error == null ? null : reason(error))
            .metadata(Map.of("serverId", server.id(), "tool", tool, "phase", phase)).build());
    }

    public static String reason(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof java.util.concurrent.TimeoutException
                || cause instanceof java.net.http.HttpTimeoutException) return "服务响应超时，请检查网络或调整超时";
            if (cause instanceof java.net.UnknownHostException) return "无法解析服务域名，请检查地址";
            if (cause instanceof java.net.ConnectException) return "无法连接服务，请检查地址和网络";
            if (cause instanceof java.util.concurrent.CancellationException) return "本次调用已取消";
        }
        // Remote exception messages can include response bodies and authorization headers.
        return "连接或调用失败，请检查服务鉴权、网络和工具参数";
    }
}
