package com.handsome.summary.mcp.service;

import com.handsome.summary.mcp.model.McpSettings.Server;
import java.net.InetAddress;
import java.net.URI;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class McpServerValidator {
    private static final Set<String> RESERVED_HEADERS = Set.of("host", "connection",
        "content-length", "content-type", "accept", "mcp-session-id", "mcp-protocol-version",
        "authorization", "cookie", "proxy-authorization");

    public URI validate(Server server) {
        var uri = validateConfiguration(server);
        validateAddress(uri, Boolean.TRUE.equals(server.allowPrivateNetwork()));
        return uri;
    }

    public URI validateConfiguration(Server server) {
        if (server == null || server.id() == null || !server.id().matches("[a-z0-9-]{1,40}")) {
            throw new IllegalArgumentException("服务标识仅支持小写字母、数字和短横线，最多 40 位");
        }
        URI uri;
        try {
            uri = URI.create(server.url() == null ? "" : server.url().strip());
        } catch (IllegalArgumentException error) {
            throw new IllegalArgumentException("请输入完整 MCP 服务地址");
        }
        if (!("https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) || uri.getHost() == null
            || uri.getUserInfo() != null || uri.getFragment() != null || uri.getQuery() != null) {
            throw new IllegalArgumentException("服务地址需为 HTTP(S) URL，鉴权请使用 Token 或请求头");
        }
        if (server.token() != null && (server.token().contains("\r") || server.token().contains("\n"))) {
            throw new IllegalArgumentException("Token 不能包含换行");
        }
        if (server.headers().size() > 20) {
            throw new IllegalArgumentException("自定义请求头最多 20 个");
        }
        for (var header : server.headers()) {
            if (header.name() == null || !header.name().matches("[A-Za-z0-9-]{1,80}")
                || RESERVED_HEADERS.contains(header.name().toLowerCase(Locale.ROOT))
                || header.value() == null || header.value().contains("\r") || header.value().contains("\n")) {
                throw new IllegalArgumentException("自定义请求头不合法或使用了保留名称");
            }
        }
        return uri;
    }

    public void validateAddress(URI uri, boolean allowPrivate) {
        try {
            for (var address : InetAddress.getAllByName(uri.getHost())) {
                var bytes = address.getAddress();
                // Link-local / metadata endpoints are never valid MCP destinations.
                if (address.isAnyLocalAddress() || address.isLinkLocalAddress() || address.isMulticastAddress()) {
                    throw new IllegalArgumentException("不支持此网络地址");
                }
                var privateAddress = address.isLoopbackAddress() || address.isSiteLocalAddress()
                    || (bytes.length == 16 && (bytes[0] & 0xfe) == 0xfc);
                if (!allowPrivate && privateAddress) {
                    throw new IllegalArgumentException("此服务位于内网，请显式启用允许内网地址");
                }
            }
        } catch (java.net.UnknownHostException error) {
            throw new IllegalArgumentException("无法解析 MCP 服务地址");
        }
    }
}
