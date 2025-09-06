package com.handsome.summary.service;

import lombok.Data;
import reactor.core.publisher.Mono;

public interface SettingConfigGetter {
    Mono<BasicConfig> getBasicConfig();
    Mono<SummaryConfig> getSummaryConfig();
    Mono<StyleConfig> getStyleConfig();
    Mono<TagsConfig> getTagsConfig();
    Mono<AssistantConfig> getAssistantConfig();
    Mono<PolishConfig> getPolishConfig();
    
    /**
     * 通用AI获取方法 - 根据功能类型获取对应的AI配置
     */
    Mono<AiConfigResult> getAiConfigForFunction(String functionType);

    @Data
    class BasicConfig {
        public static final String GROUP = "basic";
        private String globalAiType;
        private AiModelConfig aiModelConfig;
    }
    
    @Data
    class AiModelConfig {
        private OpenAiConfig openAiConfig;
        private ZhipuAiConfig zhipuAiConfig;
        private DashScopeConfig dashScopeConfig;
        private CodesphereConfig codesphereConfig;
    }
    
    @Data
    class OpenAiConfig {
        private String apiKey;
        private String modelName;
        private String baseUrl;
    }
    
    @Data
    class ZhipuAiConfig {
        private String apiKey;
        private String modelName;
    }
    
    @Data
    class DashScopeConfig {
        private String apiKey;
        private String modelName;
    }
    
    @Data
    class CodesphereConfig {
        private String apiKey;
        private String modelName;
    }
    
    @Data
    class AiConfigResult {
        private String aiType;
        private String apiKey;
        private String modelName;
        private String baseUrl;
        private String systemPrompt;
    }

    @Data
    class SummaryConfig {
        public static final String GROUP = "summary";
        private String summaryAiType;
        private String summarySystemPrompt;
        private Boolean enable;
        private String summaryTitle;
        private String gptName;
        private String darkSelector;
        private Integer typeSpeed;
        private Boolean typewriter;
    }

    @Data
    class StyleConfig {
        public static final String GROUP = "style";
        private String themeName;
        private String logo;
        private String themeBg;
        private String themeMain;
        private String themeTitle;
        private String themeContent;
        private String themeGptName;
        private String themeContentBg;
        private String themeBorder;
        private String themeShadow;
        private String themeTagBg;
        private String themeTagColor;
        private String themeCursor;
        private String themeContentFontSize;
    }

    @Data
    class TagsConfig {
        public static final String GROUP = "tags";
        private String tagAiType;
        private String tagGenerationPrompt;
        private Integer tagGenerationCount;
    }

    @Data
    class AssistantConfig {
        public static final String GROUP = "assistant";
        private String assistantAiType;
        private String assistantIcon;
        private String conversationSystemPrompt;
        private String assistantName;
        private String inputPlaceholder;
        private String dialogType;
        private String buttonPosition;
    }
    
    @Data
    class PolishConfig {
        public static final String GROUP = "polish";
        private String polishAiType;
        private String polishSystemPrompt;
        private Integer polishMaxLength;
        private Boolean polishPreserveParagraphs;
    }
}
