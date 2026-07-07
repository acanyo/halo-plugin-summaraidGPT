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
            最终图必须严格等价于这个脑图层级：
            root((文章标题))
              背景
                问题来源
                现状
              核心观点
                关键判断
                作者主张
              论据
                数据或事实
                案例一
              结论
                建议
                延伸问题

            严格要求：
            1. 只能依据原文，不补充原文之外的事实。
            2. 只输出一个合法 JSON 对象，不要 Markdown 代码块，不要解释。
            3. 根节点 root 是文章标题。
            4. nodes 只允许 kind 为 tl、dl；不要生成 overview、action 或 用户互动 节点。
            5. tl 节点必须且只能包含：背景、核心观点、论据、结论。
            6. dl 节点必须且只能包含：问题来源、现状、关键判断、作者主张、数据或事实、案例一、建议、延伸问题。
            7. 跳回原文、问这一块、收藏、点赞由前端浮层按钮处理，不属于图节点。
            8. 每个节点都必须有非空 summary，不要输出空节点。
            9. 有原文依据的节点必须提供 sourceRange.anchor，anchor 取原文短句，12-80 字。
            10. 数据或事实、建议、延伸问题建议在 payload.items 中给出 2-5 条。
            11. 每个 summary 简洁，避免长篇输出导致前台图过载。
            12. 必须使用下列固定 id：
                背景=tl-background，问题来源=dl-problem-source，现状=dl-current-status，
                核心观点=tl-core，关键判断=dl-key-judgment，作者主张=dl-author-claim，
                论据=tl-argument，数据或事实=dl-data-fact，案例一=dl-case，
                结论=tl-conclusion，建议=dl-advice，延伸问题=dl-follow-up。

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
                  "id": "tl-background",
                  "title": "背景",
                  "kind": "tl",
                  "summary": "该分支概括文章的问题背景",
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
                  "to": "tl-background",
                  "type": "contains"
                }
              ]
            }

            edge.type 只允许：contains、expands、supports、explains。
            edges 必须表达上述父子关系，不要把所有节点都直接连到 root。

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
            任务：基于文章原文生成一张可交互洞察图谱，主题分支和细节深挖必须表示为节点与边，用户操作不要作为图节点。
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
