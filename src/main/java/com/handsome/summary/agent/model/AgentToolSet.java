package com.handsome.summary.agent.model;

import java.util.List;
import run.halo.aifoundation.tool.ToolDefinition;

public record AgentToolSet(
    boolean agentEnabled,
    List<ToolDefinition> tools
) {
    public static AgentToolSet disabled() {
        return new AgentToolSet(false, List.of());
    }
}
