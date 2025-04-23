
package com.handsome.summary.service;
import dev.langchain4j.model.chat.response.ChatResponse;

/**
 * AI服务接口
 * 提供多种AI模型的聊天功能
 *
 * @author handsome
 */
public interface AiService {

    /**
     * OpenAI聊天接口
     *
     * @param apiKey    API密钥
     * @param modelName 模型名称
     * @param baseUrl   API基础URL
     * @param role      角色设定
     * @param content   聊天内容
     * @return 聊天响应
     */

    ChatResponse openAiChat(String apiKey, String modelName, String baseUrl, String role,
                            String content);

    /**
     * 千帆大模型聊天接口
     *
     * @param apiKey    API密钥
     * @param secretKey 密钥
     * @param modelName 模型名称
     * @param role      角色设定
     * @param content   聊天内容
     * @return 聊天响应
     */

    ChatResponse qianfanChat(String apiKey, String secretKey, String modelName, String role,
                             String content);


    /**
     * 智谱AI聊天接口
     *
     * @param apiKey    API密钥
     * @param modelName 模型名称
     * @param role      角色设定
     * @param content   聊天内容
     * @return 聊天响应
     */
    ChatResponse zhipuAiChat(String apiKey, String modelName, String role, String content);


    /**
     * 通义千问聊天接口
     *
     * @param apiKey    API密钥
     * @param modelName 模型名称
     * @param role      角色设定
     * @param content   聊天内容
     * @return 聊天响应
     *//*
     */
    ChatResponse qwenAiChat(String apiKey, String modelName, String role, String content);

    ChatResponse geminiChat(String key, String modelName, String role, String content);
}
