package com.handsome.summary.service;

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
} 