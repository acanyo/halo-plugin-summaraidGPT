package com.handsome.summary.pet.support;

import com.handsome.summary.pet.model.PetdexCatalogItem;
import com.handsome.summary.pet.model.PetdexCatalogResponse;
import com.handsome.summary.service.SettingConfigGetter;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class PetdexProxyUrlResolver {

    private static final String RAW_URL_PLACEHOLDER = "{url}";
    private static final String ENCODED_URL_PLACEHOLDER = "{encodedUrl}";
    private static final String PATH_PLACEHOLDER = "{path}";
    private static final URI TEMPLATE_PROBE_URI =
        URI.create("https://assets.petdex.dev/pets/probe/sprite.webp");

    private final SettingConfigGetter settingConfigGetter;

    public Mono<URI> requestUri(URI upstreamUri) {
        return settingConfigGetter.getAssistantConfig()
            .map(SettingConfigGetter.AssistantConfig::getPetdexProxyBaseUrl)
            .map(proxyBaseUrl -> URI.create(publicUrl(upstreamUri.toString(), proxyBaseUrl)))
            .onErrorReturn(upstreamUri);
    }

    public Mono<PetdexCatalogResponse> publicCatalog(PetdexCatalogResponse response) {
        if (response == null) {
            return Mono.empty();
        }
        if (response.items() == null || response.items().isEmpty()) {
            return Mono.just(response);
        }
        return settingConfigGetter.getAssistantConfig()
            .map(SettingConfigGetter.AssistantConfig::getPetdexProxyBaseUrl)
            .map(proxyBaseUrl -> new PetdexCatalogResponse(
                response.generatedAt(),
                response.total(),
                response.items().stream()
                    .map(item -> publicCatalogItem(item, proxyBaseUrl))
                    .toList()
            ))
            .defaultIfEmpty(response)
            .onErrorReturn(response);
    }

    public String publicUrl(String sourceUrl, SettingConfigGetter.AssistantConfig assistantConfig) {
        var proxyBaseUrl = assistantConfig == null ? null : assistantConfig.getPetdexProxyBaseUrl();
        return publicUrl(sourceUrl, proxyBaseUrl);
    }

    public String publicUrl(String sourceUrl, String proxyBaseUrl) {
        if (!StringUtils.hasText(sourceUrl)) {
            return sourceUrl;
        }
        var source = sourceUrl.strip();
        if (!isPetdexUrl(source)) {
            return source;
        }
        try {
            var template = normalizeProxyBaseUrl(proxyBaseUrl);
            if (!StringUtils.hasText(template)) {
                return source;
            }
            return applyTemplate(template, URI.create(source).normalize());
        } catch (Exception e) {
            return source;
        }
    }

    private PetdexCatalogItem publicCatalogItem(PetdexCatalogItem item, String proxyBaseUrl) {
        return new PetdexCatalogItem(
            item.slug(),
            item.displayName(),
            item.kind(),
            item.submittedBy(),
            item.installScriptUrl(),
            item.spritesheetUrl(),
            item.petJsonUrl(),
            item.zipUrl(),
            publicUrl(item.installScriptUrl(), proxyBaseUrl),
            publicUrl(item.spritesheetUrl(), proxyBaseUrl),
            publicUrl(item.petJsonUrl(), proxyBaseUrl),
            publicUrl(item.zipUrl(), proxyBaseUrl)
        );
    }

    private String normalizeProxyBaseUrl(String proxyBaseUrl) {
        if (!StringUtils.hasText(proxyBaseUrl)) {
            return null;
        }
        var value = proxyBaseUrl.strip();
        if (!value.regionMatches(true, 0, "http://", 0, "http://".length())
            && !value.regionMatches(true, 0, "https://", 0, "https://".length())) {
            value = "https://" + value;
        }

        var probe = applyTemplate(value, TEMPLATE_PROBE_URI);
        var uri = URI.create(probe).normalize();
        if (!("http".equalsIgnoreCase(uri.getScheme())
            || "https".equalsIgnoreCase(uri.getScheme()))
            || uri.getHost() == null
            || uri.getRawUserInfo() != null) {
            return null;
        }
        return value;
    }

    private String applyTemplate(String template, URI sourceUri) {
        var sourceUrl = sourceUri.toString();
        var value = template
            .replace(ENCODED_URL_PLACEHOLDER, encode(sourceUrl))
            .replace(RAW_URL_PLACEHOLDER, sourceUrl)
            .replace(PATH_PLACEHOLDER, rawPathAndQuery(sourceUri));
        if (!value.equals(template)) {
            return value;
        }
        if (isOriginProxy(template)) {
            return replaceOrigin(template, sourceUri);
        }
        return appendSourceUrl(template, sourceUrl);
    }

    private boolean isOriginProxy(String template) {
        try {
            var uri = URI.create(template);
            return !StringUtils.hasText(uri.getRawQuery())
                && (!StringUtils.hasText(uri.getRawPath()) || "/".equals(uri.getRawPath()));
        } catch (Exception e) {
            return false;
        }
    }

    private String replaceOrigin(String template, URI sourceUri) {
        var proxyUri = URI.create(template);
        return proxyUri.getScheme() + "://" + proxyUri.getRawAuthority()
            + rawPathAndQuery(sourceUri);
    }

    private String appendSourceUrl(String template, String sourceUrl) {
        if (template.endsWith("/") || template.endsWith("=")
            || template.endsWith("?") || template.endsWith("&")
            || template.contains("?")) {
            return template + sourceUrl;
        }
        return template + "/" + sourceUrl;
    }

    private String rawPathAndQuery(URI sourceUri) {
        var rawPath = sourceUri.getRawPath();
        var value = StringUtils.hasText(rawPath) ? rawPath : "/";
        if (StringUtils.hasText(sourceUri.getRawQuery())) {
            value = value + "?" + sourceUri.getRawQuery();
        }
        return value;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private boolean isPetdexUrl(String sourceUrl) {
        try {
            var uri = URI.create(sourceUrl).normalize();
            return "https".equalsIgnoreCase(uri.getScheme())
                && uri.getRawUserInfo() == null
                && ("petdex.dev".equalsIgnoreCase(uri.getHost())
                    || "assets.petdex.dev".equalsIgnoreCase(uri.getHost()));
        } catch (Exception e) {
            return false;
        }
    }
}
