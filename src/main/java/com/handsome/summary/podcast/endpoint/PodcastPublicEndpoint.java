package com.handsome.summary.podcast.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.podcast.service.PodcastService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import lombok.RequiredArgsConstructor;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Component
@RequiredArgsConstructor
public class PodcastPublicEndpoint implements CustomEndpoint {
    private final PodcastService service;

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        return SpringdocRouteBuilder.route().GET("articlePodcasts/{postName}", request ->
            service.published(request.pathVariable("postName"))
                .flatMap(body -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                    .header("Cache-Control", "no-store").bodyValue(body)), b -> b
                .operationId("GetPublicArticlePodcast").tag("ArticlePodcast")
                .parameter(parameterBuilder().name("postName").in(ParameterIn.PATH).required(true).implementation(String.class))
                .response(responseBuilder().implementation(PodcastService.PublicPodcast.class))).build();
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
