package com.handsome.summary.mcp.service;

import com.handsome.summary.mcp.model.McpSettings.Server;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/** Cache only tool catalogs. Tool calls and authorization are always resolved afresh. */
@Component
@RequiredArgsConstructor
public class McpDiscoveryService {
    public static final Duration CATALOG_TTL = Duration.ofMinutes(5);
    private final McpClientService clients;
    private final McpObservations observations;
    private final LinkedHashMap<String, Entry> entries = new LinkedHashMap<>();
    private final AtomicLong hits = new AtomicLong();

    public Mono<McpClientService.Discovery> discover(Server server) {
        return Mono.defer(() -> entry(server).catalog);
    }

    public Mono<McpClientService.Discovery> refresh(Server server) {
        synchronized (entries) { entries.remove(server.id()); }
        return discover(server);
    }

    public void invalidate() {
        synchronized (entries) { entries.clear(); }
    }

    public void reconcile(com.handsome.summary.mcp.model.McpSettings config) {
        synchronized (entries) {
            entries.entrySet().removeIf(item -> config.servers().stream()
                .noneMatch(server -> sameConnection(server, item.getValue().server)));
        }
    }

    private boolean sameConnection(Server left, Server right) {
        return java.util.Objects.equals(left.id(), right.id()) && java.util.Objects.equals(left.url(), right.url())
            && java.util.Objects.equals(left.token(), right.token()) && left.headers().equals(right.headers())
            && left.timeoutSeconds().equals(right.timeoutSeconds())
            && left.allowPrivateNetwork().equals(right.allowPrivateNetwork());
    }

    public record Status(String serverId, String state, Instant checkedAt, Instant expiresAt,
                         Long latencyMillis, Integer toolCount, String error) { }
    public record Snapshot(List<Status> services, long cacheHits, long ttlSeconds) { }

    public Snapshot status() {
        synchronized (entries) {
            return new Snapshot(entries.values().stream().map(entry -> entry.status).toList(),
                hits.get(), CATALOG_TTL.toSeconds());
        }
    }

    private Entry entry(Server server) {
        synchronized (entries) {
            var previous = entries.get(server.id());
            if (previous != null && sameConnection(previous.server, server)
                && Instant.now().isBefore(previous.expiresAt)) {
                hits.incrementAndGet();
                return previous;
            }
            var entry = new Entry(server);
            entry.catalog = Mono.defer(() -> {
                var start = Instant.now();
                entry.status = new Status(server.id(), "checking", start, entry.expiresAt, null, null, null);
                return clients.discover(server)
                    .doOnSuccess(result -> {
                        entry.status = new Status(server.id(), "ready", start, entry.expiresAt,
                            Duration.between(start, Instant.now()).toMillis(), result.tools().size(), null);
                        observations.record(server, "", "discovery", start, null);
                    })
                    .doOnError(error -> {
                        entry.expiresAt = Instant.now().plusSeconds(10);
                        entry.status = new Status(server.id(), "error", start, entry.expiresAt,
                            Duration.between(start, Instant.now()).toMillis(), null, McpObservations.reason(error));
                        observations.record(server, "", "discovery", start, error);
                    });
            }).cache();
            entries.put(server.id(), entry);
            while (entries.size() > 32) entries.remove(entries.keySet().iterator().next());
            return entry;
        }
    }

    private static class Entry {
        final Server server;
        volatile Instant expiresAt = Instant.now().plus(CATALOG_TTL);
        volatile Status status;
        Mono<McpClientService.Discovery> catalog;
        Entry(Server server) {
            this.server = server;
            status = new Status(server.id(), "idle", null, expiresAt, null, null, null);
        }
    }
}
