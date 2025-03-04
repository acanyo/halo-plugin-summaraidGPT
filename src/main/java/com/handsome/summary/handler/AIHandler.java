package com.handsome.summary.handler;

import com.fasterxml.jackson.databind.JsonNode;
import reactor.core.publisher.Mono;
import java.util.Collections;
import java.util.List;

/**
 * AI处理器通用接口
 * 实现要求：
 * 1. 每个AI服务商需要实现该接口
 * 2. 实现类必须标注@AIProvider注解
 * 3. 使用WebClient进行非阻塞HTTP调用
 */

public interface AIHandler {
    /**
     * 认证并获取访问凭证
     *
     * @param config 配置节点（包含syName和对应平台的配置参数）
     * @return 认证信息包装（包含token、有效期等）
     */
    Mono<String> authenticate(JsonNode config);

    /**
     * 执行对话请求
     *
     * @param authToken Token信息
     * @return 标准化响应格式
     */
    Mono<String> executeChat(String authToken);

    /**
     * 获取支持的模型列表
     *
     * @return 该平台支持的模型标识列表
     */
    default List<String> supportedModels() {
        return Collections.emptyList();
    }
}
