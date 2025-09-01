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
        // 调用带系统提示的方法，使用配置中的基础人设
        return multiTurnChat(conversationHistory, config.getAiSystem(), config);
    }

    /**
     * 多轮对话AI服务调用，支持系统提示，返回完整原始响应JSON字符串。
     * @param conversationHistory 对话历史，JSON格式字符串
     * @param systemPrompt 系统提示/角色设定，如果为空则不添加系统消息
     * @param config 当前AI相关配置（API Key、模型名、BaseUrl等）
     * @return AI返回的完整原始响应JSON字符串
     */
    @Override
    public String multiTurnChat(String conversationHistory, String systemPrompt, BasicConfig config) {
        HttpURLConnection conn = null;
        try {
            String apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
            conn = (HttpURLConnection) URI.create(apiUrl).toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getZhipuAiApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // 用Jackson构造请求体，支持多轮对话
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", config.getZhipuAiModelName());
            
            // 解析对话历史并添加系统提示
            ArrayNode messagesArray = parseConversationHistoryWithSystemPrompt(conversationHistory, systemPrompt, mapper);
            root.set("messages", messagesArray);
            
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
            return "[智谱AI 多轮对话异常：" + errorMsg + "]";
        }
    }

    /**
     * 解析对话历史并自动添加系统提示，支持多种输入格式。
     * @param conversationHistory 对话历史字符串
     * @param systemPrompt 系统提示/角色设定，如果为空则不添加
     * @param mapper JSON映射器
     * @return 包含系统提示的标准化消息数组
     */
    private ArrayNode parseConversationHistoryWithSystemPrompt(String conversationHistory, String systemPrompt, ObjectMapper mapper) {
        ArrayNode messagesArray = mapper.createArrayNode();
        
        // 如果有系统提示，添加到开头
        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            ObjectNode systemMessage = messagesArray.addObject();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt.trim());
        }
        
        try {
            // 解析对话历史
            if (conversationHistory != null && !conversationHistory.trim().isEmpty()) {
                String trimmed = conversationHistory.trim();
                
                if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || 
                    (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
                    
                    com.fasterxml.jackson.databind.JsonNode conversationNode = mapper.readTree(trimmed);
                    
                    if (conversationNode.isArray()) {
                        // JSON数组格式
                        for (com.fasterxml.jackson.databind.JsonNode message : conversationNode) {
                            if (message.has("role") && message.has("content")) {
                                String role = message.get("role").asText();
                                // 跳过已有的system消息，避免重复
                                if (!"system".equals(role)) {
                                    messagesArray.add(message);
                                }
                            }
                        }
                    } else if (conversationNode.isObject() && conversationNode.has("role") && conversationNode.has("content")) {
                        // 单个消息对象
                        String role = conversationNode.get("role").asText();
                        if (!"system".equals(role)) {
                            messagesArray.add(conversationNode);
                        }
                    }
                } else {
                    // 纯文本，作为用户消息
                    ObjectNode userMessage = messagesArray.addObject();
                    userMessage.put("role", "user");
                    userMessage.put("content", conversationHistory);
                }
            }
        } catch (Exception e) {
            // 解析失败，作为纯文本处理
            ObjectNode userMessage = messagesArray.addObject();
            userMessage.put("role", "user");
            userMessage.put("content", conversationHistory);
        }
        
        // 如果没有消息，添加一个空的用户消息
        if (messagesArray.size() == 0 || (messagesArray.size() == 1 && systemPrompt != null)) {
            ObjectNode userMessage = messagesArray.addObject();
            userMessage.put("role", "user");
            userMessage.put("content", "");
        }
        
        return messagesArray;
    }

} 