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
@Slf4j
public class DashScopeAiService implements AiService {
    /**
     * @return 返回AI类型标识（dashScope），用于工厂分发
     */
    @Override
    public String getType() { return "dashScope"; }

    /**
     * 创建通义千问API连接和基础JSON结构
     */
    private record DashScopeRequest(HttpURLConnection conn, ObjectMapper mapper, ObjectNode root, ObjectNode input) {}
    
    private DashScopeRequest createDashScopeRequest(BasicConfig config, boolean isStream) throws Exception {
        String apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
        URL url = URI.create(apiUrl).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + config.getAiModelConfig().getDashScopeConfig().getApiKey());
        conn.setRequestProperty("Content-Type", "application/json");
        if (isStream) {
            conn.setRequestProperty("Accept", "text/event-stream"); // 启用SSE
        }
        conn.setDoOutput(true);
        
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        root.put("model", config.getAiModelConfig().getDashScopeConfig().getModelName());
        ObjectNode input = root.putObject("input");
        
        return new DashScopeRequest(conn, mapper, root, input);
    }

    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        try {
            var request = createDashScopeRequest(config, false);
            request.input().put("prompt", prompt);
            String body = request.mapper().writeValueAsString(request.root());
            return AiServiceUtils.getOutputStream(request.conn(), body);
        } catch (Exception e) {
            return "[通义千问 摘要生成异常：" + e.getMessage() + "]";
        }
    }

    @Override
    public String multiTurnChat(String conversationHistory, String systemPrompt, BasicConfig config,
                               Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        return AiServiceUtils.handleMultiTurnChat(
            conversationHistory,
            systemPrompt,
            onData,
            onComplete,
            onError,
            (history, prompt) -> processMultiTurnChatSync(history, prompt, config),
            (history, prompt, dataCallback, completeCallback, errorCallback) -> 
                processMultiTurnChatStream(history, prompt, config, dataCallback, completeCallback, errorCallback)
        );
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
            var request = createDashScopeRequest(config, false);
            
            // 解析对话历史并添加系统提示
            conversationHistory(conversationHistory, systemPrompt, request.mapper(), request.input());

            String body = request.mapper().writeValueAsString(request.root());
            return AiServiceUtils.getOutputStream(request.conn(), body);
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
            var request = createDashScopeRequest(config, true);
            
            // 解析对话历史并添加系统提示
            conversationHistory(conversationHistory, systemPrompt, request.mapper(), request.input());

            // 添加流式输出参数
            ObjectNode parameters = request.root().putObject("parameters");
            parameters.put("incremental_output", true);
            
            String body = request.mapper().writeValueAsString(request.root());
            log.info("通义千问流式请求体: {}", body);
            
            // 处理流式响应
            processDashScopeStreamResponse(request.conn(), body, onData, onComplete, onError);
            
        } catch (IOException e) {
            log.error("通义千问流式多轮对话网络连接异常: {}", e.getMessage(), e);
            onError.accept("[通义千问 网络连接异常：" + e.getMessage() + "]");
        } catch (Exception e) {
            log.error("通义千问流式多轮对话处理异常: {}", e.getMessage(), e);
            onError.accept("[通义千问 流式对话异常：" + e.getMessage() + "]");
        }
    }

    private void conversationHistory(String conversationHistory, String systemPrompt, ObjectMapper mapper,
        ObjectNode input) {
        String enhancedConversationHistory = AiServiceUtils.enhanceConversationWithSystemPrompt(
            conversationHistory, systemPrompt, mapper);

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
                    throw new RuntimeException(e);
                }
            }
            
        } catch (IOException e) {
            log.error("读取通义千问流式响应异常: {}", e.getMessage(), e);
            onError.accept("读取响应失败：" + e.getMessage());
        }
    }



} 