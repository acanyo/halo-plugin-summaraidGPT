package com.handsome.summary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.function.Consumer;

/**
 * AI服务通用工具类
 * 提供所有AI服务共用的通用方法，减少重复代码
 */
@Slf4j
@Component
public class AiServiceUtils {
    
    /**
     * 判断是否为流式模式
     * @param onData 数据回调
     * @param onComplete 完成回调
     * @param onError 错误回调
     * @return true表示流式模式，false表示非流式模式
     */
    public static boolean isStreamMode(Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        return onData != null && onComplete != null && onError != null;
    }
    
    /**
     * 通用的多轮对话处理器
     * @param conversationHistory 对话历史
     * @param systemPrompt 系统提示
     * @param onData 数据回调
     * @param onComplete 完成回调
     * @param onError 错误回调
     * @param syncProcessor 同步处理器
     * @param streamProcessor 流式处理器
     * @return 非流式模式返回结果，流式模式返回null
     */
    public static String handleMultiTurnChat(
            String conversationHistory,
            String systemPrompt,
            Consumer<String> onData,
            Runnable onComplete,
            Consumer<String> onError,
            SyncChatProcessor syncProcessor,
            StreamChatProcessor streamProcessor) {
        
        boolean isStreamMode = isStreamMode(onData, onComplete, onError);
        
        if (isStreamMode) {
            log.debug("使用流式模式处理多轮对话");
            streamProcessor.process(conversationHistory, systemPrompt, onData, onComplete, onError);
            return null;
        } else {
            log.debug("使用同步模式处理多轮对话");
            return syncProcessor.process(conversationHistory, systemPrompt);
        }
    }
    
    /**
     * 同步聊天处理器接口
     */
    @FunctionalInterface
    public interface SyncChatProcessor {
        String process(String conversationHistory, String systemPrompt);
    }
    
    /**
     * 流式聊天处理器接口
     */
    @FunctionalInterface
    public interface StreamChatProcessor {
        void process(String conversationHistory, String systemPrompt,
                    Consumer<String> onData, Runnable onComplete, Consumer<String> onError);
    }
    
    /**
     * 增强对话历史，添加系统提示
     * @param conversationHistory 原始对话历史
     * @param systemPrompt 系统提示
     * @param mapper JSON映射器
     * @return 增强后的对话历史JSON字符串
     */
    public static String enhanceConversationWithSystemPrompt(String conversationHistory, String systemPrompt, ObjectMapper mapper) {
        try {
            // 尝试解析为JSON数组，检查是否已经是格式化的对话历史
            JsonNode rootNode = mapper.readTree(conversationHistory);
            if (rootNode.isArray()) {
                ArrayNode messagesArray = (ArrayNode) rootNode;
                
                // 检查是否已经有system消息
                boolean hasSystemMessage = false;
                for (JsonNode message : messagesArray) {
                    if ("system".equals(message.path("role").asText())) {
                        hasSystemMessage = true;
                        break;
                    }
                }
                
                // 如果已经有system消息，直接返回原对话历史
                if (hasSystemMessage) {
                    return conversationHistory;
                }
                
                // 如果没有system消息且有系统提示，添加系统提示
                if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                    ArrayNode enhancedArray = mapper.createArrayNode();
                    
                    // 添加系统人设消息（放在最前面）
                    ObjectNode systemMessage = enhancedArray.addObject();
                    systemMessage.put("role", "system");
                    systemMessage.put("content", systemPrompt);
                    
                    // 添加原有对话内容
                    enhancedArray.addAll(messagesArray);
                    
                    return enhancedArray.toString();
                }
                
                return conversationHistory;
            } else {
                // 如果是纯文本，使用Jackson构建JSON数组避免转义问题
                return buildMessageArrayFromText(conversationHistory, systemPrompt, mapper);
            }

        } catch (Exception e) {
            // 如果解析失败，当作纯文本处理
            log.debug("对话历史解析失败，当作纯文本处理: {}", e.getMessage());
            return buildMessageArrayFromText(conversationHistory, systemPrompt, mapper);
        }
    }
    
    /**
     * 从纯文本构建消息数组
     * @param conversationHistory 对话历史文本
     * @param systemPrompt 系统提示
     * @param mapper JSON映射器
     * @return JSON格式的消息数组字符串
     */
    private static String buildMessageArrayFromText(String conversationHistory, String systemPrompt, ObjectMapper mapper) {
        ArrayNode messagesArray = mapper.createArrayNode();
        
        // 添加系统提示（如果存在）
        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            ObjectNode systemMessage = messagesArray.addObject();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
        }
        
        // 添加用户消息
        ObjectNode userMessage = messagesArray.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", conversationHistory);
        
        return messagesArray.toString();
    }
    
    /**
     * 解析对话历史并构建OpenAI格式的消息数组
     * @param conversationHistory 对话历史
     * @param systemPrompt 系统提示
     * @param mapper JSON映射器
     * @return OpenAI格式的消息数组
     */
    public static ArrayNode parseConversationHistoryWithSystemPrompt(String conversationHistory, String systemPrompt, ObjectMapper mapper) {
        ArrayNode messagesArray = mapper.createArrayNode();
        
        // 添加系统提示（如果存在）
        addMessageSafely(messagesArray, "system", systemPrompt);
        
        try {
            // 尝试解析对话历史
            JsonNode rootNode = mapper.readTree(conversationHistory);
            if (rootNode.isArray()) {
                // 如果是数组，遍历添加每个消息（跳过已存在的system消息）
                addValidMessagesFromArray(messagesArray, rootNode, true);
            } else {
                // 如果不是数组，当作单个用户消息处理
                addMessageSafely(messagesArray, "user", conversationHistory);
            }
        } catch (Exception e) {
            // 解析失败，当作纯文本用户消息处理
            log.debug("对话历史解析失败，当作纯文本处理: {}", e.getMessage());
            addMessageSafely(messagesArray, "user", conversationHistory);
        }
        
        return messagesArray;
    }

    /**
     * 构建AI服务错误消息
     * @param aiType AI类型
     * @param operation 操作类型（如"摘要生成"、"多轮对话"等）
     * @param error 错误信息
     * @return 格式化的错误消息
     */
    public static String buildErrorMessage(String aiType, String operation, String error) {
        return String.format("[%s %s异常：%s]", aiType, operation, error);
    }

    /**
     * 安全地获取配置值，提供默认值
     * @param value 配置值
     * @param defaultValue 默认值
     * @return 有效的配置值
     */
    public static String getConfigValueOrDefault(String value, String defaultValue) {
        return (value != null && !value.trim().isEmpty()) ? value.trim() : defaultValue;
    }
    
    /**
     * 从AI返回的响应中提取内容
     * 支持多种AI服务的响应格式
     * @param response AI原始响应
     * @return 提取的文本内容，如果解析失败则返回原始响应
     */
    public static String extractContentFromResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return response;
        }
        
        String trimmed = response.trim();
        
        // 如果不是JSON格式，直接返回（可能是纯文本响应）
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return response;
        }
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(trimmed);
            
            // 尝试OpenAI格式：choices[0].message.content
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode content = choices.get(0).path("message").path("content");
                if (!content.isMissingNode()) {
                    return content.asText();
                }
                // 尝试流式格式：choices[0].delta.content
                JsonNode deltaContent = choices.get(0).path("delta").path("content");
                if (!deltaContent.isMissingNode()) {
                    return deltaContent.asText();
                }
            }
            
            // 尝试通义千问格式：output.text
            JsonNode output = root.path("output");
            if (!output.isMissingNode()) {
                JsonNode text = output.path("text");
                if (!text.isMissingNode()) {
                    return text.asText();
                }
            }
            
            // 尝试智谱AI格式：data.choices[0].content 或者其他可能的格式
            JsonNode data = root.path("data");
            if (!data.isMissingNode()) {
                JsonNode dataChoices = data.path("choices");
                if (dataChoices.isArray() && !dataChoices.isEmpty()) {
                    JsonNode content = dataChoices.get(0).path("content");
                    if (!content.isMissingNode()) {
                        return content.asText();
                    }
                }
            }
            
            // 尝试直接的content字段
            JsonNode directContent = root.path("content");
            if (!directContent.isMissingNode()) {
                return directContent.asText();
            }
            
            // 如果都没找到，返回原始响应
            log.info("无法从AI响应中提取内容，返回原始响应");
            return response;
            
        } catch (Exception e) {
            log.info("解析AI响应JSON失败，返回原始响应: {}", e.getMessage());
            return response;
        }
    }

    /**
     * 验证消息角色是否有效
     * @param role 角色名称
     * @return true表示有效角色
     */
    public static boolean isValidRole(String role) {
        return role != null && (role.equals("system") || role.equals("user") || role.equals("assistant"));
    }
    
    /**
     * 检查字符串是否是AI错误信息
     * @param content 待检查的内容
     * @return true表示是错误信息，false表示正常内容
     */
    public static boolean isErrorMessage(String content) {
        if (content == null || content.trim().isEmpty()) {
            return true;
        }
        
        // 检查是否包含错误信息的特征标识
        String trimmedContent = content.trim();
        return trimmedContent.startsWith("[") && 
               (trimmedContent.contains("异常") || 
                trimmedContent.contains("错误") || 
                trimmedContent.contains("失败") ||
                trimmedContent.contains("Exception") ||
                trimmedContent.contains("Error"));
    }
    
    /**
     * 安全地添加消息到消息数组
     *
     * @param messagesArray 消息数组
     * @param role 角色
     * @param content 内容
     */
    public static void addMessageSafely(ArrayNode messagesArray, String role, String content) {
        if (isValidRole(role) && content != null && !content.trim().isEmpty()) {
            ObjectNode message = messagesArray.addObject();
            message.put("role", role);
            message.put("content", content.trim());
        }
    }
    
    /**
     * 从JsonNode提取并添加消息到消息数组
     *
     * @param messagesArray 目标消息数组
     * @param node JSON节点
     */
    public static void addMessageFromNode(ArrayNode messagesArray, JsonNode node) {
        if (node != null && node.has("role") && node.has("content")) {
            String role = node.get("role").asText();
            String content = node.get("content").asText();
            addMessageSafely(messagesArray, role, content);
        }
    }
    
    /**
     * 解析流式响应数据并提取内容
     * 支持OpenAI格式的流式响应解析
     *
     * @param onData 数据回调
     * @param mapper JSON映射器
     * @param data 响应数据
     */
    public static void parseStreamResponse(Consumer<String> onData, ObjectMapper mapper, String data) {
        try {
            JsonNode jsonNode = mapper.readTree(data);
            if (jsonNode.has("choices") && jsonNode.get("choices").isArray() &&
                !jsonNode.get("choices").isEmpty()) {
                JsonNode choice = jsonNode.get("choices").get(0);
                if (choice.has("delta") && choice.get("delta").has("content")) {
                    String content = choice.get("delta").get("content").asText();
                    if (!content.isEmpty()) {
                        onData.accept(content);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("解析流式响应失败: {}", e.getMessage());
        }
    }
    
    /**
     * 构建标准的AI请求消息数组
     * @param mapper JSON映射器
     * @param systemPrompt 系统提示（可选）
     * @param userContent 用户内容
     * @return 构建好的消息数组
     */
    public static ArrayNode buildStandardMessages(ObjectMapper mapper, String systemPrompt, String userContent) {
        ArrayNode messagesArray = mapper.createArrayNode();
        
        // 添加系统提示（如果存在）
        addMessageSafely(messagesArray, "system", systemPrompt);
        
        // 添加用户消息
        addMessageSafely(messagesArray, "user", userContent);
        
        return messagesArray;
    }
    
    /**
     * 从对话历史数组中过滤并添加有效消息
     * @param targetArray 目标消息数组
     * @param sourceArray 源消息数组
     * @param skipSystemRole 是否跳过system角色的消息
     */
    public static void addValidMessagesFromArray(ArrayNode targetArray, JsonNode sourceArray, boolean skipSystemRole) {
        if (sourceArray != null && sourceArray.isArray()) {
            for (JsonNode message : sourceArray) {
                if (message.has("role") && message.has("content")) {
                    String role = message.get("role").asText();
                    
                    // 如果需要跳过system角色且当前是system角色，则跳过
                    if (skipSystemRole && "system".equals(role)) {
                        continue;
                    }
                    
                    addMessageFromNode(targetArray, message);
                }
            }
        }
    }
    
    /**
     * 发送HTTP请求并获取响应
     * 这是从OpenAiService提取出来的通用HTTP处理方法
     * @param conn HTTP连接
     * @param body 请求体
     * @return 响应字符串
     * @throws IOException IO异常
     */
    @NotNull
    public static String getOutputStream(HttpURLConnection conn, String body) throws IOException {
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
