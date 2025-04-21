package com.handsome.summary.service;

import com.fasterxml.jackson.databind.JsonNode;
import reactor.core.publisher.Mono;

public interface ConfigCenter {
    /**
     * 根据分组名称获取应用配置（响应式接口）
     * @param groupName 配置分组名称（例如：user-ai-config）
     * @return 包含所有配置项的JsonNode
     */
    Mono<JsonNode> getAppConfigsByGroupName(String groupName);
}