package com.handsome.summary.pet.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.pet.model.PetdexImportResult;
import com.handsome.summary.pet.service.PetdexImportService;
import com.handsome.summary.pet.support.PetdexProxyUrlResolver;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Service
public class DefaultPetdexImportService implements PetdexImportService {

    private static final int MAX_INSTALL_SCRIPT_CHARS = 80_000;
    private static final int MAX_PET_JSON_CHARS = 32_000;
    private static final Pattern INSTALL_URL_PATTERN = Pattern.compile(
        "https://petdex\\.dev/install/[A-Za-z0-9][A-Za-z0-9._~/-]*");
    private static final Pattern PET_JSON_URL_PATTERN = Pattern.compile(
        "https://assets\\.petdex\\.dev/pets/[^'\"\\s]+/petjson\\.json");
    private static final Pattern SPRITE_URL_PATTERN = Pattern.compile(
        "https://assets\\.petdex\\.dev/pets/[^'\"\\s]+/sprite\\.webp");

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();
    private final PetdexProxyUrlResolver petdexProxyUrlResolver;

    public DefaultPetdexImportService(PetdexProxyUrlResolver petdexProxyUrlResolver) {
        this.petdexProxyUrlResolver = petdexProxyUrlResolver;
    }

    @Override
    public Mono<PetdexImportResult> resolve(String installCommand) {
        var installUri = extractInstallUri(installCommand);
        return fetchText(installUri, "text/x-shellscript,*/*", MAX_INSTALL_SCRIPT_CHARS)
            .flatMap(script -> {
                var petJsonUri = extractAssetUri(script, PET_JSON_URL_PATTERN, "petjson.json");
                var spriteUri = extractAssetUri(script, SPRITE_URL_PATTERN, "sprite.webp");
                return fetchText(petJsonUri, "application/json,*/*", MAX_PET_JSON_CHARS)
                    .map(petJson -> toResult(installUri, petJsonUri, spriteUri, petJson));
            });
    }

    private URI extractInstallUri(String value) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PetDex install command is required");
        }

        var text = value.strip();
        if (!text.startsWith("http") && text.matches("[A-Za-z0-9][A-Za-z0-9._~-]*")) {
            text = "https://petdex.dev/install/" + text;
        }

        var matcher = INSTALL_URL_PATTERN.matcher(text);
        if (!matcher.find()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PetDex install URLs like https://petdex.dev/install/iikun are supported");
        }

        return validateInstallUri(URI.create(matcher.group()));
    }

    private URI validateInstallUri(URI uri) {
        var normalized = uri.normalize();
        if (!"https".equalsIgnoreCase(normalized.getScheme())
            || !"petdex.dev".equalsIgnoreCase(normalized.getHost())
            || normalized.getRawUserInfo() != null
            || (normalized.getPort() != -1 && normalized.getPort() != 443)
            || !normalized.getPath().startsWith("/install/")
            || normalized.getPath().contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "PetDex install URL must be under https://petdex.dev/install/");
        }
        return normalized;
    }

    private URI extractAssetUri(String script, Pattern pattern, String assetName) {
        var matcher = pattern.matcher(script);
        if (!matcher.find()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "PetDex install script does not include " + assetName);
        }
        return validateAssetUri(URI.create(matcher.group()), assetName);
    }

    private URI validateAssetUri(URI uri, String assetName) {
        var normalized = uri.normalize();
        if (!"https".equalsIgnoreCase(normalized.getScheme())
            || !"assets.petdex.dev".equalsIgnoreCase(normalized.getHost())
            || normalized.getRawUserInfo() != null
            || (normalized.getPort() != -1 && normalized.getPort() != 443)
            || !normalized.getPath().startsWith("/pets/")
            || normalized.getPath().contains("..")
            || !normalized.getPath().endsWith("/" + assetName)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "PetDex asset URL is invalid");
        }
        return normalized;
    }

    private Mono<String> fetchText(URI uri, String accept, int maxChars) {
        return petdexProxyUrlResolver.requestUri(uri)
            .map(requestUri -> HttpRequest.newBuilder(requestUri)
                .timeout(Duration.ofSeconds(12))
                .header("Accept", accept)
                .header("User-Agent", "summaraidGPT-petdex-importer/1.0")
                .GET()
                .build())
            .flatMap(request -> Mono.fromFuture(httpClient.sendAsync(request,
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8))))
            .map(response -> {
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "PetDex request failed with HTTP " + response.statusCode());
                }
                var body = response.body();
                if (body.length() > maxChars) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "PetDex response is too large");
                }
                return body;
            });
    }

    private PetdexImportResult toResult(URI installUri, URI petJsonUri, URI spriteUri,
        String petJson) {
        try {
            var root = objectMapper.readTree(petJson);
            var petdexId = text(root, "id");
            var displayName = text(root, "displayName");
            var description = text(root, "description");
            var fallbackId = installUri.getPath().substring(installUri.getPath().lastIndexOf('/') + 1);
            var normalizedId = StringUtils.hasText(petdexId) ? petdexId : fallbackId;
            return new PetdexImportResult(
                normalizedId,
                StringUtils.hasText(displayName) ? displayName : normalizedId,
                description,
                installUri.toString(),
                petJsonUri.toString(),
                spriteUri.toString()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "PetDex pet.json cannot be parsed", e);
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
}
