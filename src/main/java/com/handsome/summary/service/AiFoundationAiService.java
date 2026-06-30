package com.handsome.summary.service;

import java.util.function.Consumer;

/**
 * Text generation facade used by SummaraidGPT features.
 */
public interface AiFoundationAiService {

    String generateText(String prompt, SettingConfigGetter.AiConfigResult config);

    String chat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config);

    void streamChat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config, Consumer<String> onData, Runnable onComplete,
        Consumer<String> onError);
}
