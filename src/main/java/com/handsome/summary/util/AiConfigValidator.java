package com.handsome.summary.util;

import com.handsome.summary.service.SettingConfigGetter.BasicConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

/**
 * AI配置验证工具类
 * 统一处理AI配置的验证逻辑
 *
 * @author handsome
 */
@Slf4j
public class AiConfigValidator {

    /**
     * 验证基础配置
     *
     * @param config 基础配置
     * @throws IllegalArgumentException 配置无效时抛出异常
     */
    public static void validateBasicConfig(BasicConfig config) {
        Assert.notNull(config, "配置不能为空");
        Assert.hasText(config.getModelType(), "模型类型不能为空");
        
        // 根据模型类型验证对应的配置
        switch (config.getModelType()) {
            case "openAi" -> validateOpenAiConfig(config);
            case "zhipuAi" -> validateZhipuAiConfig(config);
            case "dashScope" -> validateDashScopeConfig(config);
            default -> throw new IllegalArgumentException("不支持的模型类型: " + config.getModelType());
        }
    }

    /**
     * 验证OpenAI配置
     */
    private static void validateOpenAiConfig(BasicConfig config) {
        Assert.hasText(config.getOpenAiApiKey(), "OpenAI API Key不能为空");
        Assert.hasText(config.getOpenAiModelName(), "OpenAI模型名称不能为空");
        
        if (StringUtils.hasText(config.getBaseUrl())) {
            log.debug("使用自定义OpenAI API地址: {}", config.getBaseUrl());
        }
    }

    /**
     * 验证智谱AI配置
     */
    private static void validateZhipuAiConfig(BasicConfig config) {
        Assert.hasText(config.getZhipuAiApiKey(), "智谱AI API Key不能为空");
        Assert.hasText(config.getZhipuAiModelName(), "智谱AI模型名称不能为空");
    }

    /**
     * 验证通义千问配置
     */
    private static void validateDashScopeConfig(BasicConfig config) {
        Assert.hasText(config.getDashScopeApiKey(), "通义千问API Key不能为空");
        Assert.hasText(config.getDashScopeModelName(), "通义千问模型名称不能为空");
    }

    /**
     * 验证内容参数
     *
     * @param content 内容
     * @throws IllegalArgumentException 内容无效时抛出异常
     */
    public static void validateContent(String content) {
        Assert.hasText(content, "聊天内容不能为空");
        if (content.length() > 8000) {
            log.warn("内容长度超过8000字符，可能会影响AI响应质量");
        }
    }

    /**
     * 检查AI功能是否启用
     *
     * @param config 基础配置
     * @return 是否启用
     */
    public static boolean isAiEnabled(BasicConfig config) {
        return config != null && !Boolean.TRUE.equals(config.getEnableAi());
    }

    /**
     * 获取模型类型描述
     *
     * @param modelType 模型类型
     * @return 模型类型描述
     */
    public static String getModelTypeDescription(String modelType) {
        return switch (modelType) {
            case "openAi" -> "OpenAI";
            case "zhipuAi" -> "智谱AI";
            case "dashScope" -> "通义千问";
            default -> "未知模型";
        };
    }
} 