package com.handsome.summary.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.handsome.summary.service.SettingConfigGetter.BasicConfig;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 智谱AI服务实现。
 * <p>
 * 负责与智谱AI官方API对接，生成摘要内容。
 * 配置项：API Key、模型名均通过BasicConfig注入。
 * 扩展说明：如需支持新参数或API版本，建议扩展record结构体。
 * </p>
 */
@Component
@RequiredArgsConstructor
public class ZhipuAiService implements AiService {
    final OpenAiService openAiService;
    /**
     * @return 返回AI类型标识（zhipuAi），用于工厂分发
     */
    @Override
    public String getType() { return "zhipuAi"; }

    /**
     * 用于构造智谱API请求体的消息结构。
     * role: 消息角色（如user/assistant），content: 消息内容。
     */
    record Message(String role, String content) {}

    /**
     * 调用智谱AI服务，返回完整原始响应JSON字符串。
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（API Key、模型名等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     * @throws RuntimeException 网络异常或API异常时抛出
     */
    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        HttpURLConnection conn = null;
        try {
            String apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
            conn = (HttpURLConnection) URI.create(apiUrl).toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getZhipuAiApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // 用Jackson构造请求体，自动转义content
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", config.getZhipuAiModelName());
            ArrayNode messages = root.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", prompt);
            String body = mapper.writeValueAsString(root);
            return openAiService.getOutputStream(conn, body);
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            if (conn != null) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream()))) {
                    StringBuilder errorResponse = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        errorResponse.append(line);
                    }
                    errorMsg += " | " + errorResponse;
                } catch (Exception ignore) {}
            }
            return "[智谱AI 摘要生成异常：" + errorMsg + "]";
        }
    }

    /**
     * 多轮对话AI服务调用，返回完整原始响应JSON字符串。
     * @param conversationHistory 对话历史，JSON格式字符串
     * @param config 当前AI相关配置（API Key、模型名、BaseUrl等）
     * @return AI返回的完整原始响应JSON字符串
     */
    @Override
    public String multiTurnChat(String conversationHistory, BasicConfig config) {
        try {
            // 智谱AI的多轮对话实现
            // 智谱AI支持多轮对话，可以直接使用chat/completions接口
            // 暂时返回默认实现，保持向后兼容
            return chatCompletionRaw(conversationHistory, config);
        } catch (Exception e) {
            return "[智谱AI 多轮对话异常：" + e.getMessage() + "]";
        }
    }

} 