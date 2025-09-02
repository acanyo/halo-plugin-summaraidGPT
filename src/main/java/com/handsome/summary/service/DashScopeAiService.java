package com.handsome.summary.service;

import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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

    @Override
    public String multiTurnChat(String conversationHistory, String systemPrompt, BasicConfig config,
                               Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        // 判断是否为流式模式
        boolean isStreamMode = (onData != null && onComplete != null && onError != null);
        
        if (isStreamMode) {
            // 流式模式，异步处理
            processMultiTurnChatStream(conversationHistory, systemPrompt, config, onData, onComplete, onError);
            return null;
        } else {
            // 非流式模式，同步处理
            return processMultiTurnChatSync(conversationHistory, systemPrompt, config);
        }
    }

    /**
     * 处理同步多轮对话。
     * @param conversationHistory 对话历史
     * @param systemPrompt 系统提示
     * @param config 配置
     * @return 完整响应
     */
    private String processMultiTurnChatSync(String conversationHistory, String systemPrompt, BasicConfig config) {
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
                JsonNode messagesNode = mapper.readTree(enhancedConversationHistory);
                input.set("messages", messagesNode);
            } catch (Exception e) {
                // 如果解析失败，作为单个用户消息处理
                ArrayNode messagesArray = input.putArray("messages");
                ObjectNode userMessage = messagesArray.addObject();
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
     * 处理流式多轮对话。
     * @param conversationHistory 对话历史
     * @param systemPrompt 系统提示
     * @param config 配置
     * @param onData 数据回调
     * @param onComplete 完成回调
     * @param onError 错误回调
     */
    private void processMultiTurnChatStream(String conversationHistory, String systemPrompt, BasicConfig config,
                                          Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        try {
            String apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
            URL url = URI.create(apiUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getDashScopeApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "text/event-stream"); // 启用SSE
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
                JsonNode messagesNode = mapper.readTree(enhancedConversationHistory);
                input.set("messages", messagesNode);
            } catch (Exception e) {
                // 如果解析失败，作为单个用户消息处理
                ArrayNode messagesArray = input.putArray("messages");
                ObjectNode userMessage = messagesArray.addObject();
                userMessage.put("role", "user");
                userMessage.put("content", conversationHistory);
            }
            
            // 添加流式输出参数
            ObjectNode parameters = root.putObject("parameters");
            parameters.put("incremental_output", true);
            
            String body = mapper.writeValueAsString(root);
            log.info("通义千问流式请求体: {}", body);
            
            // 处理流式响应
            processDashScopeStreamResponse(conn, body, onData, onComplete, onError);
            
        } catch (IOException e) {
            log.error("通义千问流式多轮对话网络连接异常: {}", e.getMessage(), e);
            onError.accept("[通义千问 网络连接异常：" + e.getMessage() + "]");
        } catch (Exception e) {
            log.error("通义千问流式多轮对话处理异常: {}", e.getMessage(), e);
            onError.accept("[通义千问 流式对话异常：" + e.getMessage() + "]");
        }
    }

    /**
     * 处理通义千问流式响应，逐行读取并解析SSE数据。
     * @param conn HTTP连接
     * @param body 请求体
     * @param onData 数据回调函数
     * @param onComplete 完成回调函数
     * @param onError 错误回调函数
     */
    private void processDashScopeStreamResponse(HttpURLConnection conn, String body,
                                              Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes());
        } catch (IOException e) {
            onError.accept("发送请求失败：" + e.getMessage());
            return;
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            ObjectMapper mapper = new ObjectMapper();
            
            while ((line = br.readLine()) != null) {
                // 跳过空行和非数据行
                if (line.trim().isEmpty() || !line.startsWith("data:")) {
                    continue;
                }
                
                String data = line.substring(5).trim(); // 移除 "data:" 前缀
                
                // 检查是否为结束标记
                if ("[DONE]".equals(data) || data.isEmpty()) {
                    onComplete.run();
                    break;
                }
                
                try {
                    // 解析JSON数据并提取内容
                    JsonNode jsonNode = mapper.readTree(data);
                    
                    // 通义千问的响应格式: output.text
                    if (jsonNode.has("output") && jsonNode.get("output").has("text")) {
                        String content = jsonNode.get("output").get("text").asText();
                        if (!content.isEmpty()) {
                            onData.accept(content);
                        }
                    }
                    
                    // 检查是否完成
                    if (jsonNode.has("output") && jsonNode.get("output").has("finish_reason")) {
                        String finishReason = jsonNode.get("output").get("finish_reason").asText();
                        if (!"null".equals(finishReason) && !finishReason.isEmpty()) {
                            onComplete.run();
                            break;
                        }
                    }
                    
                } catch (Exception e) {
                    log.warn("解析通义千问流式数据失败: {}", e.getMessage());
                    // 继续处理下一行，不中断整个流程
                }
            }
            
        } catch (IOException e) {
            log.error("读取通义千问流式响应异常: {}", e.getMessage(), e);
            onError.accept("读取响应失败：" + e.getMessage());
        }
    }

    /**
     * 增强对话历史，添加系统人设提示
     * @param conversationHistory 原始对话历史
     * @param systemPrompt 系统人设提示
     * @return 增强后的对话历史
     */
    private String enhanceConversationWithSystemPrompt(String conversationHistory, String systemPrompt) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode conversationNode;
            boolean hasSystemMessage = false;
            
            // 检查是否是JSON格式
            if (conversationHistory.trim().startsWith("[") || conversationHistory.trim().startsWith("{")) {
                conversationNode = mapper.readTree(conversationHistory);
                
                // 检查是否已经有system消息
                if (conversationNode.isArray()) {
                    for (JsonNode message : conversationNode) {
                        if (message.has("role") && "system".equals(message.get("role").asText())) {
                            hasSystemMessage = true;
                            break;
                        }
                    }
                } else if (conversationNode.isObject() && conversationNode.has("role") && 
                          "system".equals(conversationNode.get("role").asText())) {
                    hasSystemMessage = true;
                }
                
                // 如果已经有system消息，直接返回原对话历史
                if (hasSystemMessage) {
                    return conversationHistory;
                }
            } else {
                // 如果是纯文本，包装成用户消息并添加系统提示
                if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                    return String.format("[{\"role\":\"system\",\"content\":\"%s\"},{\"role\":\"user\",\"content\":\"%s\"}]", 
                        systemPrompt.replace("\"", "\\\""), 
                        conversationHistory.replace("\"", "\\\""));
                } else {
                    return String.format("[{\"role\":\"user\",\"content\":\"%s\"}]", 
                        conversationHistory.replace("\"", "\\\""));
                }
            }

            // 如果没有system消息且有系统提示，添加系统提示
            if (!hasSystemMessage && systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                // 创建增强后的对话数组
               ArrayNode enhancedArray = mapper.createArrayNode();
                
                // 添加系统人设消息（放在最前面）
               ObjectNode systemMessage = enhancedArray.addObject();
                systemMessage.put("role", "system");
                systemMessage.put("content", systemPrompt);
                
                // 添加原有对话内容
                if (conversationNode.isArray()) {
                    for (com.fasterxml.jackson.databind.JsonNode message : conversationNode) {
                        if (message.has("role") && message.has("content")) {
                            enhancedArray.add(message);
                        }
                    }
                } else if (conversationNode.isObject() && conversationNode.has("role") && conversationNode.has("content")) {
                    enhancedArray.add(conversationNode);
                }
                
                return mapper.writeValueAsString(enhancedArray);
            }
            
            return conversationHistory;
            
        } catch (Exception e) {
            // 如果解析失败，尝试简单的字符串拼接
            if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                return String.format("[{\"role\":\"system\",\"content\":\"%s\"},{\"role\":\"user\",\"content\":\"%s\"}]", 
                    systemPrompt.replace("\"", "\\\""), 
                    conversationHistory.replace("\"", "\\\""));
            } else {
                return String.format("[{\"role\":\"user\",\"content\":\"%s\"}]", 
                    conversationHistory.replace("\"", "\\\""));
            }
        }
    }

} 