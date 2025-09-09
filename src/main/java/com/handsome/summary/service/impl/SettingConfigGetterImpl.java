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
    public Mono<StyleConfig> getStyleConfig() {
        return settingFetcher.fetch(StyleConfig.GROUP, StyleConfig.class)
            .defaultIfEmpty(new StyleConfig());
    }

    @Override
    public Mono<TagsConfig> getTagsConfig() {
        return settingFetcher.fetch(TagsConfig.GROUP, TagsConfig.class)
            .defaultIfEmpty(new TagsConfig());
    }

    @Override
    public Mono<AssistantConfig> getAssistantConfig() {
        return settingFetcher.fetch(AssistantConfig.GROUP, AssistantConfig.class)
            .defaultIfEmpty(new AssistantConfig());
    }

    @Override
    public Mono<PolishConfig> getPolishConfig() {
        return settingFetcher.fetch(PolishConfig.GROUP, PolishConfig.class)
            .defaultIfEmpty(new PolishConfig());
    }

    @Override
    public Mono<GenerateConfig> getGenerateConfig() {
        return settingFetcher.fetch(GenerateConfig.GROUP, GenerateConfig.class)
            .defaultIfEmpty(new GenerateConfig());
    }

    @Override
    public Mono<TitleConfig> getTitleConfig() {
        return settingFetcher.fetch(TitleConfig.GROUP, TitleConfig.class)
            .defaultIfEmpty(new TitleConfig());
    }

    @Override
    public Mono<AiConfigResult> getAiConfigForFunction(String functionType) {
        return Mono.zip(
            getBasicConfig(),
            getFunctionSpecificConfig(functionType)
        ).map(tuple -> {
            BasicConfig basicConfig = tuple.getT1();
            FunctionSpecificAiInfo functionInfo = tuple.getT2();
            
            String aiType = determineAiType(functionInfo.aiType(), basicConfig.getGlobalAiType());
            
            // 根据AI类型获取对应的配置信息
            AiConfigResult result = new AiConfigResult();
            result.setAiType(aiType);
            result.setSystemPrompt(functionInfo.systemPrompt());
            
            populateAiConfig(result, aiType, basicConfig.getAiModelConfig());
            
            return result;
        });
    }
    
    /**
     * 获取功能特定的AI配置信息
     */
    private Mono<FunctionSpecificAiInfo> getFunctionSpecificConfig(String functionType) {
        return switch (functionType.toLowerCase()) {
            case "summary" -> getSummaryConfig().map(config -> 
                new FunctionSpecificAiInfo(config.getSummaryAiType(), config.getSummarySystemPrompt()));
            case "tags" -> getTagsConfig().map(config -> 
                new FunctionSpecificAiInfo(config.getTagAiType(), config.getTagGenerationPrompt()));
            case "conversation", "assistant" -> getAssistantConfig().map(config -> 
                new FunctionSpecificAiInfo(config.getAssistantAiType(), config.getConversationSystemPrompt()));
            case "polish" -> getPolishConfig().map(config -> 
                new FunctionSpecificAiInfo(config.getPolishAiType(), config.getPolishSystemPrompt()));
            case "generate" -> getGenerateConfig().map(config -> 
                new FunctionSpecificAiInfo(config.getGenerateAiType(), config.getGenerateSystemPrompt()));
            case "title" -> getTitleConfig().map(config -> 
                new FunctionSpecificAiInfo(config.getTitleAiType(), config.getTitleSystemPrompt()));
            default -> Mono.just(new FunctionSpecificAiInfo(null, null));
        };
    }
    
    /**
     * 确定最终使用的AI类型
     */
    private String determineAiType(String functionAiType, String globalAiType) {
        if (StringUtils.hasText(functionAiType)) {
            return functionAiType;
        }
        if (StringUtils.hasText(globalAiType)) {
            return globalAiType;
        }
        return "openAi"; // 默认值
    }
    
    /**
     * 根据AI类型填充具体的AI配置信息
     */
    private void populateAiConfig(AiConfigResult result, String aiType, AiModelConfig modelConfig) {
        if (modelConfig == null) {
            return;
        }
        
        switch (aiType) {
            case "openAi" -> {
                if (modelConfig.getOpenAiConfig() != null) {
                    var openAiConfig = modelConfig.getOpenAiConfig();
                    result.setApiKey(openAiConfig.getApiKey());
                    result.setModelName(openAiConfig.getModelName());
                    result.setBaseUrl(openAiConfig.getBaseUrl());
                }
            }
            case "zhipuAi" -> {
                if (modelConfig.getZhipuAiConfig() != null) {
                    var zhipuAiConfig = modelConfig.getZhipuAiConfig();
                    result.setApiKey(zhipuAiConfig.getApiKey());
                    result.setModelName(zhipuAiConfig.getModelName());
                }
            }
            case "dashScope" -> {
                if (modelConfig.getDashScopeConfig() != null) {
                    var dashScopeConfig = modelConfig.getDashScopeConfig();
                    result.setApiKey(dashScopeConfig.getApiKey());
                    result.setModelName(dashScopeConfig.getModelName());
                }
            }
            case "codesphere" -> {
                if (modelConfig.getCodesphereConfig() != null) {
                    var codesphereConfig = modelConfig.getCodesphereConfig();
                    result.setApiKey(codesphereConfig.getApiKey());
                    result.setModelName(codesphereConfig.getModelName());
                }
            }
            case "siliconFlow" -> {
                if (modelConfig.getSiliconFlowConfig() != null) {
                    var siliconFlowConfig = modelConfig.getSiliconFlowConfig();
                    result.setApiKey(siliconFlowConfig.getApiKey());
                    result.setModelName(siliconFlowConfig.getModelName());
                    result.setBaseUrl(siliconFlowConfig.getBaseUrl());
                }
            }
        }
    }
    
    @Override
    public String getTitleAiType() {
        return getTitleConfig()
            .map(TitleConfig::getTitleAiType)
            .block();
    }

    @Override
    public String getTitleSystemPrompt() {
        return getTitleConfig()
            .map(TitleConfig::getTitleSystemPrompt)
            .block();
    }
    
    /**
     * 功能特定的AI信息
     */
    private record FunctionSpecificAiInfo(String aiType, String systemPrompt) {}
}
