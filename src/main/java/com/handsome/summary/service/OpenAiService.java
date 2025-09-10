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
    public String getType() {
        return "openAi";
    }

    /**
     * 创建OpenAI API连接和基础JSON结构
     */
    private record OpenAiRequest(HttpURLConnection conn, ObjectMapper mapper, ObjectNode root,
                                 ArrayNode messages) {
    }

    private OpenAiRequest createOpenAiRequest(BasicConfig config, boolean isStream)
        throws Exception {
        String modelType = config.getGlobalAiType();
        String apiKey, modelName, baseUrl;

        // 根据AI类型获取配置
        if ("codesphere".equalsIgnoreCase(modelType) && config.getAiModelConfig() != null
            && config.getAiModelConfig().getCodesphereConfig() != null) {
            var codesphereConfig = config.getAiModelConfig().getCodesphereConfig();
            apiKey = codesphereConfig.getApiKey();
            modelName = codesphereConfig.getModelName();
            baseUrl = "https://api.master-jsx.top";
            log.info("使用Codesphere配置 - ModelName: {}", modelName);
        } else if ("siliconFlow".equalsIgnoreCase(modelType) && config.getAiModelConfig() != null
            && config.getAiModelConfig().getSiliconFlowConfig() != null) {
            var siliconFlowConfig = config.getAiModelConfig().getSiliconFlowConfig();
            apiKey = siliconFlowConfig.getApiKey();
            modelName = siliconFlowConfig.getModelName();
            baseUrl =
                siliconFlowConfig.getBaseUrl() != null && !siliconFlowConfig.getBaseUrl().isEmpty()
                    ? siliconFlowConfig.getBaseUrl()
                    : "https://api.siliconflow.cn";
            log.info("使用硅基流动配置 - ModelName: {}, BaseUrl: {}", modelName, baseUrl);
        } else if (config.getAiModelConfig() != null
            && config.getAiModelConfig().getOpenAiConfig() != null) {
            var openAiConfig = config.getAiModelConfig().getOpenAiConfig();
            apiKey = openAiConfig.getApiKey();
            modelName = openAiConfig.getModelName();
            baseUrl = openAiConfig.getBaseUrl();
            log.info("使用OpenAI配置 - ModelName: {}, BaseUrl: {}", modelName, baseUrl);
        } else {
            throw new RuntimeException("未找到有效的AI配置：" + modelType);
        }

        // 构建API URL
        String apiUrl = buildApiUrl(baseUrl, "/v1/chat/completions");
        URL url = URI.create(apiUrl).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        if ("codesphere".equalsIgnoreCase(modelType) || "siliconFlow".equalsIgnoreCase(modelType)) {
            conn.setRequestProperty("Accept", "application/json");
        }
        conn.setDoOutput(true);

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        root.put("model", modelName);
        ArrayNode messages = root.putArray("messages");
        if (isStream) {
            root.put("stream", true);
        }

        return new OpenAiRequest(conn, mapper, root, messages);
    }

    /**
     * 构建API URL。
     *
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
     * 调用OpenAI服务，返回完整原始响应JSON字符串。
     *
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（API Key、模型名、BaseUrl等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     * @throws RuntimeException 网络异常或API异常时抛出
     */
    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        try {
            var request = createOpenAiRequest(config, false);

            // 添加用户消息
            ObjectNode message = request.messages().addObject();
            message.put("role", "user");
            message.put("content", prompt);

            String body = request.mapper().writeValueAsString(request.root());
            return AiServiceUtils.getOutputStream(request.conn(), body);
        } catch (Exception e) {
            log.error("OpenAI API调用异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 生成异常：" + e.getMessage() + "]";
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
                processMultiTurnChatStream(history, prompt, config, dataCallback, completeCallback,
                    errorCallback)
        );
    }

    /**
     * 处理同步多轮对话。
     *
     * @param conversationHistory 对话历史
     * @param systemPrompt 系统提示
     * @param config 配置
     * @return 完整响应
     */
    private String processMultiTurnChatSync(String conversationHistory, String systemPrompt,
        BasicConfig config) {
        try {
            var request = createOpenAiRequest(config, false);

            // 解析对话历史并添加系统提示
            ArrayNode messagesArray =
                AiServiceUtils.parseConversationHistoryWithSystemPrompt(conversationHistory,
                    systemPrompt, request.mapper());
            request.root().set("messages", messagesArray);

            String body = request.mapper().writeValueAsString(request.root());
            return AiServiceUtils.getOutputStream(request.conn(), body);
        } catch (Exception e) {
            log.error("多轮对话处理异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 多轮对话异常：" + e.getMessage() + "]";
        }
    }

    /**
     * 处理流式多轮对话。
     *
     * @param conversationHistory 对话历史
     * @param systemPrompt 系统提示
     * @param config 配置
     * @param onData 数据回调
     * @param onComplete 完成回调
     * @param onError 错误回调
     */
    private void processMultiTurnChatStream(String conversationHistory, String systemPrompt,
        BasicConfig config,
        Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        try {
            var request = createOpenAiRequest(config, true);

            // 解析对话历史并添加系统提示
            ArrayNode messagesArray =
                AiServiceUtils.parseConversationHistoryWithSystemPrompt(conversationHistory,
                    systemPrompt, request.mapper());
            request.root().set("messages", messagesArray);

            String body = request.mapper().writeValueAsString(request.root());

            // 发送请求并处理流式响应
            processStreamResponse(request.conn(), body, onData, onComplete, onError);

        } catch (Exception e) {
            log.error("OpenAI流式多轮对话处理异常: {}", e.getMessage(), e);
            onError.accept(
                "[" + config.getGlobalAiType() + " 流式对话异常：" + e.getMessage() + "]");
        }
    }


    /**
     * 处理流式响应，逐行读取并解析SSE数据。
     *
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
                // 解析JSON数据并提取内容
                AiServiceUtils.parseStreamResponse(onData, mapper, data);

            }

        } catch (IOException e) {
            log.error("读取流式响应异常: {}", e.getMessage(), e);
            onError.accept("读取响应失败：" + e.getMessage());
        }
    }


    @NotNull
    public String getOutputStream(HttpURLConnection conn, String body) throws IOException {
        return AiServiceUtils.getOutputStream(conn, body);
    }
} 