package com.handsome.summary.reading.service;

import com.handsome.summary.reading.model.ArticleReadingSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ArticleReadingPromptFactory {

    private static final int MAX_CONTENT_CHARS = 6500;

    public String create(ArticleReadingSource source, String rolePrompt) {
        return """
            %s

            请基于文章原文生成洞察图谱（Article Insight Graph）。后端和前端都以图为唯一数据结构，不要输出摘要列表、TL 列表、DL 卡片结构或多 Tab 结构。
            TL 分支由你根据文章类型自行决定，不要强行套用议论文结构；有的文章可能是教程、清单、资讯、故事、产品说明、观点文、复盘或杂记。
            你可以从这些方向出发，但不要被它们限制：背景、主题对象、主要内容、核心观点、步骤流程、案例故事、概念解释、原文证据、风险问题、时间线、人物角色、产品工具、方法清单、读者行动、结尾判断、可追问问题。

            严格要求：
            1. 只能依据原文，不补充原文之外的事实。
            2. 只输出一个合法 JSON 对象，不要 Markdown 代码块，不要解释。
            3. 根节点 root 是文章标题。
            4. nodes 只允许 kind 为 tl、dl；不要生成 overview、action 或 用户互动 节点。
            5. 生成 3-6 个 tl 节点，每个 tl 下生成 1-4 个 dl 节点；分支标题要贴合文章实际，不要固定为“背景/核心观点/论据/结论”。
            6. tl 节点表示文章的主要阅读分支；dl 节点表示这个分支下的证据、例子、步骤、概念、问题、清单或延伸追问。
            7. 跳回原文、问这一块、收藏、点赞由前端浮层按钮处理，不属于图节点。
            8. 每个节点都必须有非空 summary，不要输出空节点。
            9. 有原文依据的节点必须提供 sourceRange.anchor，anchor 取原文短句，12-80 字。
            10. 适合清单表达的节点在 payload.items 中给出 2-5 条；payload 必须是对象，例如 {"items":["..."]}，不能直接输出数组或字符串。
            11. 每个 summary 简洁，避免长篇输出导致前台图过载。
            12. 必须使用顺序 id：tl-1、tl-2、tl-3...；对应 dl 使用 dl-1-1、dl-1-2、dl-2-1...。

            JSON Schema：
            {
              "root": {
                "id": "root",
                "title": "文章标题",
                "kind": "root",
                "summary": "一句话说明"
              },
              "nodes": [
                {
                  "id": "tl-1",
                  "title": "AI 自行命名的主题分支",
                  "kind": "tl",
                  "summary": "该分支概括文章的一个主要阅读方向",
                  "sourceRange": {
                    "startParagraph": 1,
                    "endParagraph": 3,
                    "anchor": "原文短句"
                  },
                  "payload": {
                    "items": ["可选补充"]
                  }
                }
              ],
              "edges": [
                {
                  "from": "root",
                  "to": "tl-1",
                  "type": "contains"
                }
              ]
            }

            edge.type 只允许：contains、expands、supports、explains。
            edges 必须表达 root -> tl、tl -> dl 的父子关系，不要把所有节点都直接连到 root。

            文章标题：
            %s

            文章正文：
            %s
            """.formatted(effectiveRolePrompt(rolePrompt), defaultString(source.title()),
            truncate(source.content()));
    }

    private String effectiveRolePrompt(String rolePrompt) {
        if (StringUtils.hasText(rolePrompt)) {
            return rolePrompt.strip();
        }
        return """
            角色：你是中文文章洞察图谱结构化助手。
            关键词：图结构、TL、DL、原文依据、少编造。
            任务：基于文章原文生成一张可交互洞察图谱，主题分支由文章类型自然决定，细节深挖必须表示为节点与边，用户操作不要作为图节点。
            输出：使用中文，节点标题短而清楚，summary 负责承载内容。
            边界：只能依据原文，不补充原文之外的事实；原文依据必须取自原文短句。
            """;
    }

    private String truncate(String content) {
        var value = defaultString(content);
        if (value.length() <= MAX_CONTENT_CHARS) {
            return value;
        }
        return value.substring(0, MAX_CONTENT_CHARS)
            + "\n\n[正文过长，后续内容已截断，请基于已给内容输出洞察图谱]";
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }
}
