package com.handsome.summary.service;

import java.util.function.Consumer;

/**
 * AI服务统一接口。
 * <p>
 * 所有AI厂商实现需实现本接口，便于业务层解耦具体AI实现，支持后续灵活扩展。
 * 扩展说明：如需支持新AI厂商，实现本接口并在getType()返回唯一类型标识（如openAi/zhipuAi/dashScope），即可被工厂自动发现和分发。
 * </p>
 */
public interface AiService {
    /**
     * 返回AI类型标识（如 openAi/zhipuAi/dashScope），用于工厂分发。
     * @return 类型唯一标识字符串
     */
    String getType();

    /**
     * 调用AI服务，返回完整原始响应JSON字符串。
     * @param prompt 用户输入的提示词
     * @param config 当前AI相关配置（包含API Key、模型名、baseUrl等）
     * @return AI返回的完整原始响应JSON字符串，业务层可自行解析content、role、history等字段
     */
    String chatCompletionRaw(String prompt, SettingConfigGetter.BasicConfig config);

    /**
     * 多轮对话AI服务调用，返回完整原始响应JSON字符串。
     * @param conversationHistory 对话历史，JSON格式字符串，包含role和content字段
     * @param config 当前AI相关配置（包含API Key、模型名、baseUrl等）
     * @return AI返回的完整原始响应JSON字符串
     */
    default String multiTurnChat(String conversationHistory, SettingConfigGetter.BasicConfig config) {
        return multiTurnChat(conversationHistory, null, config, null, null, null);
    }

    /**
     * 多轮对话AI服务调用，支持系统提示和流式输出。
     * @param conversationHistory 对话历史，JSON格式字符串，包含role和content字段
     * @param systemPrompt 系统提示/角色设定，如果为空则不添加系统消息
     * @param config 当前AI相关配置（包含API Key、模型名、baseUrl等）
     * @param onData 数据块回调函数，每收到一个数据块就会调用一次，如果为null则使用非流式模式
     * @param onComplete 完成回调函数，流式传输完成时调用，如果为null则使用非流式模式
     * @param onError 错误回调函数，发生错误时调用，如果为null则使用非流式模式
     * @return 非流式模式时返回完整响应JSON字符串，流式模式时返回null
     */
    String multiTurnChat(String conversationHistory, String systemPrompt, SettingConfigGetter.BasicConfig config,
                        Consumer<String> onData, Runnable onComplete, Consumer<String> onError);
} 