package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
public class HttpSpeechTransport implements SpeechTransport {
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15)).followRedirects(HttpClient.Redirect.NEVER).build();

    @Override
    public Mono<JsonNode> post(URI uri, Map<String, String> headers, Object body) {
        return Mono.fromCallable(() -> {
            try (var stream = open(uri, headers, body, false)) {
                var data = stream.readNBytes(PcmAudio.MAX_BYTES * 3 + 1);
                if (data.length > PcmAudio.MAX_BYTES * 3) throw new IllegalStateException("语音响应过大");
                JsonNode json;
                try {
                    json = mapper.readTree(data);
                    if (json == null || json.isMissingNode()) throw new IllegalArgumentException();
                } catch (Exception ignored) {
                    throw new IllegalStateException("语音服务未返回有效 JSON，请重新合成");
                }
                SpeechServiceErrors.checkResponse(json);
                return json;
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Mono<byte[]> download(URI uri) {
        return Mono.fromCallable(() -> {
            validateDownload(uri);
            try (var stream = open(uri, Map.of(), null, false)) {
                var bytes = stream.readNBytes(PcmAudio.MAX_BYTES + 1);
                PcmAudio.validate(bytes);
                return bytes;
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Flux<Event> events(URI uri, Map<String, String> headers, Object body) {
        return Flux.<Event, SpeechEventReader>using(
            () -> new SpeechEventReader(new InputStreamReader(open(uri, headers, body, true), StandardCharsets.UTF_8)),
            reader -> Flux.generate(sink -> {
                try {
                    var event = reader.next();
                    if (event == null) sink.complete();
                    else sink.next(event);
                } catch (Exception error) {
                    sink.error(error);
                }
            }), reader -> { try { reader.close(); } catch (Exception ignored) { } }
        ).subscribeOn(Schedulers.boundedElastic());
    }

    private InputStream open(URI uri, Map<String, String> headers, Object body, boolean stream) throws Exception {
        var builder = HttpRequest.newBuilder(uri).timeout(Duration.ofMinutes(5))
            .header("Accept", stream ? "text/event-stream" : "*/*");
        headers.forEach(builder::header);
        if (body == null) builder.GET();
        else builder.header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
        var response = client.send(builder.build(), HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            try (var responseBody = response.body()) {
                throw SpeechServiceErrors.fromHttp(response.statusCode(), responseBody);
            }
        }
        return response.body();
    }

    private void validateDownload(URI uri) throws Exception {
        var host = uri.getHost();
        if (host == null || !("https".equals(uri.getScheme()) || "http".equals(uri.getScheme()))
            || uri.getUserInfo() != null || (uri.getPort() != -1 && uri.getPort() != 443 && uri.getPort() != 80)
            || !host.endsWith(".aliyuncs.com")) {
            throw new IllegalArgumentException("语音服务返回了不受支持的音频地址");
        }
        for (var address : InetAddress.getAllByName(host)) {
            if (address.isAnyLocalAddress() || address.isLoopbackAddress()
                || address.isLinkLocalAddress() || address.isSiteLocalAddress() || address.isMulticastAddress()) {
                throw new IllegalArgumentException("音频地址不可指向本地网络");
            }
        }
    }
}
