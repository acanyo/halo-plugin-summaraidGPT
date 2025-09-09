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
import java.util.function.Consumer;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class ZhipuAiService implements AiService {
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
            conn.setRequestProperty("Authorization", "Bearer " + config.getAiModelConfig().getZhipuAiConfig().getApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // 用Jackson构造请求体，自动转义content
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", config.getAiModelConfig().getZhipuAiConfig().getModelName());
            ArrayNode messages = root.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", prompt);
            String body = mapper.writeValueAsString(root);
            return AiServiceUtils.getOutputStream(conn, body);
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
        HttpURLConnection conn = null;
        try {
            String apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
            conn = (HttpURLConnection) URI.create(apiUrl).toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getAiModelConfig().getZhipuAiConfig().getApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // 用Jackson构造请求体，支持多轮对话
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", config.getAiModelConfig().getZhipuAiConfig().getModelName());
            
            // 解析对话历史并添加系统提示
            ArrayNode messagesArray = AiServiceUtils.parseConversationHistoryWithSystemPrompt(conversationHistory, systemPrompt, mapper);
            root.set("messages", messagesArray);
            
            String body = mapper.writeValueAsString(root);
            log.info("智谱AI同步请求体: {}", body);
            return AiServiceUtils.getOutputStream(conn, body);
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
        HttpURLConnection conn;
        try {
            String apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
            conn = (HttpURLConnection) URI.create(apiUrl).toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + config.getAiModelConfig().getZhipuAiConfig().getApiKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            // 用Jackson构造流式请求体，支持多轮对话
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode root = mapper.createObjectNode();
            root.put("model", config.getAiModelConfig().getZhipuAiConfig().getModelName());
            root.put("stream", true); // 启用流式输出
            
            // 解析对话历史并添加系统提示
            ArrayNode messagesArray = AiServiceUtils.parseConversationHistoryWithSystemPrompt(conversationHistory, systemPrompt, mapper);
            root.set("messages", messagesArray);
            
            String body = mapper.writeValueAsString(root);
            log.info("智谱AI流式请求体: {}", body);
            
            // 处理流式响应
            processZhipuStreamResponse(conn, body, onData, onComplete, onError);
            
        } catch (IOException e) {
            log.error("智谱AI流式多轮对话网络连接异常: {}", e.getMessage(), e);
            onError.accept("[智谱AI 网络连接异常：" + e.getMessage() + "]");
        } catch (Exception e) {
            log.error("智谱AI流式多轮对话处理异常: {}", e.getMessage(), e);
            onError.accept("[智谱AI 流式对话异常：" + e.getMessage() + "]");
        }
    }

    /**
     * 处理智谱AI流式响应，逐行读取并解析SSE数据。
     * @param conn HTTP连接
     * @param body 请求体
     * @param onData 数据回调函数
     * @param onComplete 完成回调函数
     * @param onError 错误回调函数
     */
    private void processZhipuStreamResponse(HttpURLConnection conn, String body,
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
                if (line.trim().isEmpty() || !line.startsWith("data: ")) {
                    continue;
                }
                
                String data = line.substring(6); // 移除 "data: " 前缀
                
                // 检查是否为结束标记
                if ("[DONE]".equals(data.trim())) {
                    onComplete.run();
                    break;
                }
                      // 解析JSON数据并提取内容
                     AiServiceUtils.parseStreamResponse(onData, mapper, data);

            }
            
        } catch (IOException e) {
            log.error("读取智谱AI流式响应异常: {}", e.getMessage(), e);
            
            // 尝试读取错误流
            try (BufferedReader errorBr = new BufferedReader(new InputStreamReader(conn.getErrorStream()))) {
                StringBuilder errorResponse = new StringBuilder();
                String errorLine;
                while ((errorLine = errorBr.readLine()) != null) {
                    errorResponse.append(errorLine);
                }
                onError.accept("读取响应失败：" + e.getMessage() + " | " + errorResponse);
            } catch (Exception ignore) {
                onError.accept("读取响应失败：" + e.getMessage());
            }
        }
    }
} 