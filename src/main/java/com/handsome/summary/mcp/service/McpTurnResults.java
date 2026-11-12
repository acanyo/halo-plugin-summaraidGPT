package com.handsome.summary.mcp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.mcp.model.McpToolResult;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import run.halo.aifoundation.ui.UIMessageChunk;
import run.halo.aifoundation.ui.UIMessageTransportCodec;

/** Collect one turn's tool state from trusted server chunks, including approval continuations. */
public final class McpTurnResults {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final Map<String, McpToolResult> cards = new LinkedHashMap<>();

    public void restore(List<McpToolResult> saved) {
        if (saved != null) saved.stream().limit(16).forEach(card -> cards.put(card.id(), card));
    }

    public void observe(UIMessageChunk chunk) { observe(UIMessageTransportCodec.chunkToMap(chunk)); }

    public void observe(Map<String, Object> chunk) {
        var type = text(chunk.get("type"));
        var id = text(chunk.get("toolCallId"));
        var name = text(chunk.get("toolName"));
        boolean mcpOutput = chunk.get("output") instanceof Map<?, ?> output && "mcp".equals(output.get("kind"));
        if (id.isBlank() || (!name.matches("mcp_[a-f0-9]{12}_.+") && !cards.containsKey(id) && !mcpOutput)) return;
        var previous = cards.get(id);
        if (previous == null && cards.size() >= 16) return;
        var title = previous == null ? "MCP · " + name.replaceFirst("^mcp_[a-f0-9]{12}_", "") : previous.title();
        var state = previous == null ? "pending" : previous.status();
        var content = previous == null ? List.<Map<String, String>>of() : previous.content();
        String structured = previous == null ? null : previous.structuredJson();
        boolean truncated = previous != null && Boolean.TRUE.equals(previous.truncated());
        if ("tool-approval-request".equals(type)) state = "approval";
        if ("tool-output-denied".equals(type)) state = "cancelled";
        if ("tool-output-error".equals(type)) {
            state = "error";
            content = List.of(Map.of("type", "text", "text", "工具调用失败，请重新尝试"));
        }
        if (chunk.get("output") instanceof Map<?, ?> output && "mcp".equals(output.get("kind"))) {
            title = clip(text(output.get("server")), 100) + " · " + clip(text(output.get("tool")), 150);
            state = Boolean.FALSE.equals(output.get("ok")) ? "error" : "success";
            var blocks = new ArrayList<Map<String, String>>();
            if (output.get("content") instanceof List<?> values) for (var value : values.stream().limit(12).toList()) {
                if (!(value instanceof Map<?, ?> block)) continue;
                var blockType = text(block.get("type"));
                if ("image".equals(blockType)) {
                    var data = text(block.get("data"));
                    var mime = text(block.get("mimeType"));
                    if (data.length() <= 96000 && java.util.Set.of("image/png", "image/jpeg", "image/webp", "image/gif").contains(mime)) {
                        blocks.add(Map.of("type", "image", "mimeType", mime, "data", data));
                    } else {
                        blocks.add(Map.of("type", "text", "text", "图片较大，历史会话保留文字与来源链接。"));
                        truncated = true;
                    }
                } else if ("text".equals(blockType)) {
                    blocks.add(Map.of("type", "text", "text", clip(text(block.get("text")), 16000)));
                } else if ("link".equals(blockType)) {
                    blocks.add(Map.of("type", "link", "url", text(block.get("url")), "title", clip(text(block.get("title")), 200)));
                }
            }
            if (output.get("structuredPreview") instanceof String preview) {
                blocks.add(Map.of("type", "text", "text", clip(preview, 12000)));
            }
            content = List.copyOf(blocks);
            var node = MAPPER.valueToTree(output.get("structuredContent"));
            structured = node != null && !node.isNull() && node.toString().length() <= 12000 ? node.toString() : null;
            truncated |= Boolean.TRUE.equals(output.get("truncated"));
        }
        cards.put(id, new McpToolResult(id, clip(title, 260), state, content, structured, truncated));
    }

    public List<McpToolResult> snapshot() {
        var result = new ArrayList<McpToolResult>();
        int budget = 256000;
        for (var card : cards.values()) {
            var bytes = MAPPER.valueToTree(card).toString().length();
            if (bytes <= budget) { result.add(card); budget -= bytes; }
            else result.add(new McpToolResult(card.id(), card.title(), card.status(),
                List.of(Map.of("type", "text", "text", "结果较长，历史会话仅保留调用状态。")), null, true));
        }
        return List.copyOf(result);
    }

    private static String text(Object value) { return value == null ? "" : String.valueOf(value); }
    private static String clip(String value, int max) { return value.substring(0, Math.min(value.length(), max)); }
}
