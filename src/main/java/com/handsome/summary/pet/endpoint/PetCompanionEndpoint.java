package com.handsome.summary.pet.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.pet.extension.PetCompanion;
import com.handsome.summary.pet.model.PetdexCatalogResponse;
import com.handsome.summary.pet.model.SavePetCompanionCommand;
import com.handsome.summary.pet.service.PetCompanionService;
import com.handsome.summary.pet.service.PetdexCatalogService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Slf4j
@Component
@RequiredArgsConstructor
public class PetCompanionEndpoint implements CustomEndpoint {

    private final PetCompanionService petCompanionService;
    private final PetdexCatalogService petdexCatalogService;

    public record PetCompanionResponse(List<PetCompanion> items) {
    }

    public record SavePetCompanionRequest(
        String name,
        String displayName,
        String description,
        String source,
        String petdexId,
        String installCommand,
        String installScriptUrl,
        String petJsonUrl,
        String spritesheetUrl,
        Boolean enabled,
        Boolean active
    ) {
        SavePetCompanionCommand toCommand() {
            return new SavePetCompanionCommand(name, displayName, description, source, petdexId,
                installCommand, installScriptUrl, petJsonUrl, spritesheetUrl, enabled, active);
        }
    }

    public record ImportPetCompanionRequest(
        String command,
        Boolean enabled,
        Boolean active
    ) {
    }

    public record UpdatePetStatusRequest(Boolean enabled) {
    }

    public record MutationResponse(boolean success, String message) {
    }

    public record ErrorResponse(boolean success, String message) {
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/PetCompanion";

        return SpringdocRouteBuilder.route()
            .GET("petCompanions", this::listPets,
                builder -> builder.operationId("ListPetCompanions")
                    .tag(tag)
                    .description("List configured floating assistant pets.")
                    .response(responseBuilder().implementation(PetCompanionResponse.class))
            )
            .POST("petCompanions", this::savePet,
                builder -> builder.operationId("SavePetCompanion")
                    .tag(tag)
                    .description("Create or update a floating assistant pet.")
                    .response(responseBuilder().implementation(PetCompanion.class))
            )
            .POST("petCompanions/import", this::importPet,
                builder -> builder.operationId("ImportPetCompanion")
                    .tag(tag)
                    .description("Import a PetDex pet from an install command without executing shell scripts.")
                    .response(responseBuilder().implementation(PetCompanion.class))
            )
            .GET("petCompanions/petdex", this::listPetdexCatalog,
                builder -> builder.operationId("ListPetdexCatalog")
                    .tag(tag)
                    .description("List approved pets from the PetDex manifest.")
                    .response(responseBuilder().implementation(PetdexCatalogResponse.class))
            )
            .POST("petCompanions/{name}/active", this::setActive,
                builder -> builder.operationId("SetActivePetCompanion")
                    .tag(tag)
                    .description("Set a pet as the active floating assistant pet.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(PetCompanion.class))
            )
            .POST("petCompanions/{name}/status", this::updateStatus,
                builder -> builder.operationId("UpdatePetCompanionStatus")
                    .tag(tag)
                    .description("Enable or disable a pet.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(PetCompanion.class))
            )
            .DELETE("petCompanions/{name}", this::deletePet,
                builder -> builder.operationId("DeletePetCompanion")
                    .tag(tag)
                    .description("Delete a floating assistant pet.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(MutationResponse.class))
            )
            .build();
    }

    private Mono<ServerResponse> listPets(ServerRequest request) {
        return petCompanionService.list()
            .collectList()
            .map(PetCompanionResponse::new)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> savePet(ServerRequest request) {
        return request.bodyToMono(SavePetCompanionRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Pet companion request body is required")))
            .flatMap(body -> petCompanionService.save(body.toCommand()))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> importPet(ServerRequest request) {
        return request.bodyToMono(ImportPetCompanionRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "PetDex import request body is required")))
            .flatMap(body -> petCompanionService.importFromPetdex(body.command(), body.enabled(),
                body.active()))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> listPetdexCatalog(ServerRequest request) {
        return petdexCatalogService.list()
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> setActive(ServerRequest request) {
        return petCompanionService.setActive(request.pathVariable("name"))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> updateStatus(ServerRequest request) {
        return request.bodyToMono(UpdatePetStatusRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Pet status request body is required")))
            .flatMap(body -> petCompanionService.updateStatus(request.pathVariable("name"),
                body.enabled()))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> deletePet(ServerRequest request) {
        return petCompanionService.delete(request.pathVariable("name"))
            .then(ok(new MutationResponse(true, "宠物已删除")))
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> ok(Object body) {
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body);
    }

    private Mono<ServerResponse> errorResponse(Throwable error) {
        if (error instanceof ResponseStatusException responseStatusException) {
            return ServerResponse.status(responseStatusException.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new ErrorResponse(false, responseStatusException.getReason()));
        }
        log.error("Pet companion endpoint failed", error);
        return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new ErrorResponse(false, error.getMessage()));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
