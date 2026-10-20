package com.handsome.summary.podcast.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.podcast.service.PodcastCredentialsService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Component
@RequiredArgsConstructor
public class PodcastCredentialsEndpoint implements CustomEndpoint {
    private final PodcastCredentialsService credentials;

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        return SpringdocRouteBuilder.route()
            .GET("podcastCredentials", request -> credentials.status().flatMap(value -> ServerResponse.ok().bodyValue(value)),
                b -> b.operationId("GetPodcastCredentialStatus").tag("PodcastCredentials").response(responseBuilder().implementation(Map.class)))
            .PUT("podcastCredentials", request -> request.bodyToMono(new ParameterizedTypeReference<Map<String, String>>() { })
                .flatMap(credentials::save).then(ServerResponse.noContent().build()),
                b -> b.operationId("SavePodcastCredentials").tag("PodcastCredentials"))
            .build().filter((request, next) -> next.handle(request).onErrorMap(IllegalArgumentException.class,
                error -> new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage())));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("console.api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
