package com.handsome.summary.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * AI服务工厂类。
 * <p>
 * 自动注入所有实现，按类型分发。
 * 扩展说明：如需新增AI服务实现，只需实现AiService接口并声明@Component即可自动被收集。
 * 如modelType未匹配任何实现，默认返回第一个可用实现。
 * </p>
 */
@Component
public class AiServiceFactory {
    private final Map<String, AiService> serviceMap;

    @Autowired
    public AiServiceFactory(List<AiService> services) {
        this.serviceMap = services.stream().collect(Collectors.toMap(AiService::getType, s -> s));
    }

    /**
     * 根据modelType返回对应的AiService实现。
     * @param modelType AI类型（如 openAi/zhipuAi/dashScope）
     * @return 对应的AiService实现，如无匹配类型则返回第一个可用实现
     * @throws RuntimeException 若无任何可用实现时抛出
     */
    public AiService getService(String modelType) {
        if ("codesphere".equalsIgnoreCase(modelType) || "siliconFlow".equalsIgnoreCase(modelType)) {
            return serviceMap.getOrDefault("openAi", serviceMap.values().stream().findFirst().orElseThrow());
        }
        return serviceMap.getOrDefault(modelType, serviceMap.values().stream().findFirst().orElseThrow());
    }
} 