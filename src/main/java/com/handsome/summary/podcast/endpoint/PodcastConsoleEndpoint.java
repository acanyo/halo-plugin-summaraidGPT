package com.handsome.summary.podcast.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.podcast.extension.ArticlePodcast;
import com.handsome.summary.podcast.service.PodcastService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.util.List;
import lombok.RequiredArgsConstructor;
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

@Component
@RequiredArgsConstructor
public class PodcastConsoleEndpoint implements CustomEndpoint {
    private final PodcastService service;
    public record ScriptRequest(String postName, Integer durationMinutes, String style) { }
    public record SaveRequest(List<ArticlePodcast.Turn> turns) { }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        var tag = "PodcastConsole";
        return SpringdocRouteBuilder.route()
            .GET("podcastCapabilities", r -> result(service.capabilities()), b -> b.operationId("GetPodcastCapabilities").tag(tag)
                .response(responseBuilder().implementation(PodcastService.Capabilities.class)))
            .GET("podcastEpisodes/{postName}", r -> result(service.get(r.pathVariable("postName")))
                .onErrorResume(ResponseStatusException.class, error -> error.getStatusCode().value() == 404
                    ? ServerResponse.noContent().build() : Mono.error(error)), b -> b.operationId("GetPodcastEpisode").tag(tag)
                .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true).implementation(String.class))
                .response(responseBuilder().implementation(PodcastService.EpisodeView.class)))
            .POST("podcastScripts", this::script, b -> b.operationId("GeneratePodcastScript").tag(tag)
                .response(responseBuilder().implementation(ArticlePodcast.class)))
            .PUT("podcastEpisodes/{postName}", this::save, b -> b.operationId("SavePodcastScript").tag(tag)
                .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true).implementation(String.class))
                .response(responseBuilder().implementation(ArticlePodcast.class)))
            .POST("podcastEpisodes/{postName}/audio", r -> result(service.render(r.pathVariable("postName"))), b -> b.operationId("RenderPodcastAudio").tag(tag)
                .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true).implementation(String.class))
                .response(responseBuilder().implementation(ArticlePodcast.class)))
            .DELETE("podcastEpisodes/{postName}", r -> service.delete(r.pathVariable("postName")).then(ServerResponse.noContent().build()), b -> b.operationId("DeletePodcastEpisode").tag(tag)
                .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true).implementation(String.class)))
            .build().filter((request, next) -> next.handle(request).onErrorMap(IllegalArgumentException.class,
                error -> new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage())));
    }

    private Mono<ServerResponse> script(ServerRequest request) {
        return request.bodyToMono(ScriptRequest.class).switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "缺少生成参数")))
            .flatMap(body -> result(service.generateScript(required(body.postName()),
                body.durationMinutes() == null ? 2 : body.durationMinutes(), body.style() == null ? "casual" : body.style())));
    }

    private Mono<ServerResponse> save(ServerRequest request) {
        return request.bodyToMono(SaveRequest.class).flatMap(body -> result(service.saveScript(request.pathVariable("postName"), body.turns())));
    }

    private Mono<ServerResponse> result(Mono<?> body) {
        return body.flatMap(value -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(value))
            .onErrorMap(IllegalArgumentException.class, error -> new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage()));
    }

    private String required(String name) {
        if (name == null || name.isBlank() || name.length() > 255) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请选择文章");
        return name.strip();
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("console.api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
