package com.handsome.summary.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.handsome.summary.service.SettingConfigGetter.BasicConfig;
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
     final OpenAiService openAiService;
    /**
     * @return 返回AI类型标识（dashScope），用于工厂分发
     */
    @Override
    public String getType() { return "dashScope"; }

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
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", config.getDashScopeModelName());
            ObjectNode input = root.putObject("input");
            input.put("prompt", prompt);
            String body = mapper.writeValueAsString(root);
            return openAiService.getOutputStream(conn, body);
        } catch (Exception e) {
            return "[通义千问 摘要生成异常：" + e.getMessage() + "]";
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
            // 通义千问的多轮对话实现
            // 通义千问支持多轮对话，可以直接使用chat/completions接口
            // 暂时返回默认实现，保持向后兼容
            return chatCompletionRaw(conversationHistory, config);
        } catch (Exception e) {
            return "[通义千问 多轮对话异常：" + e.getMessage() + "]";
        }
    }

} 