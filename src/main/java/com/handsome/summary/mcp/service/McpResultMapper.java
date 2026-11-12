package com.handsome.summary.mcp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.spec.McpSchema;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class McpResultMapper {
    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> map(String server, String tool, McpSchema.CallToolResult result) {
        var output = new LinkedHashMap<String, Object>();
        output.put("kind", "mcp");
        output.put("server", clip(server, 100));
        output.put("tool", clip(tool, 150));
        output.put("ok", !Boolean.TRUE.equals(result.isError()));
        var content = new ArrayList<Map<String, Object>>();
        int remaining = 16000;
        boolean truncated = false;
        for (var item : result.content() == null ? java.util.List.<McpSchema.Content>of() : result.content()) {
            if (content.size() >= 12 || remaining <= 0) { truncated = true; break; }
            var node = mapper.valueToTree(item);
            var type = node.path("type").asText();
            if ("text".equals(type)) {
                var text = node.path("text").asText();
                content.add(Map.of("type", "text", "text", clip(text, remaining)));
                truncated |= text.length() > remaining;
                remaining -= Math.min(text.length(), remaining);
            } else if ("image".equals(type)) {
                var mime = node.path("mimeType").asText();
                var data = node.path("data").asText();
                if (java.util.Set.of("image/png", "image/jpeg", "image/webp", "image/gif").contains(mime)
                    && data.length() <= 1_400_000 && data.matches("[A-Za-z0-9+/=\\r\\n]+")) {
                    content.add(Map.of("type", "image", "mimeType", mime, "data", data));
                } else truncated = true;
            } else if ("resource_link".equals(type)) {
                var url = safeUrl(node.path("uri").asText());
                if (url != null) content.add(Map.of("type", "link", "url", url,
                    "title", clip(node.path("name").asText("查看资源"), 200)));
            } else if ("resource".equals(type) && node.path("resource").has("text")) {
                var text = node.path("resource").path("text").asText();
                content.add(Map.of("type", "text", "text", clip(text, remaining)));
                truncated |= text.length() > remaining;
                remaining -= Math.min(text.length(), remaining);
            }
        }
        output.put("content", content);
        if (result.structuredContent() != null) {
            var json = mapper.valueToTree(result.structuredContent());
            var text = json.toString();
            if (text.length() <= 12000) output.put("structuredContent", json);
            else {
                var compact = compactRows(json);
                if (compact != null) output.put("structuredContent", compact);
                else output.put("structuredPreview", clip(text, 12000));
                truncated = true;
            }
        }
        output.put("truncated", truncated);
        return output;
    }

    /** Preserve usable source rows when a documentation service returns full article chunks. */
    private com.fasterxml.jackson.databind.JsonNode compactRows(com.fasterxml.jackson.databind.JsonNode json) {
        var rows = json;
        String key = null;
        if (!rows.isArray()) {
            for (var candidate : java.util.List.of("results", "items", "documents", "rows")) {
                if (json.path(candidate).isArray()) { key = candidate; rows = json.get(candidate); break; }
            }
        }
        if (!rows.isArray()) return null;
        var compact = mapper.createArrayNode();
        int budget = 11800;
        for (var row : rows) {
            if (!row.isObject() || compact.size() >= 12) break;
            var item = mapper.createObjectNode();
            var fields = row.fields();
            while (fields.hasNext() && item.size() < 8) {
                var field = fields.next();
                var value = field.getValue();
                if (value.isTextual() || value.isContainerNode()) {
                    var limit = java.util.Set.of("url", "uri", "link").contains(field.getKey()) ? 2000 : 600;
                    item.put(field.getKey(), clip(value.isTextual() ? value.asText() : value.toString(), limit));
                } else item.set(field.getKey(), value);
            }
            int length = item.toString().length();
            if (length > budget) break;
            compact.add(item); budget -= length;
        }
        if (compact.isEmpty()) return null;
        return key == null ? compact : mapper.createObjectNode().set(key, compact);
    }

    private String safeUrl(String value) {
        try {
            var uri = URI.create(value);
            return ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme()))
                && uri.getHost() != null && uri.getUserInfo() == null ? value : null;
        } catch (IllegalArgumentException error) { return null; }
    }

    private String clip(String value, int length) {
        return value == null ? "" : value.substring(0, Math.min(value.length(), length));
    }
}
