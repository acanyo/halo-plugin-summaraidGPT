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
            
            // 构建输入参数
            ObjectNode input = root.putObject("input");
            
            // 解析对话历史并添加系统提示
            String enhancedConversationHistory = enhanceConversationWithSystemPrompt(conversationHistory, systemPrompt);
            
            // 通义千问使用messages字段，需要解析JSON字符串为对象数组
            try {
                com.fasterxml.jackson.databind.JsonNode messagesNode = mapper.readTree(enhancedConversationHistory);
                input.set("messages", messagesNode);
            } catch (Exception e) {
                // 如果解析失败，作为单个用户消息处理
                com.fasterxml.jackson.databind.node.ArrayNode messagesArray = input.putArray("messages");
                com.fasterxml.jackson.databind.node.ObjectNode userMessage = messagesArray.addObject();
                userMessage.put("role", "user");
                userMessage.put("content", conversationHistory);
            }
            
            String body = mapper.writeValueAsString(root);
            return openAiService.getOutputStream(conn, body);
        } catch (Exception e) {
            return "[通义千问 多轮对话异常：" + e.getMessage() + "]";
        }
    }

    /**
     * 增强对话历史，添加系统人设提示
     * @param conversationHistory 原始对话历史
     * @param systemPrompt 系统人设提示
     * @return 增强后的对话历史
     */
    private String enhanceConversationWithSystemPrompt(String conversationHistory, String systemPrompt) {
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            return conversationHistory;
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode conversationNode;
            
            // 检查是否是JSON格式
            if (conversationHistory.trim().startsWith("[") || conversationHistory.trim().startsWith("{")) {
                conversationNode = mapper.readTree(conversationHistory);
            } else {
                // 如果是纯文本，包装成用户消息
                return String.format("[{\"role\":\"system\",\"content\":\"%s\"},{\"role\":\"user\",\"content\":\"%s\"}]", 
                    systemPrompt.replace("\"", "\\\""), 
                    conversationHistory.replace("\"", "\\\""));
            }

            // 创建增强后的对话数组
            com.fasterxml.jackson.databind.node.ArrayNode enhancedArray = mapper.createArrayNode();
            
            // 添加系统人设消息（放在最前面）
            com.fasterxml.jackson.databind.node.ObjectNode systemMessage = enhancedArray.addObject();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            
            // 添加原有对话内容
            if (conversationNode.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode message : conversationNode) {
                    if (message.has("role") && message.has("content")) {
                        String role = message.get("role").asText();
                        // 跳过已有的system消息，避免重复
                        if (!"system".equals(role)) {
                            enhancedArray.add(message);
                        }
                    }
                }
            } else if (conversationNode.isObject() && conversationNode.has("role") && conversationNode.has("content")) {
                String role = conversationNode.get("role").asText();
                if (!"system".equals(role)) {
                    enhancedArray.add(conversationNode);
                }
            }
            
            return mapper.writeValueAsString(enhancedArray);
            
        } catch (Exception e) {
            // 如果解析失败，尝试简单的字符串拼接
            return String.format("[{\"role\":\"system\",\"content\":\"%s\"},{\"role\":\"user\",\"content\":\"%s\"}]", 
                systemPrompt.replace("\"", "\\\""), 
                conversationHistory.replace("\"", "\\\""));
        }
    }

} 