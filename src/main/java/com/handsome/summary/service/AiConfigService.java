package com.handsome.summary.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * AI配置服务 - 提供通用的AI配置获取和服务实例获取功能
 */
@Service
public class AiConfigService {
    
    private final SettingConfigGetter settingConfigGetter;
    private final AiServiceFactory aiServiceFactory;
    
    public AiConfigService(SettingConfigGetter settingConfigGetter, AiServiceFactory aiServiceFactory) {
        this.settingConfigGetter = settingConfigGetter;
        this.aiServiceFactory = aiServiceFactory;
    }
    
    /**
     * 获取指定功能的AI服务实例
     * @param functionType 功能类型：summary, tags, conversation
     * @return AI服务实例
     */
    public Mono<AiService> getAiServiceForFunction(String functionType) {
        return settingConfigGetter.getAiConfigForFunction(functionType)
            .map(config -> aiServiceFactory.getService(config.getAiType()));
    }
    
    /**
     * 获取指定功能的完整AI配置
     * @param functionType 功能类型：summary, tags, conversation
     * @return 完整的AI配置信息
     */
    public Mono<SettingConfigGetter.AiConfigResult> getAiConfigForFunction(String functionType) {
        return settingConfigGetter.getAiConfigForFunction(functionType);
    }
    
    /**
     * 创建兼容旧版BasicConfig的配置对象
     * @param aiConfigResult 新的AI配置结果
     * @return 兼容旧版的BasicConfig对象
     */
    public SettingConfigGetter.BasicConfig createCompatibleBasicConfig(SettingConfigGetter.AiConfigResult aiConfigResult) {
        return AiServiceUtils.toBasicConfig(aiConfigResult);
    }
}
