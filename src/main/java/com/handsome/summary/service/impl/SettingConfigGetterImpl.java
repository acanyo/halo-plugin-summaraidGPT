package com.handsome.summary.service.impl;

import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Slf4j
@Component
@RequiredArgsConstructor
public class SettingConfigGetterImpl implements SettingConfigGetter {
    private final ReactiveSettingFetcher settingFetcher;

    @Override
    public Mono<BasicConfig> getBasicConfig() {
        return settingFetcher.fetch(BasicConfig.GROUP, BasicConfig.class)
            .defaultIfEmpty(new BasicConfig());
    }

    @Override
    public Mono<SummaryConfig> getSummaryConfig() {
        return settingFetcher.fetch(SummaryConfig.GROUP, SummaryConfig.class)
            .defaultIfEmpty(new SummaryConfig());
    }

    @Override
    public Mono<ArticleReadingConfig> getArticleReadingConfig() {
        return settingFetcher.fetch(ArticleReadingConfig.GROUP, ArticleReadingConfig.class)
            .defaultIfEmpty(new ArticleReadingConfig());
    }

    @Override
    public Mono<StyleConfig> getStyleConfig() {
        return settingFetcher.fetch(StyleConfig.GROUP, StyleConfig.class)
            .defaultIfEmpty(new StyleConfig());
    }

    @Override
    public Mono<RoleConfig> getRoleConfig() {
        return settingFetcher.fetch(RoleConfig.GROUP, RoleConfig.class)
            .defaultIfEmpty(new RoleConfig());
    }

    @Override
    public Mono<GenerationConfig> getGenerationConfig() {
        return getBasicConfig()
            .map(config -> config.getGenerationSetting() != null
                ? config.getGenerationSetting()
                : new GenerationConfig());
    }

    @Override
    public Mono<AssistantConfig> getAssistantConfig() {
        return settingFetcher.fetch(AssistantConfig.GROUP, AssistantConfig.class)
            .defaultIfEmpty(new AssistantConfig());
    }

    @Override
    public Mono<com.handsome.summary.agent.model.AgentSettings> getAgentSettings() {
        return settingFetcher.fetch("agent", com.handsome.summary.agent.model.AgentSettings.class)
            .defaultIfEmpty(com.handsome.summary.agent.model.AgentSettings.defaults());
    }

    @Override
    public Mono<AiSecurityConfig> getAiSecurityConfig() {
        return getBasicConfig()
            .map(config -> config.getAiSecuritySetting() != null
                ? config.getAiSecuritySetting()
                : new AiSecurityConfig());
    }

    @Override
    public Mono<RagConfig> getRagConfig() {
        return settingFetcher.fetch(RagConfig.GROUP, RagConfig.class)
            .defaultIfEmpty(new RagConfig());
    }

    @Override
    public Mono<AiConfigResult> getAiConfigForFunction(String functionType) {
        return Mono.zip(
            getBasicConfig(),
            getSystemPromptForFunction(functionType)
        ).map(tuple -> {
            BasicConfig basicConfig = tuple.getT1();
            String systemPrompt = tuple.getT2();

            AiConfigResult result = new AiConfigResult();
            result.setSystemPrompt(systemPrompt);

            var configuredModelName = getModelNameForFunction(basicConfig, functionType);
            if (StringUtils.hasText(configuredModelName)) {
                result.setModelName(configuredModelName);
            } else if (StringUtils.hasText(basicConfig.getLanguageModelName())) {
                result.setModelName(basicConfig.getLanguageModelName());
            }

            return result;
        });
    }
    
    private Mono<String> getSystemPromptForFunction(String functionType) {
        return getRoleConfig()
            .map(roleConfig -> promptOrDefault(rolePrompt(roleConfig, functionType), functionType));
    }

    private String getModelNameForFunction(BasicConfig basicConfig, String functionType) {
        return switch (normalizeFunctionType(functionType)) {
            case "summary", "articlereading", "reading" -> basicConfig.getSummaryModelName();
            case "tags" -> basicConfig.getTagModelName();
            case "conversation", "assistant" -> basicConfig.getAssistantModelName();
            case "agent" -> StringUtils.hasText(basicConfig.getAgentModelName())
                ? basicConfig.getAgentModelName()
                : basicConfig.getAssistantModelName();
            case "polish" -> basicConfig.getPolishModelName();
            case "generate" -> basicConfig.getGenerateModelName();
            case "title" -> basicConfig.getTitleModelName();
            case "rag" -> basicConfig.getRagLanguageModelName();
            default -> null;
        };
    }

    private String rolePrompt(RoleConfig roleConfig, String functionType) {
        return switch (normalizeFunctionType(functionType)) {
            case "summary" -> roleConfig.getSummarySystemPrompt();
            case "articlereading", "reading" -> roleConfig.getArticleReadingSystemPrompt();
            case "tags" -> roleConfig.getTagGenerationPrompt();
            case "conversation", "assistant" -> roleConfig.getConversationSystemPrompt();
            case "agent" -> roleConfig.getAgentSystemPrompt();
            case "polish" -> roleConfig.getPolishSystemPrompt();
            case "generate" -> roleConfig.getGenerateSystemPrompt();
            case "title" -> roleConfig.getTitleSystemPrompt();
            case "rag" -> roleConfig.getRagSystemPrompt();
            default -> null;
        };
    }

    private String promptOrDefault(String prompt, String functionType) {
        if (StringUtils.hasText(prompt)) {
            return prompt;
        }
        String defaultPrompt = rolePrompt(new RoleConfig(), functionType);
        return defaultPrompt != null ? defaultPrompt : "";
    }

    private String normalizeFunctionType(String functionType) {
        return StringUtils.hasText(functionType) ? functionType.toLowerCase() : "";
    }
}
