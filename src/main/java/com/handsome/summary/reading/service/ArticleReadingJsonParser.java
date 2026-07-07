package com.handsome.summary.reading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.reading.extension.ArticleReading;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
public class ArticleReadingJsonParser {

    public static final int SCHEMA_VERSION = 4;

    private static final int MAX_TITLE_LENGTH = 40;
    private static final int MAX_SUMMARY_LENGTH = 320;
    private static final int MAX_ANCHOR_LENGTH = 100;
    private static final int MAX_ITEM_LENGTH = 120;

    private static final List<NodeTemplate> NODE_TEMPLATES = List.of(
        new NodeTemplate("tl-background", "背景", "tl", "root"),
        new NodeTemplate("dl-problem-source", "问题来源", "dl", "tl-background"),
        new NodeTemplate("dl-current-status", "现状", "dl", "tl-background"),
        new NodeTemplate("tl-core", "核心观点", "tl", "root"),
        new NodeTemplate("dl-key-judgment", "关键判断", "dl", "tl-core"),
        new NodeTemplate("dl-author-claim", "作者主张", "dl", "tl-core"),
        new NodeTemplate("tl-argument", "论据", "tl", "root"),
        new NodeTemplate("dl-data-fact", "数据或事实", "dl", "tl-argument"),
        new NodeTemplate("dl-case", "案例一", "dl", "tl-argument"),
        new NodeTemplate("tl-conclusion", "结论", "tl", "root"),
        new NodeTemplate("dl-advice", "建议", "dl", "tl-conclusion"),
        new NodeTemplate("dl-follow-up", "延伸问题", "dl", "tl-conclusion")
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ArticleReading.Spec parse(String aiResponse, String title, String content) {
        try {
            var root = objectMapper.readTree(extractJson(aiResponse));
            return sanitize(root, title, content);
        } catch (Exception e) {
            log.warn("洞察图谱解析失败，将使用本地结构 fallback: {}",
                e.getMessage());
            return fallback(title, content);
        }
    }

    public ArticleReading.Spec fallback(String title, String content) {
        var spec = new ArticleReading.Spec();
        spec.setSchemaVersion(SCHEMA_VERSION);
        spec.setRoot(rootNode(title, content));
        spec.setNodes(completeNodes(List.of(), title, content));
        spec.setEdges(defaultEdges());
        return spec;
    }

    private ArticleReading.Spec sanitize(JsonNode graphNode, String title, String content) {
        var spec = new ArticleReading.Spec();
        spec.setSchemaVersion(SCHEMA_VERSION);
        spec.setRoot(readRoot(graphNode.path("root"), title, content));
        spec.setNodes(completeNodes(readNodes(graphNode.path("nodes")), title, content));
        spec.setEdges(defaultEdges());
        return spec;
    }

    private ArticleReading.InsightNode readRoot(JsonNode node, String title, String content) {
        var root = readNode(node, "root", "root", clean(defaultString(title), 80));
        root.setId("root");
        root.setKind("root");
        if (!StringUtils.hasText(root.getTitle())) {
            root.setTitle(clean(defaultString(title), 80));
        }
        if (!StringUtils.hasText(root.getSummary())) {
            root.setSummary(buildOverviewSummary(title, content));
        }
        return root;
    }

    private ArticleReading.InsightNode rootNode(String title, String content) {
        return node("root", clean(defaultString(title), 80), "root",
            buildOverviewSummary(title, content), null, payload());
    }

    private List<ArticleReading.InsightNode> readNodes(JsonNode node) {
        var nodes = new ArrayList<ArticleReading.InsightNode>();
        if (!node.isArray()) {
            return nodes;
        }
        for (JsonNode item : node) {
            var insightNode = readNode(item, null, null, null);
            if (StringUtils.hasText(insightNode.getId())
                && !"root".equals(insightNode.getKind())
                && !isActionOrLegacyGroup(insightNode)) {
                nodes.add(insightNode);
            }
        }
        return dedupeNodes(nodes);
    }

    private ArticleReading.InsightNode readNode(JsonNode node, String idFallback,
        String kindFallback, String titleFallback) {
        var insightNode = new ArticleReading.InsightNode();
        insightNode.setId(clean(nonBlank(node.path("id").asText(""), idFallback), 64));
        insightNode.setTitle(clean(nonBlank(node.path("title").asText(""), titleFallback),
            MAX_TITLE_LENGTH));
        insightNode.setKind(normalizeKind(nonBlank(node.path("kind").asText(""), kindFallback)));
        insightNode.setSummary(clean(node.path("summary").asText(""), MAX_SUMMARY_LENGTH));
        insightNode.setSourceRange(readSourceRange(node.path("sourceRange")));
        insightNode.setPayload(readPayload(node.path("payload")));
        return insightNode;
    }

    private List<ArticleReading.InsightNode> completeNodes(List<ArticleReading.InsightNode> input,
        String title, String content) {
        var paragraphs = paragraphs(content);
        var points = fallbackPoints(paragraphs);
        var result = new ArrayList<ArticleReading.InsightNode>();
        for (var template : NODE_TEMPLATES) {
            var existing = findMatchingNode(input, template);
            var fallback = fallbackNode(template, title, content, paragraphs, points);
            if (existing == null) {
                result.add(fallback);
                continue;
            }
            existing.setId(template.id());
            existing.setTitle(template.title());
            existing.setKind(template.kind());
            if (!StringUtils.hasText(existing.getSummary())) {
                existing.setSummary(fallback.getSummary());
            }
            if (existing.getSourceRange() == null) {
                existing.setSourceRange(fallback.getSourceRange());
            }
            if (!hasPayloadContent(existing.getPayload())) {
                existing.setPayload(fallback.getPayload());
            }
            result.add(existing);
        }
        return result;
    }

    private ArticleReading.InsightNode findMatchingNode(List<ArticleReading.InsightNode> nodes,
        NodeTemplate template) {
        return nodes.stream()
            .filter(node -> template.id().equals(node.getId())
                || template.title().equals(node.getTitle())
                || isLegacyEquivalent(node, template))
            .findFirst()
            .orElse(null);
    }

    private boolean isLegacyEquivalent(ArticleReading.InsightNode node, NodeTemplate template) {
        var id = defaultString(node.getId());
        var title = defaultString(node.getTitle());
        return switch (template.id()) {
            case "tl-background" -> id.equals("tl-background") || title.equals("背景");
            case "tl-core" -> id.equals("tl-core") || title.equals("核心观点");
            case "tl-argument" -> id.equals("tl-argument") || title.equals("论据");
            case "tl-conclusion" -> id.equals("tl-conclusion") || title.equals("结论");
            case "dl-data-fact" -> id.equals("dl-evidence") || title.equals("原文证据");
            case "dl-case" -> id.equals("tl-case") || title.equals("案例");
            case "dl-advice" -> id.equals("dl-actions") || title.equals("行动清单");
            case "dl-follow-up" -> id.equals("dl-questions") || title.equals("可追问问题");
            default -> false;
        };
    }

    private ArticleReading.InsightNode fallbackNode(NodeTemplate template, String title,
        String content, List<String> paragraphs, List<String> points) {
        var first = paragraphAt(paragraphs, 0);
        var second = paragraphAt(paragraphs, 1);
        var third = paragraphAt(paragraphs, 2);
        var fourth = paragraphAt(paragraphs, 3);
        var last = paragraphs.isEmpty() ? "" : paragraphs.getLast();
        var lastIndex = Math.max(1, paragraphs.size());

        return switch (template.id()) {
            case "tl-background" -> node(template, "文章先交代问题来源和当前状态。",
                range(1, 2, first), payloadItems(points));
            case "dl-problem-source" -> node(template,
                nonBlank(first, "从开头段落提取文章讨论的问题来源。"), range(1, 1, first),
                payload());
            case "dl-current-status" -> node(template,
                nonBlank(second, "概括问题当前的状态、影响或争议。"), range(2, 2, second),
                payload());
            case "tl-core" -> node(template,
                nonBlank(firstSentence(content), "文章围绕核心观点展开判断。"), range(1, 3, second),
                payload());
            case "dl-key-judgment" -> node(template,
                nonBlank(firstSentence(content), "提炼文章中最关键的判断。"), range(1, 1, first),
                payload());
            case "dl-author-claim" -> node(template,
                nonBlank(second, "概括作者最希望读者接受的主张。"), range(2, 2, second),
                payload());
            case "tl-argument" -> node(template, "文章通过事实、数据或案例支撑核心观点。",
                range(3, 4, third), payloadItems(points));
            case "dl-data-fact" -> node(template,
                nonBlank(third, "提取文中可作为证据的数据、事实或关键句。"), range(3, 3, third),
                payload());
            case "dl-case" -> node(template,
                nonBlank(fourth, "提取文中用于说明观点的案例或现象。"), range(4, 4, fourth),
                payload());
            case "tl-conclusion" -> node(template,
                nonBlank(last, "回到文章结尾，理解作者最终想表达的结论。"),
                range(lastIndex, lastIndex, last), payload());
            case "dl-advice" -> node(template, "结合原文结论形成可执行建议。",
                range(lastIndex, lastIndex, last),
                payloadItems(List.of("核对原文关键句", "记录可执行建议", "继续追问不清楚的部分")));
            case "dl-follow-up" -> node(template, "可以继续追问结论、证据、概念和下一步行动。",
                range(lastIndex, lastIndex, last),
                payloadItems(List.of("这部分的关键结论是什么？", "有哪些原文证据支撑？", "下一步可以怎么做？")));
            default -> node(template, buildOverviewSummary(title, content), null, payload());
        };
    }

    private ArticleReading.InsightNode node(NodeTemplate template, String summary,
        ArticleReading.SourceRange range, ArticleReading.InsightPayload payload) {
        return node(template.id(), template.title(), template.kind(), summary, range, payload);
    }

    private ArticleReading.InsightNode node(String id, String title, String kind, String summary,
        ArticleReading.SourceRange range, ArticleReading.InsightPayload payload) {
        var node = new ArticleReading.InsightNode();
        node.setId(id);
        node.setTitle(title);
        node.setKind(kind);
        node.setSummary(clean(summary, MAX_SUMMARY_LENGTH));
        node.setSourceRange(range);
        node.setPayload(payload == null ? payload() : payload);
        return node;
    }

    private ArticleReading.SourceRange readSourceRange(JsonNode node) {
        if (!node.isObject()) {
            return null;
        }
        var range = new ArticleReading.SourceRange();
        range.setStartParagraph(Math.max(0, node.path("startParagraph").asInt(0)));
        range.setEndParagraph(Math.max(range.getStartParagraph(), node.path("endParagraph").asInt(0)));
        range.setAnchor(clean(node.path("anchor").asText(""), MAX_ANCHOR_LENGTH));
        return StringUtils.hasText(range.getAnchor()) ? range : null;
    }

    private ArticleReading.SourceRange range(int start, int end, String anchor) {
        if (!StringUtils.hasText(anchor)) {
            return null;
        }
        var range = new ArticleReading.SourceRange();
        range.setStartParagraph(start);
        range.setEndParagraph(Math.max(start, end));
        range.setAnchor(clean(anchor, MAX_ANCHOR_LENGTH));
        return range;
    }

    private ArticleReading.InsightPayload readPayload(JsonNode node) {
        var payload = payload();
        if (node == null || node.isMissingNode() || node.isNull()) {
            return payload;
        }
        if (!node.isObject()) {
            payload.setItems(payloadItemsFrom(node));
            return payload;
        }

        var items = new ArrayList<String>();
        if (node.has("items")) {
            items.addAll(payloadItemsFrom(node.path("items")));
        }
        node.fields().forEachRemaining(entry -> {
            if (!"items".equals(entry.getKey()) && !"action".equals(entry.getKey())) {
                items.addAll(payloadItemsFrom(entry.getValue()));
            }
        });
        payload.setItems(limitItems(items));
        return payload;
    }

    private ArticleReading.InsightPayload payload() {
        return new ArticleReading.InsightPayload();
    }

    private ArticleReading.InsightPayload payloadItems(List<String> items) {
        var payload = payload();
        payload.setItems(limitItems(items));
        return payload;
    }

    private List<String> payloadItemsFrom(JsonNode node) {
        var items = new ArrayList<String>();
        collectPayloadItems(node, items);
        return limitItems(items);
    }

    private void collectPayloadItems(JsonNode node, List<String> items) {
        if (items.size() >= 8 || node == null || node.isMissingNode() || node.isNull()) {
            return;
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                collectPayloadItems(item, items);
                if (items.size() >= 8) {
                    return;
                }
            }
            return;
        }
        if (node.isObject()) {
            if (node.has("value") && node.path("value").isTextual()) {
                addPayloadItem(items, node.path("value").asText(""));
                return;
            }
            node.fields().forEachRemaining(entry -> collectPayloadItems(entry.getValue(), items));
            return;
        }
        addPayloadItem(items, node.asText(""));
    }

    private List<String> limitItems(List<String> items) {
        if (items == null || items.isEmpty()) {
            return new ArrayList<>();
        }
        var values = new ArrayList<String>();
        for (String item : items) {
            addPayloadItem(values, item);
        }
        return values;
    }

    private void addPayloadItem(List<String> items, String value) {
        var item = clean(value, MAX_ITEM_LENGTH);
        if (StringUtils.hasText(item) && !items.contains(item) && items.size() < 8) {
            items.add(item);
        }
    }

    private boolean hasPayloadContent(ArticleReading.InsightPayload payload) {
        return payload != null
            && payload.getItems() != null
            && !payload.getItems().isEmpty();
    }

    private List<ArticleReading.InsightEdge> defaultEdges() {
        var edges = new ArrayList<ArticleReading.InsightEdge>();
        for (var template : NODE_TEMPLATES) {
            edges.add(edge(template.parentId(), template.id(), "contains"));
        }
        return edges;
    }

    private ArticleReading.InsightEdge edge(String from, String to, String type) {
        var edge = new ArticleReading.InsightEdge();
        edge.setFrom(from);
        edge.setTo(to);
        edge.setType(type);
        return edge;
    }

    private List<ArticleReading.InsightNode> dedupeNodes(List<ArticleReading.InsightNode> nodes) {
        var unique = new LinkedHashMap<String, ArticleReading.InsightNode>();
        for (var node : nodes) {
            if (StringUtils.hasText(node.getId())) {
                unique.putIfAbsent(node.getId(), node);
            }
        }
        return new ArrayList<>(unique.values());
    }

    private boolean isActionOrLegacyGroup(ArticleReading.InsightNode node) {
        var id = defaultString(node.getId());
        var title = defaultString(node.getTitle());
        return "action".equals(node.getKind())
            || id.equals("overview-30s")
            || id.equals("overview-conclusion")
            || id.equals("overview-keypoints")
            || id.equals("tl-group")
            || id.equals("dl-group")
            || id.equals("action-group")
            || id.startsWith("action-")
            || title.equals("30秒概览")
            || title.equals("一句话结论")
            || title.equals("3个关键点")
            || title.equals("TL分块")
            || title.equals("DL深挖")
            || title.equals("用户互动")
            || title.equals("跳回原文")
            || title.equals("问这一块")
            || title.equals("收藏节点")
            || title.equals("点赞反馈");
    }

    private String normalizeKind(String value) {
        var normalized = defaultString(value).toLowerCase();
        return switch (normalized) {
            case "root", "overview", "tl", "dl" -> normalized;
            default -> "dl";
        };
    }

    private String buildOverviewSummary(String title, String content) {
        var prefix = StringUtils.hasText(title) ? "本文围绕「" + clean(title, 80) + "」展开。" : "";
        var sentence = firstSentence(content);
        return clean(prefix + (StringUtils.hasText(sentence) ? sentence : "可先从图中的关键节点进入阅读。"),
            MAX_SUMMARY_LENGTH);
    }

    private List<String> fallbackPoints(List<String> paragraphs) {
        var points = new ArrayList<String>();
        for (String paragraph : paragraphs) {
            if (points.size() >= 3) {
                break;
            }
            points.add(clean(paragraph, 80));
        }
        if (points.isEmpty()) {
            points.add("当前文章内容较短，建议结合原文继续阅读。");
        }
        return points;
    }

    private List<String> paragraphs(String content) {
        var parts = defaultString(content).replace("\r", "\n").split("\\n+");
        var values = new ArrayList<String>();
        for (String part : parts) {
            var value = clean(part, MAX_SUMMARY_LENGTH);
            if (StringUtils.hasText(value)) {
                values.add(value);
            }
        }
        if (values.isEmpty() && StringUtils.hasText(content)) {
            values.add(clean(content, MAX_SUMMARY_LENGTH));
        }
        return values;
    }

    private String paragraphAt(List<String> paragraphs, int index) {
        if (paragraphs.isEmpty()) {
            return "";
        }
        return paragraphs.get(Math.min(index, paragraphs.size() - 1));
    }

    private String firstSentence(String content) {
        var value = defaultString(content).strip();
        if (!StringUtils.hasText(value)) {
            return "";
        }
        var end = value.length();
        for (String mark : List.of("。", "！", "？", ".", "!", "?")) {
            var index = value.indexOf(mark);
            if (index >= 0) {
                end = Math.min(end, index + mark.length());
            }
        }
        return clean(value.substring(0, Math.min(end, value.length())), MAX_SUMMARY_LENGTH);
    }

    private String extractJson(String value) {
        var text = defaultString(value).strip();
        if (text.startsWith("```")) {
            text = text.replaceFirst("^```(?:json)?\\s*", "")
                .replaceFirst("\\s*```$", "")
                .strip();
        }
        var start = text.indexOf('{');
        var end = text.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("No JSON object found");
        }
        return text.substring(start, end + 1);
    }

    private String clean(String value, int maxLength) {
        var text = defaultString(value)
            .replace('\u00a0', ' ')
            .replaceAll("\\s+", " ")
            .strip();
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, Math.max(0, maxLength - 1)).strip() + "…";
    }

    private String nonBlank(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private record NodeTemplate(String id, String title, String kind, String parentId) {
    }
}
