package com.handsome.summary.agent.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.agent.model.AgentToolSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AgentToolProtocolTextParser {

    private static final Pattern TOOL_CALL_PATTERN = Pattern.compile(
        "<\\|tool_call_begin\\|>\\s*(?:functions\\.)?([^:<|\\s]+)"
            + "(?::([^<|\\s]+))?\\s*<\\|tool_call_argument_begin\\|>"
            + "([\\s\\S]*?)<\\|tool_call_end\\|>",
        Pattern.CASE_INSENSITIVE);

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private static final Map<String, String> TOOL_ALIASES = Map.ofEntries(
        Map.entry("站内搜索", "search_halo_resources"),
        Map.entry("站内内容搜索", "search_halo_resources"),
        Map.entry("搜索站内内容", "search_halo_resources"),
        Map.entry("halo内容搜索", "search_halo_resources"),
        Map.entry("站内资源详情", "get_halo_resource_detail"),
        Map.entry("资源详情", "get_halo_resource_detail"),
        Map.entry("读取站内资源", "get_halo_resource_detail"),
        Map.entry("最新内容", "get_latest_halo_resources"),
        Map.entry("最新文章", "get_latest_halo_resources"),
        Map.entry("分类列表", "get_categories"),
        Map.entry("站内分类", "get_categories"),
        Map.entry("标签列表", "get_tags"),
        Map.entry("站内标签", "get_tags"),
        Map.entry("分类文章", "get_posts_by_category"),
        Map.entry("标签文章", "get_posts_by_tag"),
        Map.entry("站内页面列表", "get_pages"),
        Map.entry("页面列表", "get_pages"),
        Map.entry("独立页面列表", "get_pages"),
        Map.entry("知识库检索", "search_rag_resources"),
        Map.entry("rag检索", "search_rag_resources"),
        Map.entry("检索知识库", "search_rag_resources"),
        Map.entry("知识库详情", "get_rag_resource_detail"),
        Map.entry("读取知识库详情", "get_rag_resource_detail"),
        Map.entry("读取外部资料", "fetch_allowed_url"),
        Map.entry("外部资料读取", "fetch_allowed_url"),
        Map.entry("当前页面上下文", "get_current_page_context"),
        Map.entry("读取当前页面", "get_current_page_context"),
        Map.entry("打开站内资源", "open_halo_resource"),
        Map.entry("打开页面", "open_halo_resource"),
        Map.entry("打开当前页链接", "open_current_page_link"),
        Map.entry("定位评论区", "open_comment_area"),
        Map.entry("评论草稿", "draft_comment"),
        Map.entry("填写评论草稿", "draft_comment"),
        Map.entry("提交评论", "submit_comment")
    );

    private final ObjectMapper objectMapper;

    public AgentToolProtocolTextParser() {
        this(new ObjectMapper());
    }

    AgentToolProtocolTextParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<ParsedToolCall> parse(String text, AgentToolSet toolSet) {
        if (!StringUtils.hasText(text) || toolSet == null || toolSet.tools() == null
            || toolSet.tools().isEmpty()) {
            return List.of();
        }
        var toolNames = toolNames(toolSet);
        var matcher = TOOL_CALL_PATTERN.matcher(text);
        var calls = new ArrayList<ParsedToolCall>();
        var sequence = 0;
        while (matcher.find()) {
            var rawToolName = matcher.group(1);
            var toolName = resolveToolName(rawToolName, toolNames);
            if (!StringUtils.hasText(toolName)) {
                continue;
            }
            var input = parseInput(matcher.group(3));
            if (input == null) {
                continue;
            }
            calls.add(new ParsedToolCall(
                normalizedToolCallId(matcher.group(2), ++sequence),
                toolName,
                input,
                rawToolName,
                matcher.group(0)
            ));
        }
        return List.copyOf(calls);
    }

    private Map<String, Object> parseInput(String rawInput) {
        var text = rawInput == null ? "" : rawInput.trim();
        if (!StringUtils.hasText(text)) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(text, MAP_TYPE);
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, String> toolNames(AgentToolSet toolSet) {
        var names = new LinkedHashMap<String, String>();
        for (var tool : toolSet.tools()) {
            if (tool != null && StringUtils.hasText(tool.getName())) {
                names.put(tool.getName(), tool.getName());
                names.put(tool.getName().toLowerCase(Locale.ROOT), tool.getName());
            }
        }
        return names;
    }

    private String resolveToolName(String rawToolName, Map<String, String> toolNames) {
        if (!StringUtils.hasText(rawToolName)) {
            return null;
        }
        var name = rawToolName.trim();
        var direct = toolNames.get(name);
        if (direct != null) {
            return direct;
        }
        direct = toolNames.get(name.toLowerCase(Locale.ROOT));
        if (direct != null) {
            return direct;
        }
        var alias = TOOL_ALIASES.get(name);
        if (alias != null && toolNames.containsKey(alias)) {
            return alias;
        }
        var normalized = name
            .replace("函数", "")
            .replace("工具", "")
            .replace(" ", "")
            .toLowerCase(Locale.ROOT);
        alias = TOOL_ALIASES.get(normalized);
        if (alias != null && toolNames.containsKey(alias)) {
            return alias;
        }
        return null;
    }

    private String normalizedToolCallId(String rawId, int sequence) {
        var id = StringUtils.hasText(rawId) ? rawId.trim() : String.valueOf(sequence);
        id = id.replaceAll("[^a-zA-Z0-9_-]", "-");
        if (!StringUtils.hasText(id)) {
            id = String.valueOf(sequence);
        }
        return "compat-" + id;
    }

    public record ParsedToolCall(String toolCallId, String toolName, Map<String, Object> input,
                                 String rawToolName, String rawText) {
    }
}
