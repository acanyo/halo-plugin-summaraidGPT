package com.handsome.summary.service.impl;

import com.handsome.summary.ai.ConditionalOnMissingHaloAiFoundation;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.function.Consumer;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@ConditionalOnMissingHaloAiFoundation
public class UnavailableAiFoundationAiService implements AiFoundationAiService {

    private static final String ERROR_MESSAGE = "AI Foundation 插件未安装或未启用，请先安装并启用 AI 基座插件";

    @Override
    public Mono<String> generateText(String prompt, SettingConfigGetter.AiConfigResult config) {
        return Mono.error(new IllegalStateException(ERROR_MESSAGE));
    }

    @Override
    public Mono<String> chat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config) {
        return Mono.error(new IllegalStateException(ERROR_MESSAGE));
    }

    @Override
    public void streamChat(String conversationHistory, String systemPrompt,
        SettingConfigGetter.AiConfigResult config, Consumer<String> onData, Runnable onComplete,
        Consumer<String> onError) {
        onError.accept(ERROR_MESSAGE);
    }
}
