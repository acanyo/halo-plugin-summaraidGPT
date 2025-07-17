package com.handsome.summary.service;

import com.handsome.summary.service.SettingConfigGetter.BasicConfig;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 通义千问（DashScope）服务实现。
 * <p>
 * 负责与通义千问官方API对接，生成摘要内容。
 * 配置项：API Key、模型名均通过BasicConfig注入。
 * 扩展说明：如需支持新参数或API版本，建议扩展record结构体。
 * </p>
 */
@Component
@RequiredArgsConstructor
public class DashScopeAiService implements AiService {
    /**
     * @return 返回AI类型标识（dashScope），用于工厂分发
     */
    @Override
    public String getType() { return "dashScope"; }

    /**
     * 用于构造DashScope请求体的输入结构。
     * prompt: 用户输入的提示词。
     */
    record DashScopeInput(String prompt) {}
    /**
     * 用于构造DashScope请求体。
     * model: 模型名，input: 输入结构体。
     */
    record DashScopeRequest(String model, DashScopeInput input) {}

    /**
     * 调用通义千问服务，返回完整原始响应JSON字符串。
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（API Key、模型名等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     * @throws RuntimeException 网络异常或API异常时抛出
     */
    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        try {
            String apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            URL url = URI.create(apiUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getDashScopeApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String body = "{\"model\":\"" + config.getDashScopeModelName() + "\",\"input\":{\"prompt\":\"" + prompt + "\"}}";
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
        } catch (Exception e) {
            return "[通义千问 摘要生成异常：" + e.getMessage() + "]";
        }
    }
} 