package com.handsome.summary.service;

import java.util.function.Consumer;
import reactor.core.publisher.Mono;

/**
 * Text generation facade used by SummaraidGPT features.
 */
public interface AiFoundationAiService {

    Mono<String> generateText(String prompt, SettingConfigGetter.AiConfigResult config);

    Mono<String> chat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config);

    void streamChat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config, Consumer<String> onData, Runnable onComplete,
        Consumer<String> onError);
}
