package com.handsome.summary.pet.service.impl;

import com.handsome.summary.pet.model.SavePetCompanionCommand;
import com.handsome.summary.pet.service.PetCompanionAssetStorageService;
import com.handsome.summary.pet.support.PetdexProxyUrlResolver;
import com.handsome.summary.service.SettingConfigGetter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.attachment.Attachment;
import run.halo.app.core.extension.service.AttachmentService;

@Service
@RequiredArgsConstructor
public class DefaultPetCompanionAssetStorageService implements PetCompanionAssetStorageService {

    private static final int MAX_SPRITE_BYTES = 12 * 1024 * 1024;
    private static final int MAX_PET_JSON_BYTES = 256 * 1024;
    private static final MediaType IMAGE_WEBP = MediaType.parseMediaType("image/webp");
    private static final MediaType PET_JSON = MediaType.APPLICATION_JSON;
    private static final DefaultDataBufferFactory DATA_BUFFER_FACTORY =
        DefaultDataBufferFactory.sharedInstance;

    private final SettingConfigGetter settingConfigGetter;
    private final PetdexProxyUrlResolver petdexProxyUrlResolver;
    private final AttachmentService attachmentService;
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    @Override
    public Mono<SavePetCompanionCommand> localizePetdexAssets(SavePetCompanionCommand command) {
        return settingConfigGetter.getAssistantConfig()
            .map(SettingConfigGetter.AssistantConfig::getPetdexAttachmentStorage)
            .defaultIfEmpty(new SettingConfigGetter.PetdexAttachmentStorageConfig())
            .onErrorReturn(new SettingConfigGetter.PetdexAttachmentStorageConfig())
            .flatMap(storageConfig -> localizePetdexAssets(command, storageConfig))
            .onErrorMap(this::toStorageException);
    }

    private Mono<SavePetCompanionCommand> localizePetdexAssets(
        SavePetCompanionCommand command,
        SettingConfigGetter.PetdexAttachmentStorageConfig storageConfig
    ) {
        if (command == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Pet companion command is required"));
        }
        if (!Boolean.TRUE.equals(storageConfig.getEnabled()) || !hasPetdexAsset(command)) {
            return Mono.just(command);
        }
        var policyName = requiredPolicyName(storageConfig.getPolicyName());
        var groupName = StringUtils.hasText(storageConfig.getGroupName())
            ? storageConfig.getGroupName().strip()
            : "";
        var petKey = petKey(command);

        var spriteUrl = localizeAsset(command.spritesheetUrl(), policyName, groupName,
            petKey + "-sprite.webp", IMAGE_WEBP, "/sprite.webp", MAX_SPRITE_BYTES);
        var petJsonUrl = localizeAsset(command.petJsonUrl(), policyName, groupName,
            petKey + "-petjson.json", PET_JSON, "/petjson.json", MAX_PET_JSON_BYTES);

        return Mono.zip(spriteUrl, petJsonUrl)
            .map(tuple -> new SavePetCompanionCommand(
                command.name(),
                command.displayName(),
                command.description(),
                command.source(),
                command.petdexId(),
                command.installCommand(),
                command.installScriptUrl(),
                blankToNull(tuple.getT2()),
                tuple.getT1(),
                command.enabled(),
                command.active()
            ));
    }

    private Mono<String> localizeAsset(
        String sourceUrl,
        String policyName,
        String groupName,
        String filename,
        MediaType mediaType,
        String expectedSuffix,
        int maxBytes
    ) {
        if (!StringUtils.hasText(sourceUrl) || !isPetdexAsset(sourceUrl, expectedSuffix)) {
            return Mono.just(StringUtils.hasText(sourceUrl) ? sourceUrl.strip() : "");
        }
        var sourceUri = URI.create(sourceUrl.strip()).normalize();
        return fetchBytes(sourceUri, maxBytes)
            .flatMap(bytes -> upload(policyName, groupName, filename, bytes, mediaType));
    }

    private Mono<byte[]> fetchBytes(URI sourceUri, int maxBytes) {
        return petdexProxyUrlResolver.requestUri(sourceUri)
            .map(requestUri -> HttpRequest.newBuilder(requestUri)
                .timeout(Duration.ofSeconds(20))
                .header("Accept", "*/*")
                .header("User-Agent", "summaraidGPT-petdex-attachment/1.0")
                .GET()
                .build())
            .flatMap(request -> Mono.fromFuture(httpClient.sendAsync(request,
                HttpResponse.BodyHandlers.ofByteArray())))
            .map(response -> {
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "PetDex asset download failed with HTTP " + response.statusCode());
                }
                var bytes = response.body();
                if (bytes.length > maxBytes) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "PetDex asset is too large");
                }
                return bytes;
            });
    }

    private Mono<String> upload(
        String policyName,
        String groupName,
        String filename,
        byte[] bytes,
        MediaType mediaType
    ) {
        Flux<DataBuffer> content = Flux.defer(() -> Flux.just(DATA_BUFFER_FACTORY.wrap(bytes)));
        return attachmentService.upload(policyName, groupName, filename, content, mediaType)
            .flatMap(this::permalink);
    }

    private Mono<String> permalink(Attachment attachment) {
        var status = attachment.getStatus();
        if (status != null && StringUtils.hasText(status.getPermalink())) {
            return Mono.just(status.getPermalink().strip());
        }
        return attachmentService.getPermalink(attachment)
            .map(URI::toString)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Halo attachment permalink is empty")));
    }

    private boolean hasPetdexAsset(SavePetCompanionCommand command) {
        return isPetdexAsset(command.spritesheetUrl(), "/sprite.webp")
            || isPetdexAsset(command.petJsonUrl(), "/petjson.json");
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

    private String requiredPolicyName(String policyName) {
        if (StringUtils.hasText(policyName)) {
            return policyName.strip();
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "请先在插件设置中选择 PetDex 附件库存储策略");
    }

    private String petKey(SavePetCompanionCommand command) {
        var key = firstText(command.petdexId(), command.name(), command.displayName(), "pet")
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9.-]", "-")
            .replaceAll("-+", "-")
            .replaceAll("(^-+|-+$)", "");
        return StringUtils.hasText(key) ? key : "pet";
    }

    private Throwable toStorageException(Throwable error) {
        if (error instanceof ResponseStatusException) {
            return error;
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY,
            "PetDex 资源保存到附件库失败：" + error.getMessage(), error);
    }

    private String firstText(String... values) {
        for (var value : values) {
            if (StringUtils.hasText(value)) {
                return value.strip();
            }
        }
        return "";
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.strip() : null;
    }
}
