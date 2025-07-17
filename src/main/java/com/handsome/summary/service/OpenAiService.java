package com.handsome.summary.service;

import com.handsome.summary.service.SettingConfigGetter.BasicConfig;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

/**
 * OpenAi服务实现。
 * <p>
 * 负责与OpenAi官方API对接，生成摘要内容。
 * 配置项：API Key、模型名、BaseUrl均通过BasicConfig注入。
 * 扩展说明：如需支持新参数或API版本，建议扩展record结构体。
 * </p>
 */
@Component
@RequiredArgsConstructor
public class OpenAiService implements AiService {
    /**
     * @return 返回AI类型标识（openAi），用于工厂分发
     */
    @Override
    public String getType() { return "openAi"; }

    /**
     * 用于构造OpenAI请求体的消息结构。
     * role: 消息角色（如user/assistant），content: 消息内容。
     */
    record Message(String role, String content) {}
    /**
     * 用于构造OpenAI请求体。
     * model: 模型名，messages: 消息数组。
     */
    record OpenAiRequest(String model, Message[] messages) {}

    /**
     * 调用OpenAI服务，返回完整原始响应JSON字符串。
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（API Key、模型名、BaseUrl等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     * @throws RuntimeException 网络异常或API异常时抛出
     */
    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        try {
            String apiUrl;
            if (config.getBaseUrl() != null && !config.getBaseUrl().isBlank()) {
                String base = config.getBaseUrl().replaceAll("/+$", "");
                if (!base.endsWith("/v1/chat/completions")) {
                    apiUrl = base + "/v1/chat/completions";
                } else {
                    apiUrl = base;
                }
            } else {
                apiUrl = "https://api.openai.com/v1/chat/completions";
            }
            URL url = URI.create(apiUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getOpenAiApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String body = "{\"model\":\"" + config.getOpenAiModelName() + "\",\"messages\":[{\"role\":\"user\",\"content\":\"" + prompt + "\"}]}";
            return getOutputStream(conn, body);
        } catch (Exception e) {
            return "[OpenAi 摘要生成异常：" + e.getMessage() + "]";
        }
    }

    @NotNull
    public String getOutputStream(HttpURLConnection conn, String body) throws IOException {
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes());
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
        }
        return response.toString();
    }
} 