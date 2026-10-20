package com.handsome.summary.podcast.service;

import com.handsome.summary.podcast.model.PodcastSettings;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.Secret;

@Service
@RequiredArgsConstructor
public class PodcastCredentialsService {
    static final String SECRET_NAME = "summaraidgpt-podcast-credentials";
    public static final String MASK = "********";
    private static final List<String> CHANNELS = List.of("bailian", "cosyvoice", "bailianMinimax", "minimax", "doubao");
    private final ReactiveExtensionClient client;

    public Mono<Map<String, String>> status() {
        return keys().map(keys -> {
            var status = new HashMap<String, String>();
            CHANNELS.forEach(channel -> status.put(channel, keys.containsKey(channel) ? MASK : ""));
            return status;
        });
    }

    public Mono<PodcastSettings> resolve(PodcastSettings settings) {
        return keys().map(keys -> {
            settings.getBailian().setApiKey(keys.get("bailian"));
            settings.getCosyvoice().setApiKey(keys.get("cosyvoice"));
            settings.getBailianMinimax().setApiKey(keys.get("bailianMinimax"));
            settings.getMinimax().setApiKey(keys.get("minimax"));
            settings.getDoubao().setApiKey(keys.get("doubao"));
            return settings;
        });
    }

    public Mono<Void> save(Map<String, String> updates) {
        if (updates == null || updates.keySet().stream().anyMatch(key -> !CHANNELS.contains(key) && !"bailianSource".equals(key))
            || updates.values().stream().anyMatch(value -> value == null || value.length() > 4096
                || value.strip().chars().anyMatch(character -> character <= 32 || character >= 127))
            || updates.containsKey("bailianSource") && !List.of("cosyvoice", "bailianMinimax").contains(updates.get("bailianSource"))) {
            return Mono.error(new IllegalArgumentException("语音密钥格式不正确"));
        }
        return client.fetch(Secret.class, SECRET_NAME).defaultIfEmpty(emptySecret())
            .flatMap(secret -> {
                var keys = decode(secret);
                var source = updates.get("bailianSource");
                if (source != null && MASK.equals(updates.get("bailian")) && keys.containsKey(source)) {
                    keys.put("bailian", keys.get(source));
                }
                updates.forEach((channel, value) -> {
                    if ("bailianSource".equals(channel)) return;
                    if (MASK.equals(value)) return;
                    if (value.isBlank()) keys.remove(channel);
                    else keys.put(channel, value.strip());
                });
                var data = new HashMap<String, byte[]>();
                keys.forEach((channel, value) -> data.put(channel, value.getBytes(StandardCharsets.UTF_8)));
                secret.setData(data);
                secret.setStringData(null);
                return secret.getMetadata().getVersion() == null ? client.create(secret) : client.update(secret);
            }).then();
    }

    private Mono<Map<String, String>> keys() {
        return client.fetch(Secret.class, SECRET_NAME).map(this::decode).defaultIfEmpty(Map.of());
    }

    private Map<String, String> decode(Secret secret) {
        var keys = new HashMap<String, String>();
        if (secret.getData() != null) secret.getData().forEach((key, bytes) -> keys.put(key, new String(bytes, StandardCharsets.UTF_8)));
        if (secret.getStringData() != null) keys.putAll(secret.getStringData());
        return keys;
    }

    private Secret emptySecret() {
        var secret = new Secret();
        secret.setMetadata(new Metadata());
        secret.getMetadata().setName(SECRET_NAME);
        secret.setType(Secret.SECRET_TYPE_OPAQUE);
        return secret;
    }
}
