
package com.handsome.summary.service.impl;

import com.handsome.summary.service.AiService;
import dev.langchain4j.community.model.dashscope.QwenChatModel;
import dev.langchain4j.community.model.qianfan.QianfanChatModel;
import dev.langchain4j.community.model.zhipu.ZhipuAiChatModel;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import java.time.Duration;

/**
 * AI服务实现类
 * 实现多种AI模型的聊天功能
 *
 * @author handsome
 */

@Component
@Slf4j
public class AiServiceImpl implements AiService {

    @Override
    public ChatResponse openAiChat(String apiKey, String modelName, String baseUrl, String role,
        String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            log.debug("开始调用OpenAI API, model: {}, role: {}", modelName, role);
            OpenAiChatModel openAiChatModel = OpenAiChatModel.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .modelName(modelName)
                .build();
            UserMessage userMessage = createUserMessage(role, content);
            ChatResponse response = openAiChatModel.chat(userMessage);

            log.debug("OpenAI API调用成功");
            return response;
        } catch (Exception e) {
            log.error("OpenAI API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("OpenAI API调用失败", e);
        }
    }

    @Override
    public ChatResponse qianfanChat(String apiKey, String secretKey, String modelName, String role,
        String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            Assert.hasText(secretKey, "SecretKey不能为空");
            log.debug("开始调用千帆API, model: {}, role: {}", modelName, role);

            QianfanChatModel qianfanChatModel = QianfanChatModel.builder()
                .apiKey(apiKey)
                .secretKey(secretKey)
                .modelName(modelName)
                .build();
            UserMessage userMessage =  UserMessage.from(
                TextContent.from(role+content)
            );
            ChatResponse response = qianfanChatModel.chat(userMessage);

            log.debug("千帆API调用成功");
            return response;
        } catch (Exception e) {
            log.error("千帆API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("千帆API调用失败", e);
        }
    }

    @Override
    public ChatResponse zhipuAiChat(String apiKey, String modelName, String role, String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            log.debug("开始调用智谱AI API, model: {}, role: {}", modelName, role);

            ZhipuAiChatModel zhipuAiChatModel = ZhipuAiChatModel.builder()
                .apiKey(apiKey)
                .model(modelName)
                .callTimeout(Duration.ofSeconds(60))
                .connectTimeout(Duration.ofSeconds(60))
                .writeTimeout(Duration.ofSeconds(60))
                .readTimeout(Duration.ofSeconds(60))
                .build();

            UserMessage userMessage = createUserMessage(role, content);
            ChatResponse response = zhipuAiChatModel.chat(userMessage);

            log.debug("智谱AI API调用成功");
            return response;
        } catch (Exception e) {
            log.error("智谱AI API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("智谱AI API调用失败", e);
        }
    }

    @Override
    public ChatResponse qwenAiChat(String apiKey, String modelName, String role, String content) {
        try {
            validateParams(apiKey, modelName, role, content);
            log.debug("开始调用通义千问API, model: {}, role: {}", modelName, role);

            UserMessage userMessage = createUserMessage(role, content);
            ChatResponse response = QwenChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .build()
                .chat(userMessage);

            log.debug("通义千问API调用成功");
            return response;
        } catch (Exception e) {
            log.error("通义千问API调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("通义千问API调用失败", e);
        }
    }

    /**
     * 验证参数
     *
     * @param apiKey API密钥
     * @param modelName 模型名称
     * @param role 角色设定
     * @param content 聊天内容
     */

    private void validateParams(String apiKey, String modelName, String role, String content) {
        Assert.hasText(apiKey, "API Key不能为空");
        Assert.hasText(modelName, "模型名称不能为空");
        Assert.hasText(role, "角色设定不能为空");
        Assert.hasText(content, "聊天内容不能为空");
    }

    /**
     * 创建用户消息
     *
     * @param role 角色设定
     * @param content 聊天内容
     * @return 用户消息
     */

    private UserMessage createUserMessage(String role, String content) {
        return UserMessage.from(
            TextContent.from(role),
            TextContent.from(content)
        );
    }

    @Override
    public ChatResponse geminiChat(String key, String modelName, String role, String content) {
        UserMessage userMessage = UserMessage.from(
            TextContent.from(role),
            TextContent.from(content)
        );
        return GoogleAiGeminiChatModel.builder()
            .apiKey(key)
            .modelName(modelName)
            .build().chat(userMessage);
    }
}

