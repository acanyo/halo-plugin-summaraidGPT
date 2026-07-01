package com.handsome.summary.agent.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.util.StringUtils;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AgentSettings(
    Boolean enabled,
    AgentBuiltInCapabilities builtIn,
    Object aiTools,
    AgentToolSecurity toolSecurity,
    AgentHaloSearchSettings haloSearch,
    AgentHaloResourceDetailSettings haloResourceDetail,
    AgentNetworkAccessSettings networkAccess,
    AgentRagSearchSettings ragSearch
) {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public AgentSettings {
        enabled = enabled == null ? true : enabled;
        builtIn = builtIn == null ? AgentBuiltInCapabilities.defaults() : builtIn;
        aiTools = aiTools == null ? List.of() : aiTools;
        toolSecurity = toolSecurity == null ? AgentToolSecurity.defaults() : toolSecurity;
        haloSearch = haloSearch == null ? AgentHaloSearchSettings.defaults() : haloSearch;
        haloResourceDetail = haloResourceDetail == null
            ? AgentHaloResourceDetailSettings.defaults()
            : haloResourceDetail;
        networkAccess = networkAccess == null
            ? AgentNetworkAccessSettings.defaults()
            : networkAccess;
        ragSearch = ragSearch == null ? AgentRagSearchSettings.defaults() : ragSearch;
    }

    public static AgentSettings defaults() {
        return new AgentSettings(true, null, List.of(), null, null, null, null, null);
    }

    public boolean isEnabled() {
        return Boolean.TRUE.equals(enabled);
    }

    public List<AgentToolConfig> normalizedAiTools() {
        if (aiTools instanceof List<?> list) {
            return list.stream()
                .map(item -> OBJECT_MAPPER.convertValue(item, AgentToolConfig.class))
                .toList();
        }
        if (aiTools instanceof String text && StringUtils.hasText(text)) {
            try {
                return OBJECT_MAPPER.readerForListOf(AgentToolConfig.class).readValue(text);
            } catch (Exception e) {
                return List.of();
            }
        }
        return List.of();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentBuiltInCapabilities(
        Boolean pageContext,
        Boolean haloNavigation,
        Boolean haloContentSearch,
        Boolean ragContentSearch,
        Boolean networkAccess,
        AgentCommentCapability commentCapability
    ) {
        public AgentBuiltInCapabilities {
            pageContext = pageContext == null ? true : pageContext;
            haloNavigation = haloNavigation == null ? true : haloNavigation;
            haloContentSearch = haloContentSearch == null ? true : haloContentSearch;
            ragContentSearch = ragContentSearch == null ? true : ragContentSearch;
            networkAccess = networkAccess == null ? false : networkAccess;
            commentCapability = commentCapability == null
                ? AgentCommentCapability.ASSIST
                : commentCapability;
        }

        public static AgentBuiltInCapabilities defaults() {
            return new AgentBuiltInCapabilities(true, true, true, true, false,
                AgentCommentCapability.ASSIST);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentToolSecurity(
        Object allowedExternalOrigins,
        Boolean allowNewTab
    ) {
        public AgentToolSecurity {
            allowedExternalOrigins = allowedExternalOrigins == null ? List.of() : allowedExternalOrigins;
            allowNewTab = allowNewTab == null ? false : allowNewTab;
        }

        public static AgentToolSecurity defaults() {
            return new AgentToolSecurity(List.of(), false);
        }

        public List<String> normalizedAllowedExternalOrigins() {
            return normalizeStringList(allowedExternalOrigins, "origin");
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentHaloSearchSettings(
        List<String> allowedTypes,
        Integer defaultLimit
    ) {
        public AgentHaloSearchSettings {
            allowedTypes = allowedTypes == null ? List.of() : allowedTypes;
            defaultLimit = defaultLimit == null ? 5 : defaultLimit;
        }

        public static AgentHaloSearchSettings defaults() {
            return new AgentHaloSearchSettings(List.of(), 5);
        }

        public List<String> normalizedAllowedTypes() {
            var normalized = normalizeStringList(allowedTypes);
            return normalized.isEmpty()
                ? List.of("post.content.halo.run", "singlepage.content.halo.run")
                : normalized;
        }

        public int normalizedDefaultLimit() {
            return defaultLimit < 1 || defaultLimit > 20 ? 5 : defaultLimit;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentHaloResourceDetailSettings(
        Integer maxContentChars
    ) {
        public AgentHaloResourceDetailSettings {
            maxContentChars = maxContentChars == null ? 3000 : maxContentChars;
            if (maxContentChars < 500 || maxContentChars > 10000) {
                maxContentChars = 3000;
            }
        }

        public static AgentHaloResourceDetailSettings defaults() {
            return new AgentHaloResourceDetailSettings(3000);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentNetworkAccessSettings(
        Object allowedOrigins,
        Integer maxResponseChars,
        Integer timeoutSeconds
    ) {
        public AgentNetworkAccessSettings {
            allowedOrigins = allowedOrigins == null ? List.of() : allowedOrigins;
            maxResponseChars = maxResponseChars == null ? 4000 : maxResponseChars;
            timeoutSeconds = timeoutSeconds == null ? 5 : timeoutSeconds;
        }

        public static AgentNetworkAccessSettings defaults() {
            return new AgentNetworkAccessSettings(List.of(), 4000, 5);
        }

        public List<String> normalizedAllowedOrigins() {
            return normalizeStringList(allowedOrigins, "origin");
        }

        public int normalizedMaxResponseChars() {
            return maxResponseChars < 1000 || maxResponseChars > 20000
                ? 4000
                : maxResponseChars;
        }

        public int normalizedTimeoutSeconds() {
            return timeoutSeconds < 1 || timeoutSeconds > 15 ? 5 : timeoutSeconds;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentRagSearchSettings(
        Integer defaultLimit,
        Integer maxContentChars
    ) {
        public AgentRagSearchSettings {
            defaultLimit = defaultLimit == null ? 5 : defaultLimit;
            maxContentChars = maxContentChars == null ? 3000 : maxContentChars;
        }

        public static AgentRagSearchSettings defaults() {
            return new AgentRagSearchSettings(5, 3000);
        }

        public int normalizedDefaultLimit() {
            return defaultLimit < 1 || defaultLimit > 20 ? 5 : defaultLimit;
        }

        public int normalizedMaxContentChars() {
            return maxContentChars < 500 || maxContentChars > 10000 ? 3000 : maxContentChars;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AgentToolConfig(
        String name,
        Boolean enabled,
        String description,
        JsonNode inputSchema,
        AgentToolApproval approval,
        AgentToolAuth requiredAuth,
        JsonNode action,
        JsonNode testInput
    ) {
        public AgentToolConfig {
            enabled = enabled == null ? true : enabled;
            approval = approval == null ? AgentToolApproval.DEFAULT : approval;
            requiredAuth = requiredAuth == null ? AgentToolAuth.NONE : requiredAuth;
        }
    }

    public static List<String> normalizeStringList(Object value) {
        return normalizeStringList(value, null);
    }

    public static List<String> normalizeStringList(Object value, String objectField) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<String> normalized = new ArrayList<>();
        for (var item : list) {
            if (item instanceof String text && StringUtils.hasText(text)) {
                normalized.add(text.trim());
            }
            if (objectField != null && item instanceof Map<?, ?> map) {
                var nested = map.get(objectField);
                if (nested instanceof String text && StringUtils.hasText(text)) {
                    normalized.add(text.trim());
                }
            }
        }
        return List.copyOf(normalized);
    }
}
