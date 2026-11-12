package com.handsome.summary.mcp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/** Server-only settings. Never include this object in the public dialog configuration. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record McpSettings(Boolean enabled, List<Server> servers) {
    public McpSettings {
        enabled = Boolean.TRUE.equals(enabled);
        servers = servers == null ? List.of() : List.copyOf(servers);
    }

    public static McpSettings defaults() {
        return new McpSettings(false, List.of());
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Server(String id, String name, Boolean enabled, String url, String token,
                         List<Header> headers, Boolean allowPrivateNetwork, Integer timeoutSeconds,
                         List<ToolPolicy> tools) {
        public Server {
            enabled = Boolean.TRUE.equals(enabled);
            allowPrivateNetwork = Boolean.TRUE.equals(allowPrivateNetwork);
            timeoutSeconds = timeoutSeconds == null ? 20 : Math.clamp(timeoutSeconds, 3, 60);
            headers = headers == null ? List.of() : List.copyOf(headers);
            tools = tools == null ? List.of() : List.copyOf(tools);
        }

        @Override
        public String toString() {
            return "McpServer[id=" + id + "]";
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Header(String name, String value) {
        @Override
        public String toString() {
            return "McpHeader[name=" + name + "]";
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ToolPolicy(String name, Boolean enabled, Boolean requireApproval,
                             Boolean authenticatedOnly, String label, String prompt) {
        public ToolPolicy(String name, Boolean enabled, Boolean requireApproval, Boolean authenticatedOnly) {
            this(name, enabled, requireApproval, authenticatedOnly, "", "");
        }
        public ToolPolicy {
            enabled = Boolean.TRUE.equals(enabled);
            requireApproval = !Boolean.FALSE.equals(requireApproval);
            authenticatedOnly = Boolean.TRUE.equals(authenticatedOnly);
            label = label == null ? "" : label.strip();
            prompt = prompt == null ? "" : prompt.strip();
        }
    }
}
