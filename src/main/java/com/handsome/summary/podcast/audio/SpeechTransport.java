package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.util.Map;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SpeechTransport {
    Mono<JsonNode> post(URI uri, Map<String, String> headers, Object body);
    Mono<byte[]> download(URI uri);
    Flux<Event> events(URI uri, Map<String, String> headers, Object body);
    record Event(String event, JsonNode data) { }
}
