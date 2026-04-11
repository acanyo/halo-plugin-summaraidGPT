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
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * MiniMax 独立服务实现。
 * 采用 MiniMax 官方当前推荐的 Anthropic 兼容接口。
 */
@Component
@Slf4j
public class MiniMaxAiService implements AiService {
    private static final String DEFAULT_BASE_URL = "https://api.minimaxi.com/anthropic";
    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final int DEFAULT_MAX_TOKENS = 4096;

    private record MiniMaxRequest(HttpURLConnection conn, ObjectMapper mapper, ObjectNode root) {
    }

    @Override
    public String getType() {
        return "miniMax";
    }

    private MiniMaxRequest createMiniMaxRequest(BasicConfig config, boolean isStream)
        throws Exception {
        if (config.getAiModelConfig() == null || config.getAiModelConfig().getMiniMaxConfig() == null) {
            throw new RuntimeException("未找到有效的MiniMax AI配置：" + config.getGlobalAiType());
        }

        var miniMaxConfig = config.getAiModelConfig().getMiniMaxConfig();
        String apiKey = miniMaxConfig.getApiKey();
        String modelName = miniMaxConfig.getModelName();
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("MiniMax API Key 未配置");
        }
        if (modelName == null || modelName.isBlank()) {
            throw new RuntimeException("MiniMax 模型名称未配置");
        }

        URL url = URI.create(buildApiUrl(DEFAULT_BASE_URL)).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("x-api-key", apiKey);
        conn.setRequestProperty("anthropic-version", ANTHROPIC_VERSION);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Accept", isStream ? "text/event-stream" : "application/json");
        conn.setDoOutput(true);

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        root.put("model", modelName);
        root.put("max_tokens", DEFAULT_MAX_TOKENS);
        if (isStream) {
            root.put("stream", true);
        }

        return new MiniMaxRequest(conn, mapper, root);
    }

    private String buildApiUrl(String baseUrl) {
        String base = baseUrl.replaceAll("/+$", "");
        if (base.endsWith("/v1/messages")) {
            return base;
        }
        if (base.endsWith("/anthropic")) {
            return base + "/v1/messages";
        }
        if (base.endsWith("/v1")) {
            return base + "/messages";
        }
        return base + "/v1/messages";
    }

    @Override
    public String chatCompletionRaw(String prompt, BasicConfig config) {
        try {
            var request = createMiniMaxRequest(config, false);
            ArrayNode messages = request.root().putArray("messages");
            AiServiceUtils.addAnthropicMessageSafely(messages, "user", prompt);

            String body = request.mapper().writeValueAsString(request.root());
            return AiServiceUtils.getOutputStream(request.conn(), body);
        } catch (Exception e) {
            log.error("MiniMax API调用异常: {}", e.getMessage(), e);
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

    private String processMultiTurnChatSync(String conversationHistory, String systemPrompt,
        BasicConfig config) {
        try {
            var request = createMiniMaxRequest(config, false);
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                request.root().put("system", systemPrompt);
            }

            ArrayNode messages = AiServiceUtils.parseConversationHistoryForAnthropic(
                conversationHistory, request.mapper());
            request.root().set("messages", messages);

            String body = request.mapper().writeValueAsString(request.root());
            return AiServiceUtils.getOutputStream(request.conn(), body);
        } catch (Exception e) {
            log.error("MiniMax 多轮对话处理异常: {}", e.getMessage(), e);
            return "[" + config.getGlobalAiType() + " 多轮对话异常：" + e.getMessage() + "]";
        }
    }

    private void processMultiTurnChatStream(String conversationHistory, String systemPrompt,
        BasicConfig config,
        Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        try {
            var request = createMiniMaxRequest(config, true);
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                request.root().put("system", systemPrompt);
            }

            ArrayNode messages = AiServiceUtils.parseConversationHistoryForAnthropic(
                conversationHistory, request.mapper());
            request.root().set("messages", messages);

            String body = request.mapper().writeValueAsString(request.root());
            processStreamResponse(request.conn(), body, onData, onComplete, onError);

        } catch (Exception e) {
            log.error("MiniMax 流式多轮对话处理异常: {}", e.getMessage(), e);
            onError.accept("[" + config.getGlobalAiType() + " 流式对话异常：" + e.getMessage() + "]");
        }
    }

    private void processStreamResponse(HttpURLConnection conn, String body,
        Consumer<String> onData, Runnable onComplete, Consumer<String> onError) {
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            onError.accept("发送请求失败：" + e.getMessage());
            return;
        }

        try (BufferedReader br = new BufferedReader(
            new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            ObjectMapper mapper = new ObjectMapper();

            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty() || !line.startsWith("data: ")) {
                    continue;
                }

                String data = line.substring(6);
                if ("[DONE]".equals(data.trim())) {
                    onComplete.run();
                    break;
                }

                AiServiceUtils.parseStreamResponse(onData, mapper, data);
            }

        } catch (IOException e) {
            log.error("读取 MiniMax 流式响应异常: {}", e.getMessage(), e);
            onError.accept("读取响应失败：" + e.getMessage());
        }
    }
}
