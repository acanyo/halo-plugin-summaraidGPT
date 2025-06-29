package com.handsome.summary.service;

import lombok.Builder;
import lombok.Value;

/**
 * AI聊天响应模型
 *
 * @author handsome
 */
@Value
@Builder
public class AiChatResponse {
    String content;
    String modelName;
    long tokenUsage;
    long finishReason;
} 