package com.handsome.summary.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ChatCompletionResponse {
    /**
     * 本轮对话的ID
     */
    private String id;

    /**
     * 返回类型
     * chat.completion：多轮对话返回
     */
    private String object;

    /**
     * 创建时间戳
     */
    private Integer created;

    /**
     * 当前子句序号（仅流式接口返回）
     */
    @JsonProperty("sentence_id")
    private Integer sentenceId;

    /**
     * 是否是最后一句（仅流式接口返回）
     */
    @JsonProperty("is_end")
    private Boolean isEnd;

    /**
     * 结果是否被截断
     */
    @JsonProperty("is_truncated")
    private Boolean isTruncated;

    /**
     * 对话返回结果
     */
    private String result;

    /**
     * 是否需要清理历史
     */
    @JsonProperty("need_clear_history")
    private Boolean needClearHistory;

    /**
     * 敏感对话轮次（当needClearHistory为true时有效）
     */
    @JsonProperty("ban_round")
    private Integer banRound;

    /**
     * Token使用情况
     */
    private Usage usage;

    @JsonProperty("error_code")
    private String errorCode;

    @JsonProperty("error_msg")
    private String errorMsg;
    @Data
    public static class Usage {
        /**
         * 问题tokens数
         */
        @JsonProperty("prompt_tokens")
        private Integer promptTokens;

        /**
         * 回答tokens数
         */
        @JsonProperty("completion_tokens")
        private Integer completionTokens;

        /**
         * tokens总数
         */
        @JsonProperty("total_tokens")
        private Integer totalTokens;
    }
}
