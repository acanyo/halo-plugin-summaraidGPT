package com.handsome.summary.service;

import lombok.Data;
import reactor.core.publisher.Mono;

public interface SettingConfigGetter {
    Mono<BasicConfig> getBasicConfig();
    Mono<SummaryConfig> getSummaryConfig();
    Mono<StyleConfig> getStyleConfig();
    Mono<TagsConfig> getTagsConfig();

    @Data
    class BasicConfig {
        public static final String GROUP = "basic";
        private Boolean enableAi;
        private String modelType;
        private String openAiApiKey;
        private String openAiModelName;
        private String baseUrl;
        private String zhipuAiApiKey;
        private String zhipuAiModelName;
        private String dashScopeApiKey;
        private String dashScopeModelName;
        private String aiSystem;
        // Codesphere 相关字段
        private String codesphereKey;
        private String codesphereType;
    }

    @Data
    class SummaryConfig {
        public static final String GROUP = "summary";
        private Boolean enable;
        private String summaryTitle;
        private String gptName;
        private String target;
        private String whitelist;
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
        private String tagGenerationPrompt;
        private Integer tagGenerationCount;
    }
}
