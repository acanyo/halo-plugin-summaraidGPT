package com.handsome.summary.service;

import lombok.Data;
import reactor.core.publisher.Mono;

public interface SettingConfigGetter {
    Mono<BasicConfig> getBasicConfig();


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
}
