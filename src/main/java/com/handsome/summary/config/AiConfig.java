package com.handsome.summary.config;

import dev.langchain4j.community.model.qianfan.QianfanChatModel;
import dev.langchain4j.community.model.zhipu.ZhipuAiChatModel;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Duration;

@Configuration
public class AiConfig {
    String apiKey = System.getenv("demo");
    @Bean
    public ChatLanguageModel openAiChatModel() {
        return OpenAiChatModel.builder()
            .baseUrl("http://langchain4j.dev/demo/openai/v1")
            .apiKey(apiKey)
            .modelName("gpt-4o-mini")
            .build();
    }

    // 智谱AI配置
    @Bean
    public ChatLanguageModel zhipuAiChatModel() {
        return ZhipuAiChatModel.builder()
            .apiKey("your-zhipu-key") // 手动设置密钥
            .temperature(0.8)
            .maxRetries(3)
            .build();
    }
    // 智谱AI配置
    @Bean
    public ChatLanguageModel qianfanChatModel() {
        return QianfanChatModel.builder()
            .apiKey("your-zhipu-key") // 手动设置密钥
            .modelName("glm-4") // 根据实际模型选择
            .temperature(0.8)
            .maxRetries(3)
            .build();
    }
}
