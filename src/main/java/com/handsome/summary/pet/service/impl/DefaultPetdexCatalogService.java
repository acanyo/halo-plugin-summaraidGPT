package com.handsome.summary.pet.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.pet.model.PetdexCatalogItem;
import com.handsome.summary.pet.model.PetdexCatalogResponse;
import com.handsome.summary.pet.service.PetdexCatalogService;
import com.handsome.summary.pet.support.PetdexProxyUrlResolver;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Service
public class DefaultPetdexCatalogService implements PetdexCatalogService {

    private static final URI MANIFEST_URI = URI.create("https://petdex.dev/api/manifest");
    private static final int MAX_MANIFEST_CHARS = 4_000_000;
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();
    private final PetdexProxyUrlResolver petdexProxyUrlResolver;

    private volatile CacheEntry cacheEntry;

    public DefaultPetdexCatalogService(PetdexProxyUrlResolver petdexProxyUrlResolver) {
        this.petdexProxyUrlResolver = petdexProxyUrlResolver;
    }

    @Override
    public Mono<PetdexCatalogResponse> list() {
        var cache = cacheEntry;
        var catalog = cache != null && cache.isFresh()
            ? Mono.just(cache.response())
            : fetchManifest()
                .map(this::parseManifest)
                .doOnNext(response -> cacheEntry = new CacheEntry(response, Instant.now()));
        return catalog.flatMap(petdexProxyUrlResolver::publicCatalog);
    }

    private Mono<String> fetchManifest() {
        return petdexProxyUrlResolver.requestUri(MANIFEST_URI)
            .map(requestUri -> HttpRequest.newBuilder(requestUri)
                .timeout(Duration.ofSeconds(12))
                .header("Accept", "application/json,*/*")
                .header("User-Agent", "summaraidGPT-petdex-catalog/1.0")
                .GET()
                .build())
            .flatMap(request -> Mono.fromFuture(httpClient.sendAsync(request,
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8))))
            .map(response -> {
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "PetDex catalog request failed with HTTP " + response.statusCode());
                }
                var body = response.body();
                if (body.length() > MAX_MANIFEST_CHARS) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "PetDex catalog response is too large");
                }
                return body;
            });
    }

    private PetdexCatalogResponse parseManifest(String manifest) {
        try {
            var root = objectMapper.readTree(manifest);
            var items = new ArrayList<PetdexCatalogItem>();
            var pets = root.path("pets");
            if (pets.isArray()) {
                for (var pet : pets) {
                    toItem(pet).ifPresent(items::add);
                }
            }
            var generatedAt = text(root, "generatedAt");
            var total = root.path("total").asInt(items.size());
            return new PetdexCatalogResponse(generatedAt, total, items);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "PetDex catalog cannot be parsed", e);
        }
    }

    private java.util.Optional<PetdexCatalogItem> toItem(JsonNode node) {
        var slug = text(node, "slug");
        var displayName = text(node, "displayName");
        var spritesheetUrl = text(node, "spritesheetUrl");
        var petJsonUrl = text(node, "petJsonUrl");
        if (!StringUtils.hasText(slug)
            || !StringUtils.hasText(displayName)
            || !isPetdexAsset(spritesheetUrl, "/sprite.webp")
            || !isPetdexAsset(petJsonUrl, "/petjson.json")) {
            return java.util.Optional.empty();
        }
        var zipUrl = text(node, "zipUrl");
        if (StringUtils.hasText(zipUrl) && !isPetdexAsset(zipUrl, "/zip.zip")) {
            zipUrl = null;
        }
        var installSlug = URLEncoder.encode(slug, StandardCharsets.UTF_8);
        return java.util.Optional.of(new PetdexCatalogItem(
            slug,
            displayName,
            text(node, "kind"),
            text(node, "submittedBy"),
            "https://petdex.dev/install/" + installSlug,
            spritesheetUrl,
            petJsonUrl,
            zipUrl,
            "https://petdex.dev/install/" + installSlug,
            spritesheetUrl,
            petJsonUrl,
            zipUrl
        ));
    }

    private boolean isPetdexAsset(String value, String suffix) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        try {
            var uri = URI.create(value.strip()).normalize();
            return "https".equalsIgnoreCase(uri.getScheme())
                && "assets.petdex.dev".equalsIgnoreCase(uri.getHost())
                && uri.getRawUserInfo() == null
                && (uri.getPort() == -1 || uri.getPort() == 443)
                && uri.getPath().startsWith("/pets/")
                && !uri.getPath().contains("..")
                && uri.getPath().endsWith(suffix);
        } catch (Exception e) {
            return false;
        }
    }

    private String text(JsonNode root, String field) {
        var node = root == null ? null : root.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        var value = node.asText();
        return StringUtils.hasText(value) ? value.strip() : null;
    }

    private record CacheEntry(PetdexCatalogResponse response, Instant cachedAt) {

        boolean isFresh() {
            return cachedAt.plus(CACHE_TTL).isAfter(Instant.now());
        }
    }
}
