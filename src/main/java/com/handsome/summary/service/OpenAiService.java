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
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

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
@Slf4j
public class OpenAiService implements AiService {
    /**
     * @return 返回AI类型标识（openAi），用于工厂分发
     */
    @Override
    public String getType() { return "openAi"; }

    /**
     * 服务配置记录，统一处理OpenAI和Codesphere的配置。
     * apiKey: API密钥，modelName: 模型名称，baseUrl: 基础URL，modelType: 模型类型
     */
    record ServiceConfig(String apiKey, String modelName, String baseUrl, String modelType) {}

    /**
     * 根据配置类型获取服务配置信息。
     * @param config 基础配置对象
     * @return 统一的服务配置记录
     */
    private ServiceConfig getServiceConfig(BasicConfig config) {
        String modelType = config.getGlobalAiType();
        // 检查是否是Codesphere
        if ("codesphere".equalsIgnoreCase(modelType) && config.getAiModelConfig() != null && config.getAiModelConfig().getCodesphereConfig() != null) {
            var codesphereConfig = config.getAiModelConfig().getCodesphereConfig();
            log.info("使用Codesphere配置 - ApiKey: {}, ModelName: {}", 
                codesphereConfig.getApiKey() != null ? "已设置" : "null", 
                codesphereConfig.getModelName());
            return new ServiceConfig(
                codesphereConfig.getApiKey(),
                codesphereConfig.getModelName(),
                "https://api.master-jsx.top",
                modelType
            );
        } 
        // 默认使用OpenAI配置
        else if (config.getAiModelConfig() != null && config.getAiModelConfig().getOpenAiConfig() != null) {
            var openAiConfig = config.getAiModelConfig().getOpenAiConfig();
            return new ServiceConfig(
                openAiConfig.getApiKey(),
                openAiConfig.getModelName(),
                openAiConfig.getBaseUrl(),
                modelType
            );
        }
        
        // 如果都没有配置，抛出异常
        log.info("配置获取失败 - AI类型: {}, AiModelConfig: {}", modelType, config.getAiModelConfig());
        throw new RuntimeException("未找到有效的AI配置：" + modelType);
    }

    /**
     * 构建API URL。
     * @param baseUrl 基础URL
     * @param endpoint API端点，默认为"/v1/chat/completions"
     * @return 完整的API URL
     */
    private String buildApiUrl(String baseUrl, String endpoint) {
        if (endpoint == null || endpoint.isEmpty()) {
            endpoint = "/v1/chat/completions";
        }
        
        if (baseUrl != null && !baseUrl.isBlank()) {
            String base = baseUrl.replaceAll("/+$", "");
            if (!base.endsWith(endpoint)) {
                return base + endpoint;
            } else {
                return base;
            }
        } else {
            return "https://api.openai.com" + endpoint;
        }
    }

    /**
     * 设置HTTP连接的通用配置。
     * @param apiUrl API URL
     * @param apiKey API密钥
     * @param modelType 模型类型
     * @return 配置好的HTTP连接
     * @throws IOException 连接异常
     */
    private HttpURLConnection setupConnection(String apiUrl, String apiKey, String modelType) throws IOException {
        URL url = URI.create(apiUrl).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        if ("codesphere".equalsIgnoreCase(modelType)) {
            conn.setRequestProperty("Accept", "application/json");
        }
        conn.setDoOutput(true);
        return conn;
    }

    /**
     * 构建OpenAI聊天请求体。
     * @param modelName 模型名称
     * @param messages 消息数组
     * @return JSON请求体字符串
     * @throws Exception JSON序列化异常
     */
    private String buildChatRequest(String modelName, ArrayNode messages) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        root.put("model", modelName);
        root.set("messages", messages);
        return mapper.writeValueAsString(root);
    }

    /**
     * 调用OpenAI服务，返回完整原始响应JSON字符串。
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（API Key、模型名、BaseUrl等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     * @throws RuntimeException 网络异常或API异常时抛出
     */
    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        try {
            // 获取服务配置
            ServiceConfig serviceConfig = getServiceConfig(config);
            
            // 构建API URL
            String apiUrl = buildApiUrl(serviceConfig.baseUrl(), "/v1/chat/completions");
            
            // 设置连接
            HttpURLConnection conn = setupConnection(apiUrl, serviceConfig.apiKey(), serviceConfig.modelType());
            
            // 构建消息数组
            ObjectMapper mapper = new ObjectMapper();
            ArrayNode messages = mapper.createArrayNode();
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", prompt);
            
            // 构建请求体
            String body = buildChatRequest(serviceConfig.modelName(), messages);

            return getOutputStream(conn, body);
        } catch (IOException e) {
            log.error("OpenAI API网络连接异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 网络连接异常：" + e.getMessage() + "]";
        } catch (Exception e) {
            log.error("OpenAI API调用异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 摘要生成异常：" + e.getMessage() + "]";
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
            // 获取服务配置
            ServiceConfig serviceConfig = getServiceConfig(config);
            
            // 构建API URL
            String apiUrl = buildApiUrl(serviceConfig.baseUrl(), "/v1/chat/completions");
            
            // 设置连接
            HttpURLConnection conn = setupConnection(apiUrl, serviceConfig.apiKey(), serviceConfig.modelType());
            
            // 解析对话历史并添加系统提示
            ObjectMapper mapper = new ObjectMapper();
            ArrayNode messagesArray = AiServiceUtils.parseConversationHistoryWithSystemPrompt(conversationHistory, systemPrompt, mapper);
            
            // 构建请求体
            String body = buildChatRequest(serviceConfig.modelName(), messagesArray);

            return getOutputStream(conn, body);
        } catch (IOException e) {
            log.error("多轮对话网络连接异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 网络连接异常：" + e.getMessage() + "]";
        } catch (Exception e) {
            log.error("多轮对话处理异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 多轮对话异常：" + e.getMessage() + "]";
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
            // 获取服务配置
            ServiceConfig serviceConfig = getServiceConfig(config);
            
            // 构建API URL
            String apiUrl = buildApiUrl(serviceConfig.baseUrl(), "/v1/chat/completions");
            
            // 设置连接
            HttpURLConnection conn = setupConnection(apiUrl, serviceConfig.apiKey(), serviceConfig.modelType());
            
            // 解析对话历史并添加系统提示
            ObjectMapper mapper = new ObjectMapper();
            ArrayNode messagesArray = AiServiceUtils.parseConversationHistoryWithSystemPrompt(conversationHistory, systemPrompt, mapper);
            
            // 构建流式请求体
            String body = buildStreamChatRequest(serviceConfig.modelName(), messagesArray);
            
            // 发送请求并处理流式响应
            processStreamResponse(conn, body, onData, onComplete, onError);
            
        } catch (IOException e) {
            log.error("OpenAI流式多轮对话网络连接异常: {}", e.getMessage(), e);
            onError.accept("[" + config.getGlobalAiType() + " 网络连接异常：" + e.getMessage() + "]");
        } catch (Exception e) {
            log.error("OpenAI流式多轮对话处理异常: {}", e.getMessage(), e);
            onError.accept("[" + config.getGlobalAiType() + " 流式对话异常：" + e.getMessage() + "]");
        }
    }

    /**
     * 构建OpenAI流式聊天请求体。
     * @param modelName 模型名称
     * @param messages 消息数组
     * @return JSON请求体字符串
     * @throws Exception JSON序列化异常
     */
    private String buildStreamChatRequest(String modelName, ArrayNode messages) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        root.put("model", modelName);
        root.set("messages", messages);
        root.put("stream", true);
        return mapper.writeValueAsString(root);
    }

    /**
     * 处理流式响应，逐行读取并解析SSE数据。
     * @param conn HTTP连接
     * @param body 请求体
     * @param onData 数据回调函数
     * @param onComplete 完成回调函数
     * @param onError 错误回调函数
     */
    private void processStreamResponse(HttpURLConnection conn, String body, 
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
                
                try {
                    // 解析JSON数据并提取内容
                    AiServiceUtils.parseStreamResponse(onData, mapper, data);
                } catch (Exception e) {
                    log.warn("解析流式数据失败: {}", e.getMessage());
                    // 继续处理下一行，不中断整个流程
                }
            }
            
        } catch (IOException e) {
            log.error("读取流式响应异常: {}", e.getMessage(), e);
            onError.accept("读取响应失败：" + e.getMessage());
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