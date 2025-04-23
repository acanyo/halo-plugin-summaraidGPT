package com.handsome.summary.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import reactor.core.publisher.Mono;

public interface SettingConfigGetter {
    Mono<BasicConfig> getBasicConfig();
    Mono<ChatConfig> getChatConfig();


    @Data
    class BasicConfig {
        public static final String GROUP = "basic";
        private String modelType;
        private String qianfanClientId;
        private String clientSecret;
        private String qianfanModelName;
        private String openAiApiKey;
        private String openAiModelName;
        private String openAiUrl;
        private String zhipuAiApiKey;
        private String zhipuAiModelName;
        private String dashScopeApiKey;
        private String dashScopeModelName;
        private String geminiApiKey;
        private String geminiModelName;
        private String aiSystem;
    }
    @Data
    class ChatConfig {
        public static final String GROUP = "summary";
        private Boolean enableSummary;
        private String enableTemplate;
        private String postSelector;
        private String title;
        private String summaryStyle;
        private String postURL;
        private String blacklist;
        private String customizeIco;
        private String source;
        private String darkModeSelector;
        private String summaryTheme;
        private String postSummary;
    }
}
