package com.handsome.summary.glossary.service;

import com.handsome.summary.glossary.extension.ArticleGlossary;
import com.handsome.summary.service.SettingConfigGetter;
import jakarta.annotation.PreDestroy;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.Disposable;
import reactor.core.Disposables;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArticleGlossaryService {
    private final ReactiveExtensionClient client;
    private final GlossaryContentLoader loader;
    private final GlossaryGenerator generator;
    private final SettingConfigGetter settings;
    private final Map<String, Mono<ArticleGlossary>> inFlight = new ConcurrentHashMap<>();
    private final Map<String, Instant> retryAfter = new ConcurrentHashMap<>();
    private final Disposable.Composite background = Disposables.composite();
    private final Sinks.Empty<Void> shutdown = Sinks.empty();

    public Mono<ArticleGlossary> getExisting(String postName) {
        return loader.load(normalize(postName))
            .flatMap(source -> settings.getGlossaryConfig().flatMap(config ->
                client.fetch(ArticleGlossary.class, name(source.postName()))
                    .filter(glossary -> current(glossary, source, config.termLimit()))));
    }

    public Mono<ArticleGlossary> generate(String postName, boolean refresh) {
        var key = normalize(postName);
        return Mono.defer(() -> inFlight.computeIfAbsent(key, ignored ->
            Mono.zip(loader.load(key), settings.getGlossaryConfig())
                .flatMap(tuple -> {
                    var source = tuple.getT1();
                    int limit = tuple.getT2().termLimit();
                    return client.fetch(ArticleGlossary.class, name(key))
                        .filter(existing -> !refresh && current(existing, source, limit))
                        .switchIfEmpty(Mono.defer(() -> generateAndSave(source, limit)));
                })
                .doOnError(error -> retryAfter.put(key, Instant.now().plusSeconds(300)))
                .doOnSuccess(value -> retryAfter.remove(key))
                .takeUntilOther(shutdown.asMono())
                .doFinally(signal -> inFlight.remove(key))
                .cache()));
    }

    public void schedule(String postName) {
        if (retryAfter.getOrDefault(postName, Instant.MIN).isAfter(Instant.now())) return;
        if (retryAfter.size() > 1000) retryAfter.entrySet().removeIf(e -> e.getValue().isBefore(Instant.now()));
        // Remove completed subscriptions so repeated page visits do not accumulate handles.
        var handle = Disposables.swap();
        background.add(handle);
        handle.update(generate(postName, false).doFinally(signal -> background.remove(handle))
            .subscribe(value -> { }, error ->
                log.warn("热词注释生成失败，文章 {}: {}", postName, error.getMessage())));
    }

    private Mono<ArticleGlossary> generateAndSave(GlossaryContentLoader.Source source, int limit) {
        if (!StringUtils.hasText(source.content())) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "文章正文为空"));
        }
        return settings.getAiConfigForFunction("glossary")
            .flatMap(config -> generator.generate(source, config, limit).flatMap(terms -> {
                var spec = new ArticleGlossary.Spec();
                spec.setPostName(source.postName());
                spec.setPostTitle(source.title());
                spec.setContentHash(hash(source));
                spec.setMaxTerms(limit);
                spec.setModelName(config.getModelName());
                spec.setGeneratedAt(Instant.now());
                spec.setTerms(terms);
                return client.fetch(ArticleGlossary.class, name(source.postName()))
                    .flatMap(existing -> { existing.setSpec(spec); return client.update(existing); })
                    .switchIfEmpty(Mono.defer(() -> {
                        var glossary = new ArticleGlossary();
                        var metadata = new Metadata();
                        metadata.setName(name(source.postName()));
                        glossary.setMetadata(metadata);
                        glossary.setSpec(spec);
                        return client.create(glossary);
                    }));
            }));
    }

    private boolean current(ArticleGlossary glossary, GlossaryContentLoader.Source source, int limit) {
        return glossary.getSpec() != null && hash(source).equals(glossary.getSpec().getContentHash())
            && Integer.valueOf(limit).equals(glossary.getSpec().getMaxTerms());
    }

    static String name(String postName) { return "article-glossary-" + digest(postName).substring(0, 24); }
    private static String hash(GlossaryContentLoader.Source source) {
        return digest(source.title() + "\n" + source.content());
    }
    private static String digest(String text) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }
    private String normalize(String postName) {
        if (!StringUtils.hasText(postName) || postName.length() > 253) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文章名称无效");
        }
        return postName.strip();
    }

    @PreDestroy
    public void dispose() {
        shutdown.tryEmitEmpty();
        background.dispose();
        inFlight.clear();
        retryAfter.clear();
    }
}
