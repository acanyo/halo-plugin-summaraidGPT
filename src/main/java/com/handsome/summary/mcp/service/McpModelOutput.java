package com.handsome.summary.mcp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import run.halo.aifoundation.message.ModelMessage;
import run.halo.aifoundation.message.ModelMessagePart;

/** Keep image payloads in UI results without spending the text model's context on base64. */
public final class McpModelOutput {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private McpModelOutput() { }

    public static List<ModelMessage> prepare(List<ModelMessage> messages) {
        if (messages == null) return List.of();
        return messages.stream().map(message -> {
            if (message.getContent() == null) return message;
            var content = message.getContent().stream().map(part -> {
                if (part.getToolName() == null || !part.getToolName().startsWith("mcp_")
                    || part.getResult() == null) return part;
                var filtered = withoutImageData(part.getResult());
                if (filtered == part.getResult()) return part;
                // AI Foundation renamed providerOptions to providerMetadata after beta.4.
                // Clone the runtime POJO so either version retains its own metadata fields.
                var copy = MAPPER.convertValue(part, ModelMessagePart.class);
                copy.setResult(filtered);
                return copy;
            }).toList();
            return new ModelMessage(message.getRole(), content);
        }).toList();
    }

    public static Object withoutImageData(Object value) {
        if (!(value instanceof Map<?, ?> map) || !"mcp".equals(map.get("kind"))
            || !(map.get("content") instanceof List<?> content)) return value;
        if (content.stream().noneMatch(item -> item instanceof Map<?, ?> block
            && "image".equals(block.get("type")))) return value;
        var copy = new LinkedHashMap<Object, Object>(map);
        copy.put("content", content.stream().map(item -> {
            if (item instanceof Map<?, ?> block && "image".equals(block.get("type"))) {
                return Map.of("type", "text", "text", "外部工具返回了一张图片，已在前台展示。");
            }
            return item;
        }).toList());
        return copy;
    }
}
