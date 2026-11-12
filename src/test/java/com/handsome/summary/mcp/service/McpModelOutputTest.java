package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import run.halo.aifoundation.message.ModelMessage;
import run.halo.aifoundation.message.ModelMessagePart;
import run.halo.aifoundation.tool.ToolResult;

class McpModelOutputTest {
    @Test
    void excludesImagePayloadFromModelContextWithoutMutatingUiResults() {
        var output = Map.of("kind", "mcp", "content", List.of(
            Map.of("type", "image", "mimeType", "image/png", "data", "very-large-base64"),
            Map.of("type", "text", "text", "资料正文")));
        var part = ModelMessagePart.toolResult(ToolResult.builder().toolCallId("call-1")
            .toolName("mcp_123456789abc_read").result(output).build());
        part.setProviderOptions(Map.of("provider", Map.of("trace", "preserved")));
        var messages = List.of(ModelMessage.user("用户问题"), ModelMessage.tool(List.of(part)));
        var prepared = McpModelOutput.prepare(messages);
        assertThat(prepared.toString()).doesNotContain("very-large-base64").contains("资料正文", "用户问题");
        assertThat(messages.toString()).contains("very-large-base64");
        assertThat(prepared.get(1).getContent().getFirst().getToolCallId()).isEqualTo("call-1");
        assertThat(prepared.get(1).getContent().getFirst().getProviderOptions())
            .isEqualTo(part.getProviderOptions());
    }
}
