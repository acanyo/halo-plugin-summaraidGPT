package com.handsome.summary.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.service.AiChatResponse;
import com.handsome.summary.service.AiService;
import com.handsome.summary.service.SettingConfigGetter.BasicConfig;
import com.handsome.summary.util.AiConfigValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * AI服务实现类
 * 实现多种AI模型的聊天功能
 *
 * @author handsome
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AiChatResponse chat(BasicConfig config, String content) {
        // 验证配置
        AiConfigValidator.validateBasicConfig(config);
        AiConfigValidator.validateContent(content);

        // 根据模型类型调用对应的API
        return switch (config.getModelType()) {
            case "openAi" -> openAiChat(
                config.getOpenAiApiKey(),
                config.getOpenAiModelName(),
                config.getBaseUrl(),
                config.getAiSystem(),
                content
            );
            case "zhipuAi" -> zhipuAiChat(
                config.getZhipuAiApiKey(),
                config.getZhipuAiModelName(),
                config.getAiSystem(),
                content
            );
            case "dashScope" -> qwenAiChat(
                config.getDashScopeApiKey(),
                config.getDashScopeModelName(),
                config.getAiSystem(),
                content
            );
            default -> throw new IllegalArgumentException("不支持的模型类型: " + config.getModelType());
        };
    }

    @Override
    public AiChatResponse openAiChat(String apiKey, String modelName, String baseUrl, String role,
                                   String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            log.debug("开始调用OpenAI API, model: {}, role: {}", modelName, role);

            // 使用字符串模板处理URL
            String url = StringUtils.hasText(baseUrl) ? 
                baseUrl : 
                "https://api.openai.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(
                    Map.of("role", "system", "content", role),
                    Map.of("role", "user", "content", content)
                ),
                "max_tokens", 2000,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            
            // 使用模式匹配提取响应数据
            var result = extractResponseData(responseJson);
            String aiMessage = result.aiMessage();
            long tokenUsage = result.tokenUsage();

            log.debug("OpenAI API调用成功");
            return AiChatResponse.builder()
                .content(aiMessage)
                .modelName(modelName)
                .tokenUsage(tokenUsage)
                .finishReason(1)
                .build();
        } catch (Exception e) {
            log.error("OpenAI API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("OpenAI API调用失败", e);
        }
    }

    @Override
    public AiChatResponse zhipuAiChat(String apiKey, String modelName, String role, String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            log.debug("开始调用智谱AI API, model: {}, role: {}", modelName, role);

            String url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(
                    Map.of("role", "user", "content", role + "\n" + content)
                ),
                "max_tokens", 2000,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String aiMessage = responseJson.get("choices").get(0).get("message").get("content").asText();
            long tokenUsage = responseJson.path("usage").path("total_tokens").asLong(0);

            log.debug("智谱AI API调用成功");
            return AiChatResponse.builder()
                .content(aiMessage)
                .modelName(modelName)
                .tokenUsage(tokenUsage)
                .finishReason(1)
                .build();
        } catch (Exception e) {
            log.error("智谱AI API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("智谱AI API调用失败", e);
        }
    }

    @Override
    public AiChatResponse qwenAiChat(String apiKey, String modelName, String role, String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            log.debug("开始调用通义千问API, model: {}, role: {}", modelName, role);

            String url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "input", Map.of(
                    "messages", List.of(
                        Map.of("role", "user", "content", role + "\n" + content)
                    )
                ),
                "parameters", Map.of(
                    "max_tokens", 2000,
                    "temperature", 0.7
                )
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String aiMessage = responseJson.get("output").get("text").asText();

            log.debug("通义千问API调用成功");
            return AiChatResponse.builder()
                .content(aiMessage)
                .modelName(modelName)
                .tokenUsage(0)
                .finishReason(1)
                .build();
        } catch (Exception e) {
            log.error("通义千问API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("通义千问API调用失败", e);
        }
    }



    /**
     * 响应数据记录类
     */
    private record ResponseData(String aiMessage, long tokenUsage) {}

    /**
     * 从响应中提取AI消息内容和token使用情况
     */
    private ResponseData extractResponseData(JsonNode responseJson) {
        // 使用模式匹配检查响应结构
        if (responseJson.has("choices") && responseJson.get("choices").isArray() && 
            !responseJson.get("choices").isEmpty()) {
            
            JsonNode choice = responseJson.get("choices").get(0);
            String aiMessage = switch (choice) {
                case JsonNode c when c.has("message") && c.get("message").has("content") -> 
                    c.get("message").get("content").asText();
                case JsonNode c when c.has("text") -> 
                    c.get("text").asText();
                default -> throw new RuntimeException("无法解析AI响应内容");
            };
            
            long tokenUsage = extractTokenUsage(responseJson);
            return new ResponseData(aiMessage, tokenUsage);
        }
        throw new RuntimeException("AI响应格式不正确");
    }

    /**
     * 从响应中提取token使用情况
     */
    private long extractTokenUsage(JsonNode responseJson) {
        return switch (responseJson) {
            case JsonNode r when r.has("usage") -> {
                JsonNode usage = r.get("usage");
                yield switch (usage) {
                    case JsonNode u when u.has("total_tokens") -> u.get("total_tokens").asLong();
                    case JsonNode u when u.has("prompt_tokens") && u.has("completion_tokens") -> 
                        u.get("prompt_tokens").asLong() + u.get("completion_tokens").asLong();
                    default -> 0L;
                };
            }
            default -> 0L;
        };
    }

    /**
     * 验证参数
     */
    private void validateParams(String apiKey, String modelName, String role, String content) {
        Assert.hasText(apiKey, "API Key不能为空");
        Assert.hasText(modelName, "模型名称不能为空");
        Assert.hasText(role, "角色设定不能为空");
        Assert.hasText(content, "聊天内容不能为空");
    }
} 