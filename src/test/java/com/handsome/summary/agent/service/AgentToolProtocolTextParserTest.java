package com.handsome.summary.agent.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.agent.model.AgentToolSet;
import java.util.List;
import org.junit.jupiter.api.Test;
import run.halo.aifoundation.tool.ToolDefinition;

class AgentToolProtocolTextParserTest {

    private final AgentToolProtocolTextParser parser =
        new AgentToolProtocolTextParser(new ObjectMapper());

    @Test
    void parsesChineseToolProtocolAlias() {
        var toolSet = new AgentToolSet(true, List.of(
            ToolDefinition.builder().name("get_pages").build()
        ));
        var text = "我来帮你找找友情链接页面。"
            + "<|tool_calls_section_begin|>"
            + "<|tool_call_begin|>functions.站内页面列表:1"
            + "<|tool_call_argument_begin|>{\"keyword\":\"友链\"}"
            + "<|tool_call_end|><|tool_calls_section_end|>";

        var calls = parser.parse(text, toolSet);

        assertThat(calls).hasSize(1);
        assertThat(calls.getFirst().toolCallId()).isEqualTo("compat-1");
        assertThat(calls.getFirst().toolName()).isEqualTo("get_pages");
        assertThat(calls.getFirst().input()).containsEntry("keyword", "友链");
    }

    @Test
    void ignoresUnknownToolProtocolText() {
        var toolSet = new AgentToolSet(true, List.of(
            ToolDefinition.builder().name("get_pages").build()
        ));
        var text = "<|tool_call_begin|>functions.不存在的工具:1"
            + "<|tool_call_argument_begin|>{\"keyword\":\"友链\"}"
            + "<|tool_call_end|>";

        assertThat(parser.parse(text, toolSet)).isEmpty();
    }
}
