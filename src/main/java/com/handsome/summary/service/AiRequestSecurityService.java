package com.handsome.summary.service;

import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.Principal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AiRequestSecurityService {

    private static final String LIMITER_PREFIX = "summaraidgpt-ai:";
    private static final String ANONYMOUS_USER = "anonymousUser";
    private static final Set<String> TRUSTED_FETCH_SITES = Set.of("same-origin", "same-site", "none");

    private final SettingConfigGetter settingConfigGetter;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    public Mono<Void> secure(ServerRequest request) {
        return settingConfigGetter.getAiSecurityConfig()
            .flatMap(security -> request.principal()
                .map(principal -> {
                    secure(request, security, principal);
                    return true;
                })
                .switchIfEmpty(Mono.fromCallable(() -> {
                    secure(request, security, null);
                    return true;
                })))
            .then();
    }

    public void dispose() {
        counters.clear();
    }

    private void secure(ServerRequest request, SettingConfigGetter.AiSecurityConfig security,
        Principal principal) {
        verifyHotlink(request, security);
        verifyRateLimit(request, security, principal);
    }

    private void verifyHotlink(ServerRequest request, SettingConfigGetter.AiSecurityConfig security) {
        if (!enabled(security.getAntiHotlinkEnabled(), true)) {
            return;
        }

        var fetchSite = request.headers().firstHeader("Sec-Fetch-Site");
        if (StringUtils.hasText(fetchSite)
            && !TRUSTED_FETCH_SITES.contains(fetchSite.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Cross-site AI requests are not allowed");
        }

        var sourceOrigin = requestOrigin(request);
        if (!StringUtils.hasText(sourceOrigin)) {
            if (enabled(security.getAllowMissingOrigin(), false)) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Missing request origin for AI request");
        }

        var allowedOrigins = new ArrayList<>(normalizedAllowedOrigins(security.getAllowedOrigins()));
        allowedOrigins.add(serverOrigin(request));
        var allowed = allowedOrigins.stream()
            .map(AiRequestSecurityService::normalizeOrigin)
            .filter(StringUtils::hasText)
            .anyMatch(origin -> origin.equalsIgnoreCase(sourceOrigin));
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "AI requests are only allowed from trusted site origins");
        }
    }

    private void verifyRateLimit(ServerRequest request, SettingConfigGetter.AiSecurityConfig security,
        Principal principal) {
        if (!enabled(security.getRateLimitEnabled(), true)) {
            return;
        }

        var requestLimit = normalizedRateLimitRequests(security.getRateLimitRequests());
        var windowSeconds = normalizedRateLimitWindowSeconds(security.getRateLimitWindowSeconds());
        var windowMillis = Duration.ofSeconds(windowSeconds).toMillis();
        var now = System.currentTimeMillis();
        var windowId = now / windowMillis;
        var limiterName = limiterName(request, principal, requestLimit, windowSeconds);
        var counter = counters.computeIfAbsent(limiterName, ignored -> new WindowCounter(windowId));

        synchronized (counter) {
            if (counter.windowId != windowId) {
                counter.windowId = windowId;
                counter.count = 0;
            }
            counter.lastAccessMillis = now;
            counter.count++;
            if (counter.count > requestLimit) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "AI request limit exceeded");
            }
        }

        cleanupCounters(now, windowMillis);
    }

    private String limiterName(ServerRequest request, Principal principal, int requestLimit,
        int windowSeconds) {
        var principalName = principal == null ? null : principal.getName();
        var identity = StringUtils.hasText(principalName) && !ANONYMOUS_USER.equals(principalName)
            ? "user:" + principalName
            : "ip:" + clientIp(request);
        return LIMITER_PREFIX + digest(identity + ":" + requestLimit + ":" + windowSeconds);
    }

    private void cleanupCounters(long now, long windowMillis) {
        if (counters.size() < 512) {
            return;
        }
        var ttl = Math.max(windowMillis * 2, Duration.ofMinutes(10).toMillis());
        counters.entrySet().removeIf(entry -> now - entry.getValue().lastAccessMillis > ttl);
    }

    private String requestOrigin(ServerRequest request) {
        var origin = normalizeOrigin(request.headers().firstHeader("Origin"));
        if (StringUtils.hasText(origin)) {
            return origin;
        }
        return normalizeOrigin(request.headers().firstHeader("Referer"));
    }

    private String serverOrigin(ServerRequest request) {
        var uri = request.uri();
        var scheme = firstForwardedValue(request.headers().firstHeader("X-Forwarded-Proto"));
        if (!StringUtils.hasText(scheme)) {
            scheme = uri.getScheme();
        }

        var host = firstForwardedValue(request.headers().firstHeader("X-Forwarded-Host"));
        if (!StringUtils.hasText(host)) {
            host = request.headers().firstHeader("Host");
        }
        if (!StringUtils.hasText(host)) {
            var port = uri.getPort();
            host = port > 0 ? uri.getHost() + ":" + port : uri.getHost();
        }

        return normalizeOrigin(scheme + "://" + host);
    }

    private String firstForwardedValue(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.split(",", 2)[0].trim();
    }

    private String clientIp(ServerRequest request) {
        return request.remoteAddress()
            .map(InetSocketAddress::getAddress)
            .map(address -> address == null ? null : address.getHostAddress())
            .filter(StringUtils::hasText)
            .orElse("unknown");
    }

    private static String normalizeOrigin(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            var uri = URI.create(value.trim());
            var scheme = uri.getScheme();
            var host = uri.getHost();
            if (!StringUtils.hasText(scheme) || !StringUtils.hasText(host)) {
                return null;
            }
            var normalized = scheme.toLowerCase() + "://" + host.toLowerCase();
            var port = uri.getPort();
            if (port > 0 && !isDefaultPort(scheme, port)) {
                normalized += ":" + port;
            }
            return normalized;
        } catch (Exception e) {
            return null;
        }
    }

    private static boolean isDefaultPort(String scheme, int port) {
        return ("http".equalsIgnoreCase(scheme) && port == 80)
            || ("https".equalsIgnoreCase(scheme) && port == 443);
    }

    private List<String> normalizedAllowedOrigins(Object allowedOrigins) {
        if (!(allowedOrigins instanceof List<?> values)) {
            return List.of();
        }
        return values.stream()
            .map(this::extractOrigin)
            .filter(StringUtils::hasText)
            .toList();
    }

    private String extractOrigin(Object value) {
        if (value instanceof String text) {
            return text;
        }
        if (value instanceof Map<?, ?> map) {
            var origin = map.get("origin");
            return origin == null ? null : origin.toString();
        }
        return null;
    }

    private int normalizedRateLimitRequests(Integer value) {
        if (value == null || value < 1 || value > 1000) {
            return 20;
        }
        return value;
    }

    private int normalizedRateLimitWindowSeconds(Integer value) {
        if (value == null || value < 10 || value > 86400) {
            return 60;
        }
        return value;
    }

    private boolean enabled(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }

    private String digest(String value) {
        try {
            var messageDigest = MessageDigest.getInstance("SHA-256");
            var hash = messageDigest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash).substring(0, 22);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to build AI request limiter key", e);
        }
    }

    private static final class WindowCounter {
        private long windowId;
        private int count;
        private long lastAccessMillis = System.currentTimeMillis();

        private WindowCounter(long windowId) {
            this.windowId = windowId;
        }
    }
}
