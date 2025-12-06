package com.handsome.summary.service;

import lombok.Data;
import reactor.core.publisher.Mono;
import java.util.List;

public interface SettingConfigGetter {
    Mono<BasicConfig> getBasicConfig();
    Mono<SummaryConfig> getSummaryConfig();
    Mono<StyleConfig> getStyleConfig();
    Mono<TagsConfig> getTagsConfig();
    Mono<AssistantConfig> getAssistantConfig();
    Mono<PolishConfig> getPolishConfig();
    Mono<GenerateConfig> getGenerateConfig();
    Mono<TitleConfig> getTitleConfig();
    
    /**
     * 通用AI获取方法 - 根据功能类型获取对应的AI配置
     */
    Mono<AiConfigResult> getAiConfigForFunction(String functionType);
    
    /**
     * 快速获取标题生成AI类型
     */
    String getTitleAiType();
    
    /**
     * 快速获取标题生成系统提示词
     */
    String getTitleSystemPrompt();

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
        private SiliconFlowConfig siliconFlowConfig;
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
    class SiliconFlowConfig {
        private String apiKey;
        private String modelName;
        private String baseUrl;
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
        private Boolean enableUiInjection;  // 是否注入前端UI（CSS/JS/DOM）
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
        private Boolean enableAssistant;
        private String assistantAiType;
        private String assistantIcon;
        private String conversationIcon;
        private String conversationSystemPrompt;
        private String assistantName;
        private String inputPlaceholder;
        private String dialogType;
        private String buttonPosition;
        private List<String> suggestions;
    }
    
    @Data
    class PolishConfig {
        public static final String GROUP = "polish";
        private String polishAiType;
        private String polishSystemPrompt;
        private Integer polishMaxLength;
    }
    
    @Data
    class GenerateConfig {
        public static final String GROUP = "generate";
        private String generateAiType;
        private String generateSystemPrompt;
    }
    
    @Data
    class TitleConfig {
        public static final String GROUP = "title";
        private String titleAiType;
        private String titleSystemPrompt;
        private Integer titleDefaultCount;
    }
}
