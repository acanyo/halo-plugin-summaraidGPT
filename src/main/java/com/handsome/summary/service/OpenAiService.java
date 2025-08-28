package com.handsome.summary.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
     * 调用OpenAI服务，返回完整原始响应JSON字符串。
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（API Key、模型名、BaseUrl等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     * @throws RuntimeException 网络异常或API异常时抛出
     */
    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        String modelType = null;
        try {
            // 判断 codesphere 适配
            modelType = config.getModelType();
            String apiKey;
            String modelName;
            String baseUrl;
            if ("codesphere".equalsIgnoreCase(modelType)) {
                apiKey = config.getCodesphereKey();
                modelName = config.getCodesphereType();
                baseUrl = "https://api.master-jsx.top";
            } else {
                apiKey = config.getOpenAiApiKey();
                modelName = config.getOpenAiModelName();
                baseUrl = config.getBaseUrl();
            }
            String apiUrl;
            if (baseUrl != null && !baseUrl.isBlank()) {
                String base = baseUrl.replaceAll("/+$", "");
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
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            if ("codesphere".equalsIgnoreCase(modelType)) {
                conn.setRequestProperty("Accept", "application/json");
            }
            conn.setDoOutput(true);
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", modelName);
            ArrayNode messages = root.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", prompt);
            String body = mapper.writeValueAsString(root);
            return getOutputStream(conn, body);
        } catch (Exception e) {
            return "[" + modelType + " 摘要生成异常：" + e.getMessage() + "]";
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
        String modelType = null;
        try {
            // 判断 codesphere 适配
            modelType = config.getModelType();
            String apiKey;
            String modelName;
            String baseUrl;
            if ("codesphere".equalsIgnoreCase(modelType)) {
                apiKey = config.getCodesphereKey();
                modelName = config.getCodesphereType();
                baseUrl = "https://api.master-jsx.top";
            } else {
                apiKey = config.getOpenAiApiKey();
                modelName = config.getOpenAiModelName();
                baseUrl = config.getBaseUrl();
            }
            
            String apiUrl = buildMultiTurnApiUrl(baseUrl);
            URL url = URI.create(apiUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            if ("codesphere".equalsIgnoreCase(modelType)) {
                conn.setRequestProperty("Accept", "application/json");
            }
            conn.setDoOutput(true);
            
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", modelName);
            
            // 解析对话历史
            ArrayNode messagesArray = parseConversationHistory(conversationHistory, mapper);
            root.set("messages", messagesArray);
            
            String body = mapper.writeValueAsString(root);
            return getOutputStream(conn, body);
        } catch (Exception e) {
            return "[" + modelType + " 多轮对话异常：" + e.getMessage() + "]";
        }
    }

    /**
     * 解析对话历史，支持JSON数组格式
     * @param conversationHistory 对话历史字符串
     * @param mapper JSON映射器
     * @return 消息数组
     */
    private ArrayNode parseConversationHistory(String conversationHistory, ObjectMapper mapper) {
        ArrayNode messagesArray = mapper.createArrayNode();
        
        try {
            // 尝试解析为JSON数组
            if (conversationHistory.startsWith("[") && conversationHistory.endsWith("]")) {
                com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(conversationHistory);
                if (jsonNode.isArray()) {
                    for (com.fasterxml.jackson.databind.JsonNode node : jsonNode) {
                        if (node.has("role") && node.has("content")) {
                            messagesArray.add(node);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // 如果解析失败，作为单个用户消息处理
            ObjectNode message = messagesArray.addObject();
            message.put("role", "user");
            message.put("content", conversationHistory);
        }
        
        // 如果没有解析到有效消息，创建默认消息
        if (messagesArray.size() == 0) {
            ObjectNode message = messagesArray.addObject();
            message.put("role", "user");
            message.put("content", conversationHistory);
        }
        
        return messagesArray;
    }

    /**
     * 构建多轮对话API URL
     * @param baseUrl 基础URL
     * @return 完整的API URL
     */
    private String buildMultiTurnApiUrl(String baseUrl) {
        if (baseUrl != null && !baseUrl.isBlank()) {
            String base = baseUrl.replaceAll("/+$", "");
            if (!base.endsWith("/v1/chat/completions")) {
                return base + "/v1/chat/completions";
            } else {
                return base;
            }
        } else {
            return "https://api.openai.com/v1/chat/completions";
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