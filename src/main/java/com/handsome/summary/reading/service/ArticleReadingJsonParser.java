package com.handsome.summary.reading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.reading.extension.ArticleReading;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
public class ArticleReadingJsonParser {

    public static final int SCHEMA_VERSION = 5;

    private static final int MIN_TL_COUNT = 3;
    private static final int MAX_TL_COUNT = 6;
    private static final int MAX_DL_PER_TL = 4;
    private static final int MAX_TITLE_LENGTH = 40;
    private static final int MAX_SUMMARY_LENGTH = 320;
    private static final int MAX_ANCHOR_LENGTH = 100;
    private static final int MAX_ITEM_LENGTH = 120;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ArticleReading.Spec parse(String aiResponse, String title, String content) {
        try {
            var root = objectMapper.readTree(extractJson(aiResponse));
            return sanitize(root, title, content);
        } catch (Exception e) {
            log.warn("洞察图谱解析失败，将使用本地结构 fallback: {}", e.getMessage());
            return fallback(title, content);
        }
    }

    public ArticleReading.Spec fallback(String title, String content) {
        var spec = new ArticleReading.Spec();
        spec.setSchemaVersion(SCHEMA_VERSION);
        spec.setRoot(rootNode(title, content));
        var branches = fallbackBranches(content);
        spec.setNodes(flattenNodes(branches));
        spec.setEdges(buildEdges(spec.getRoot().getId(), branches));
        return spec;
    }

    private ArticleReading.Spec sanitize(JsonNode graphNode, String title, String content) {
        var root = readRoot(graphNode.path("root"), title, content);
        var rawNodes = readRawNodes(graphNode.path("nodes"));
        var rawEdges = readRawEdges(graphNode.path("edges"));
        var branches = buildBranches(rawNodes, rawEdges, content);
        if (branches.size() < MIN_TL_COUNT) {
            log.warn("洞察图谱节点不足，将使用本地结构 fallback，TL 节点数: {}", branches.size());
            return fallback(title, content);
        }

        var spec = new ArticleReading.Spec();
        spec.setSchemaVersion(SCHEMA_VERSION);
        spec.setRoot(root);
        spec.setNodes(flattenNodes(branches));
        spec.setEdges(buildEdges(root.getId(), branches));
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
        root.setPayload(payload());
        return root;
    }

    private ArticleReading.InsightNode rootNode(String title, String content) {
        return node("root", clean(defaultString(title), 80), "root",
            buildOverviewSummary(title, content), null, payload());
    }

    private List<RawNode> readRawNodes(JsonNode node) {
        var nodes = new ArrayList<RawNode>();
        if (!node.isArray()) {
            return nodes;
        }

        var seenIds = new HashSet<String>();
        var order = 0;
        for (JsonNode item : node) {
            var rawKind = defaultString(item.path("kind").asText("")).toLowerCase();
            if (isIgnoredKind(rawKind)) {
                continue;
            }
            var insightNode = readNode(item, null, rawKind, null);
            if (!StringUtils.hasText(insightNode.getId())) {
                insightNode.setId("node-" + (++order));
            }
            if (!StringUtils.hasText(insightNode.getTitle()) || isActionOrLegacyGroup(insightNode)) {
                continue;
            }
            if (!seenIds.add(insightNode.getId())) {
                continue;
            }
            nodes.add(new RawNode(insightNode.getId(), insightNode, order++));
        }
        return nodes;
    }

    private ArticleReading.InsightNode readNode(JsonNode node, String idFallback,
        String kindFallback, String titleFallback) {
        var insightNode = new ArticleReading.InsightNode();
        insightNode.setId(clean(nonBlank(node.path("id").asText(""), idFallback), 64));
        insightNode.setTitle(clean(nonBlank(node.path("title").asText(""), titleFallback),
            MAX_TITLE_LENGTH));
        insightNode.setKind(normalizeKind(nonBlank(node.path("kind").asText(""), kindFallback),
            insightNode.getId()));
        insightNode.setSummary(clean(node.path("summary").asText(""), MAX_SUMMARY_LENGTH));
        insightNode.setSourceRange(readSourceRange(node.path("sourceRange")));
        insightNode.setPayload(readPayload(node.path("payload")));
        return insightNode;
    }

    private List<RawEdge> readRawEdges(JsonNode node) {
        var edges = new ArrayList<RawEdge>();
        if (!node.isArray()) {
            return edges;
        }
        var seen = new HashSet<String>();
        for (JsonNode item : node) {
            var from = clean(item.path("from").asText(""), 64);
            var to = clean(item.path("to").asText(""), 64);
            if (!StringUtils.hasText(from) || !StringUtils.hasText(to) || from.equals(to)) {
                continue;
            }
            var type = normalizeEdgeType(item.path("type").asText(""));
            var key = from + "->" + to;
            if (seen.add(key)) {
                edges.add(new RawEdge(from, to, type));
            }
        }
        return edges;
    }

    private List<BranchDraft> buildBranches(List<RawNode> rawNodes, List<RawEdge> rawEdges,
        String content) {
        var rawTlNodes = rawNodes.stream()
            .filter(rawNode -> "tl".equals(rawNode.node().getKind()))
            .limit(MAX_TL_COUNT)
            .toList();
        if (rawTlNodes.size() < MIN_TL_COUNT) {
            return List.of();
        }

        var rawDlNodes = rawNodes.stream()
            .filter(rawNode -> "dl".equals(rawNode.node().getKind()))
            .toList();
        var rawById = new HashMap<String, RawNode>();
        rawNodes.forEach(rawNode -> rawById.put(rawNode.originalId(), rawNode));

        var parentByChild = parentByChild(rawEdges, rawById);
        var drafts = new ArrayList<RawBranchDraft>();
        var assignedDlIds = new HashSet<String>();
        for (int index = 0; index < rawTlNodes.size(); index++) {
            var tl = rawTlNodes.get(index);
            var nextTlOrder = index + 1 < rawTlNodes.size()
                ? rawTlNodes.get(index + 1).order()
                : Integer.MAX_VALUE;
            var children = new ArrayList<RawNode>();

            rawDlNodes.stream()
                .filter(dl -> tl.originalId().equals(parentByChild.get(dl.originalId())))
                .forEach(children::add);
            rawDlNodes.stream()
                .filter(dl -> !parentByChild.containsKey(dl.originalId()))
                .filter(dl -> dl.order() > tl.order() && dl.order() < nextTlOrder)
                .forEach(children::add);

            var branchChildren = new ArrayList<>(children.stream()
                .sorted(Comparator.comparingInt(RawNode::order))
                .filter(child -> !assignedDlIds.contains(child.originalId()))
                .limit(MAX_DL_PER_TL)
                .toList());
            branchChildren.forEach(child -> assignedDlIds.add(child.originalId()));
            drafts.add(new RawBranchDraft(tl, orderedUniqueChildren(branchChildren)));
        }

        attachUnassignedChildren(rawDlNodes, drafts, assignedDlIds);
        return normalizeBranches(drafts, content);
    }

    private Map<String, String> parentByChild(List<RawEdge> rawEdges, Map<String, RawNode> rawById) {
        var parentByChild = new LinkedHashMap<String, String>();
        for (var edge : rawEdges) {
            var parent = rawById.get(edge.from());
            var child = rawById.get(edge.to());
            if (parent == null || child == null) {
                continue;
            }
            if ("tl".equals(parent.node().getKind()) && "dl".equals(child.node().getKind())) {
                parentByChild.putIfAbsent(child.originalId(), parent.originalId());
            }
        }
        return parentByChild;
    }

    private List<RawNode> orderedUniqueChildren(List<RawNode> children) {
        var unique = new LinkedHashMap<String, RawNode>();
        children.stream()
            .sorted(Comparator.comparingInt(RawNode::order))
            .forEach(child -> {
                if (unique.size() < MAX_DL_PER_TL) {
                    unique.putIfAbsent(child.originalId(), child);
                }
            });
        return new ArrayList<>(unique.values());
    }

    private void attachUnassignedChildren(List<RawNode> rawDlNodes, List<RawBranchDraft> drafts,
        Set<String> assignedDlIds) {
        for (var child : rawDlNodes) {
            if (assignedDlIds.contains(child.originalId())) {
                continue;
            }
            var target = drafts.stream()
                .filter(draft -> draft.children().size() < MAX_DL_PER_TL)
                .filter(draft -> child.order() > draft.tl().order())
                .reduce((previous, current) -> current)
                .orElseGet(() -> drafts.stream()
                    .filter(draft -> draft.children().size() < MAX_DL_PER_TL)
                    .findFirst()
                    .orElse(null));
            if (target != null) {
                target.children().add(child);
                assignedDlIds.add(child.originalId());
            }
        }
    }

    private List<BranchDraft> normalizeBranches(List<RawBranchDraft> drafts, String content) {
        var branches = new ArrayList<BranchDraft>();
        for (int branchIndex = 0; branchIndex < drafts.size(); branchIndex++) {
            var rawBranch = drafts.get(branchIndex);
            var tl = normalizeFinalNode(rawBranch.tl().node(), "tl-" + (branchIndex + 1),
                "tl", "主题 " + (branchIndex + 1), content, branchIndex);
            var children = new ArrayList<ArticleReading.InsightNode>();
            for (int childIndex = 0; childIndex < rawBranch.children().size()
                && childIndex < MAX_DL_PER_TL; childIndex++) {
                var child = normalizeFinalNode(rawBranch.children().get(childIndex).node(),
                    "dl-" + (branchIndex + 1) + "-" + (childIndex + 1), "dl",
                    "细节 " + (childIndex + 1), content, branchIndex + childIndex + 1);
                children.add(child);
            }
            if (children.isEmpty()) {
                children.add(defaultDetailNode(branchIndex, 0, tl.getTitle(), content));
            }
            branches.add(new BranchDraft(tl, children));
        }
        return branches;
    }

    private ArticleReading.InsightNode normalizeFinalNode(ArticleReading.InsightNode input,
        String id, String kind, String titleFallback, String content, int paragraphIndex) {
        var title = clean(nonBlank(input.getTitle(), titleFallback), MAX_TITLE_LENGTH);
        var summary = clean(input.getSummary(), MAX_SUMMARY_LENGTH);
        if (!StringUtils.hasText(summary)) {
            summary = fallbackSummary(title, content, paragraphIndex);
        }
        var range = input.getSourceRange();
        if (range == null) {
            range = rangeForParagraph(content, paragraphIndex);
        }
        var payload = hasPayloadContent(input.getPayload()) ? input.getPayload() : payload();
        return node(id, title, kind, summary, range, payload);
    }

    private List<BranchDraft> fallbackBranches(String content) {
        var branches = new ArrayList<BranchDraft>();
        branches.add(branch(0, "内容脉络", "梳理文章从哪里开始、先交代了什么。",
            List.of("开篇信息", "上下文"), content));
        branches.add(branch(1, "主要信息", "提取文章主体中最值得先理解的内容。",
            List.of("关键内容", "重要细节"), content));
        branches.add(branch(2, "阅读焦点", "把原文中支撑理解的事实、例子或概念集中起来。",
            List.of("原文依据", "概念补充"), content));
        branches.add(branch(3, "后续思考", "整理读者读完后可以继续追问或行动的方向。",
            List.of("可行动作", "可追问问题"), content));
        return branches;
    }

    private BranchDraft branch(int index, String title, String summary, List<String> childTitles,
        String content) {
        var tl = node("tl-" + (index + 1), title, "tl", summary,
            rangeForParagraph(content, index), payloadItems(fallbackPoints(paragraphs(content))));
        var children = new ArrayList<ArticleReading.InsightNode>();
        for (int childIndex = 0; childIndex < childTitles.size(); childIndex++) {
            children.add(defaultDetailNode(index, childIndex, childTitles.get(childIndex), content));
        }
        return new BranchDraft(tl, children);
    }

    private ArticleReading.InsightNode defaultDetailNode(int branchIndex, int childIndex,
        String title, String content) {
        var paragraphIndex = branchIndex + childIndex;
        var items = title.contains("追问")
            ? List.of("这一部分和全文主旨是什么关系？", "有哪些原文句子最能支撑它？", "还能从哪个角度继续读？")
            : List.<String>of();
        return node("dl-" + (branchIndex + 1) + "-" + (childIndex + 1), title, "dl",
            fallbackSummary(title, content, paragraphIndex), rangeForParagraph(content, paragraphIndex),
            payloadItems(items));
    }

    private List<ArticleReading.InsightNode> flattenNodes(List<BranchDraft> branches) {
        var nodes = new ArrayList<ArticleReading.InsightNode>();
        for (var branch : branches) {
            nodes.add(branch.tl());
            nodes.addAll(branch.children());
        }
        return nodes;
    }

    private List<ArticleReading.InsightEdge> buildEdges(String rootId, List<BranchDraft> branches) {
        var edges = new ArrayList<ArticleReading.InsightEdge>();
        for (var branch : branches) {
            edges.add(edge(rootId, branch.tl().getId(), "contains"));
            for (var child : branch.children()) {
                edges.add(edge(branch.tl().getId(), child.getId(), edgeTypeFor(child)));
            }
        }
        return edges;
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

    private ArticleReading.SourceRange rangeForParagraph(String content, int paragraphIndex) {
        var paragraph = paragraphAt(paragraphs(content), Math.max(0, paragraphIndex));
        return range(Math.max(1, paragraphIndex + 1), Math.max(1, paragraphIndex + 1), paragraph);
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

    private ArticleReading.InsightEdge edge(String from, String to, String type) {
        var edge = new ArticleReading.InsightEdge();
        edge.setFrom(from);
        edge.setTo(to);
        edge.setType(normalizeEdgeType(type));
        return edge;
    }

    private boolean isIgnoredKind(String kind) {
        return "root".equals(kind) || "overview".equals(kind) || "action".equals(kind);
    }

    private boolean isActionOrLegacyGroup(ArticleReading.InsightNode node) {
        var id = defaultString(node.getId());
        var title = defaultString(node.getTitle());
        return "action".equals(node.getKind())
            || "overview".equals(node.getKind())
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

    private String normalizeKind(String value, String id) {
        var normalized = defaultString(value).toLowerCase();
        if ("root".equals(normalized)) {
            return "root";
        }
        if ("tl".equals(normalized) || defaultString(id).startsWith("tl-")) {
            return "tl";
        }
        return "dl";
    }

    private String normalizeEdgeType(String value) {
        return switch (defaultString(value).toLowerCase()) {
            case "contains", "expands", "supports", "explains" -> value.toLowerCase();
            default -> "contains";
        };
    }

    private String edgeTypeFor(ArticleReading.InsightNode node) {
        var title = defaultString(node.getTitle());
        if (title.contains("证据") || title.contains("依据") || title.contains("事实")
            || title.contains("数据")) {
            return "supports";
        }
        if (title.contains("解释") || title.contains("概念") || title.contains("术语")) {
            return "explains";
        }
        return "expands";
    }

    private String fallbackSummary(String title, String content, int paragraphIndex) {
        var paragraph = paragraphAt(paragraphs(content), Math.max(0, paragraphIndex));
        if (StringUtils.hasText(paragraph)) {
            return clean("围绕「" + title + "」整理：" + paragraph, MAX_SUMMARY_LENGTH);
        }
        return clean("围绕「" + title + "」整理原文中的相关信息。", MAX_SUMMARY_LENGTH);
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

    private record RawNode(String originalId, ArticleReading.InsightNode node, int order) {
    }

    private record RawEdge(String from, String to, String type) {
    }

    private record RawBranchDraft(RawNode tl, List<RawNode> children) {
    }

    private record BranchDraft(ArticleReading.InsightNode tl,
                               List<ArticleReading.InsightNode> children) {
    }
}
