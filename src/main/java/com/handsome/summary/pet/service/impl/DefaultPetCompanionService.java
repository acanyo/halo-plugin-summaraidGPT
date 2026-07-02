package com.handsome.summary.pet.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.pet.extension.PetCompanion;
import com.handsome.summary.pet.model.SavePetCompanionCommand;
import com.handsome.summary.pet.service.PetCompanionAssetStorageService;
import com.handsome.summary.pet.service.PetCompanionService;
import com.handsome.summary.pet.service.PetdexImportService;
import com.handsome.summary.pet.support.DefaultPetCompanionAssets;
import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Service
@RequiredArgsConstructor
public class DefaultPetCompanionService implements PetCompanionService {

    private final ReactiveExtensionClient client;
    private final PetdexImportService petdexImportService;
    private final PetCompanionAssetStorageService petCompanionAssetStorageService;

    @Override
    public Flux<PetCompanion> list() {
        return ensureDefaultPet()
            .thenMany(client.listAll(PetCompanion.class, ListOptions.builder().build(), Sort.unsorted()))
            .sort(Comparator.comparing(this::displayName, String.CASE_INSENSITIVE_ORDER));
    }

    @Override
    public Mono<PetCompanion> getActive() {
        var options = ListOptions.builder()
            .fieldQuery(equal("spec.active", "true"))
            .build();
        return ensureDefaultPet()
            .thenMany(client.listAll(PetCompanion.class, options, Sort.unsorted()))
            .filter(this::renderable)
            .next();
    }

    @Override
    public Mono<PetCompanion> save(SavePetCompanionCommand command) {
        return petCompanionAssetStorageService.localizePetdexAssets(command)
            .flatMap(localizedCommand -> {
                var name = resourceName(localizedCommand);
                var spec = toSpec(localizedCommand);
                var active = Boolean.TRUE.equals(spec.getActive());
                var mutation = upsert(name, spec);
                return active ? deactivateAllExcept(name).then(mutation) : mutation;
            });
    }

    @Override
    public Mono<PetCompanion> importFromPetdex(String installCommand, Boolean enabled,
        Boolean active) {
        return petdexImportService.resolve(installCommand)
            .flatMap(result -> save(new SavePetCompanionCommand(
                null,
                result.displayName(),
                result.description(),
                "PETDEX",
                result.petdexId(),
                installCommand == null ? null : installCommand.strip(),
                result.installScriptUrl(),
                result.petJsonUrl(),
                result.spritesheetUrl(),
                enabled,
                active
            )));
    }

    @Override
    public Mono<PetCompanion> setActive(String name) {
        return client.fetch(PetCompanion.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Pet companion not found")))
            .flatMap(pet -> {
                var spec = requireSpec(pet);
                if (!StringUtils.hasText(spec.getSpritesheetUrl())) {
                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Pet companion spritesheet URL is required"));
                }
                spec.setEnabled(true);
                spec.setActive(true);
                touch(pet);
                return deactivateAllExcept(name).then(client.update(pet));
            });
    }

    @Override
    public Mono<PetCompanion> updateStatus(String name, Boolean enabled) {
        return client.fetch(PetCompanion.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Pet companion not found")))
            .flatMap(pet -> {
                var spec = requireSpec(pet);
                spec.setEnabled(enabled == null || enabled);
                if (!Boolean.TRUE.equals(spec.getEnabled())) {
                    spec.setActive(false);
                }
                touch(pet);
                return client.update(pet);
            });
    }

    @Override
    public Mono<Void> delete(String name) {
        return client.fetch(PetCompanion.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Pet companion not found")))
            .flatMap(client::delete)
            .then();
    }

    private Mono<PetCompanion> upsert(String name, PetCompanion.Spec spec) {
        return client.fetch(PetCompanion.class, name)
            .flatMap(existing -> {
                existing.setSpec(spec);
                touch(existing);
                return client.update(existing);
            })
            .switchIfEmpty(Mono.defer(() -> {
                var pet = new PetCompanion();
                var metadata = new Metadata();
                metadata.setName(name);
                pet.setMetadata(metadata);
                pet.setSpec(spec);
                var status = new PetCompanion.Status();
                status.setImportedAt(Instant.now());
                status.setUpdatedAt(Instant.now());
                pet.setStatus(status);
                return client.create(pet);
            }));
    }

    private Mono<Void> ensureDefaultPet() {
        return client.listAll(PetCompanion.class, ListOptions.builder().build(), Sort.unsorted())
            .hasElements()
            .flatMap(hasPets -> hasPets ? Mono.empty() : client.create(newDefaultPet()).then());
    }

    private PetCompanion newDefaultPet() {
        var pet = new PetCompanion();
        var metadata = new Metadata();
        metadata.setName(DefaultPetCompanionAssets.NAME);
        pet.setMetadata(metadata);
        pet.setSpec(DefaultPetCompanionAssets.newSpec(true));
        var status = new PetCompanion.Status();
        status.setImportedAt(Instant.now());
        status.setUpdatedAt(Instant.now());
        pet.setStatus(status);
        return pet;
    }

    private Mono<Void> deactivateAllExcept(String activeName) {
        return client.listAll(PetCompanion.class, ListOptions.builder().build(), Sort.unsorted())
            .filter(pet -> !activeName.equals(pet.getMetadata().getName()))
            .filter(pet -> pet.getSpec() != null && Boolean.TRUE.equals(pet.getSpec().getActive()))
            .flatMap(pet -> {
                pet.getSpec().setActive(false);
                touch(pet);
                return client.update(pet);
            })
            .then();
    }

    private PetCompanion.Spec toSpec(SavePetCompanionCommand command) {
        if (!StringUtils.hasText(command.spritesheetUrl())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "spritesheetUrl is required");
        }
        validateAssetUrl(command.spritesheetUrl(), "spritesheetUrl");
        if (StringUtils.hasText(command.petJsonUrl())) {
            validateAssetUrl(command.petJsonUrl(), "petJsonUrl");
        }
        if (StringUtils.hasText(command.installScriptUrl())) {
            validateHttpsUrl(command.installScriptUrl(), "installScriptUrl");
        }

        var spec = new PetCompanion.Spec();
        spec.setDisplayName(firstText(command.displayName(), command.petdexId(), command.name(), "Pet"));
        spec.setDescription(blankToNull(command.description()));
        spec.setSource(firstText(command.source(), "PETDEX").toUpperCase(Locale.ROOT));
        spec.setPetdexId(blankToNull(command.petdexId()));
        spec.setInstallCommand(blankToNull(command.installCommand()));
        spec.setInstallScriptUrl(blankToNull(command.installScriptUrl()));
        spec.setPetJsonUrl(blankToNull(command.petJsonUrl()));
        spec.setSpritesheetUrl(command.spritesheetUrl().strip());
        spec.setEnabled(command.enabled() == null || command.enabled());
        spec.setActive(Boolean.TRUE.equals(command.active()));
        if (Boolean.TRUE.equals(spec.getActive())) {
            spec.setEnabled(true);
        }
        return spec;
    }

    private PetCompanion.Spec requireSpec(PetCompanion pet) {
        if (pet.getSpec() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet companion spec is empty");
        }
        return pet.getSpec();
    }

    private void touch(PetCompanion pet) {
        var status = pet.getStatus() == null ? new PetCompanion.Status() : pet.getStatus();
        if (status.getImportedAt() == null) {
            status.setImportedAt(Instant.now());
        }
        status.setUpdatedAt(Instant.now());
        status.setErrorMessage(null);
        pet.setStatus(status);
    }

    private boolean renderable(PetCompanion pet) {
        return pet.getSpec() != null
            && Boolean.TRUE.equals(pet.getSpec().getActive())
            && Boolean.TRUE.equals(pet.getSpec().getEnabled())
            && StringUtils.hasText(pet.getSpec().getSpritesheetUrl());
    }

    private String resourceName(SavePetCompanionCommand command) {
        var base = firstText(command.name(), command.petdexId(), command.displayName(), "pet");
        var normalized = base.strip().toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9.-]", "-")
            .replaceAll("-+", "-")
            .replaceAll("(^-+|-+$)", "");
        if (!StringUtils.hasText(normalized)) {
            normalized = "pet-" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (!normalized.startsWith("pet-")) {
            normalized = "pet-" + normalized;
        }
        return normalized.length() > 253 ? normalized.substring(0, 253) : normalized;
    }

    private void validateHttpsUrl(String value, String field) {
        try {
            var uri = URI.create(value.strip()).normalize();
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                || uri.getRawUserInfo() != null || uri.getPath().contains("..")) {
                throw new IllegalArgumentException();
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " must be a valid HTTPS URL");
        }
    }

    private void validateAssetUrl(String value, String field) {
        if (isTrustedSiteAssetPath(value)) {
            return;
        }
        try {
            validateHttpsUrl(value, field);
        } catch (ResponseStatusException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                field + " must be a valid HTTPS URL or site asset path");
        }
    }

    private boolean isTrustedSiteAssetPath(String value) {
        try {
            var rawValue = value.strip();
            if (rawValue.contains("\\") || rawValue.contains("..")
                || rawValue.toLowerCase(Locale.ROOT).contains("%2e")) {
                return false;
            }
            var uri = URI.create(rawValue).normalize();
            if (uri.getRawFragment() != null || uri.getRawUserInfo() != null) {
                return false;
            }
            if (!uri.isAbsolute() && uri.getRawAuthority() != null) {
                return false;
            }
            if (uri.isAbsolute() && !("http".equalsIgnoreCase(uri.getScheme())
                || "https".equalsIgnoreCase(uri.getScheme()))) {
                return false;
            }
            if (uri.getRawAuthority() != null && uri.getHost() == null) {
                return false;
            }
            var path = uri.getRawPath();
            return path != null
                && (path.startsWith("/plugins/summaraidGPT/assets/static/")
                    || path.startsWith("plugins/summaraidGPT/assets/static/")
                    || path.startsWith("/upload/")
                    || path.startsWith("upload/")
                    || path.startsWith("/uploads/")
                    || path.startsWith("uploads/"));
        } catch (Exception e) {
            return false;
        }
    }

    private String displayName(PetCompanion pet) {
        return pet.getSpec() == null || !StringUtils.hasText(pet.getSpec().getDisplayName())
            ? pet.getMetadata().getName()
            : pet.getSpec().getDisplayName();
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
