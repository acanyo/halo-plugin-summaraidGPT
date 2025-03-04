package com.handsome.summary.handler.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.handsome.summary.annotation.AIProvider;
import com.handsome.summary.annotation.ConfigNote;
import com.handsome.summary.handler.AIHandler;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.List;

@Component
@EnableScheduling
@AllArgsConstructor
@AIProvider(
    value = "QIANFAN",
    configNotes = {
        @ConfigNote(key = "QFClientId", description = "API访问密钥"),
        @ConfigNote(key = "QFClientSecret", description = "API客户端密钥")
    }
)
public class QianFanHandler implements AIHandler {
    private final WebClient webClient;


    @Override
    public Mono<String> authenticate(JsonNode config) {
        return Mono.fromCallable(() -> {
            String apiKey = config.get("apiKey").asText();
            // 可以在此处添加额外的校验逻辑
            return new AuthInfo(
                "Bearer " + apiKey,
                Instant.MAX, // OpenAI的API Key永不过期
                Map.of("organization", config.get("organization").asText())
            );
        });
    }

    @Override
    public Mono<String> executeChat(String authToken) {
        return webClient.post()
            .uri("/v1/chat/completions")
            .headers(headers -> {
                headers.set("Authorization", authToken.token());
                authInfo.extraParams().forEach((k, v) ->
                    headers.add("OpenAI-" + k, v.toString()));
            })
            .bodyValue(Map.of(
                "model", request.model(),
                "messages", request.messages()
            ))
            .retrieve()
            .bodyToMono(String.class);
    }

    @Override
    public List<String> supportedModels() {
        return List.of("gpt-3.5-turbo", "gpt-4");
    }
}
