package com.handsome.summary.agent.service;

import com.handsome.summary.agent.model.AgentCommentCapability;
import com.handsome.summary.agent.model.AgentSettings;
import com.handsome.summary.agent.model.AgentToolApproval;
import com.handsome.summary.agent.model.AgentToolAuth;
import com.handsome.summary.agent.model.AgentToolSet;
import com.handsome.summary.agent.model.NormalizedAgentTool;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import run.halo.aifoundation.schema.JsonSchema;
import run.halo.aifoundation.tool.ToolDefinition;

@Component
@RequiredArgsConstructor
public class AgentToolService {
    private static final String RESPONSE_FORMAT_PROMPT = "\n\n【回复格式】\n"
        + "- 默认使用 Markdown 格式回复，普通聊天也可以只写自然文本。\n"
        + "- 除非回复很短，否则每句话单独成行；不要把多句话连续挤在同一段里。\n"
        + "- 需要分点说明时优先使用 Markdown 列表，每个列表项单独成行，列表前后保留空行。\n"
        + "- 多个列表、段落或不同主题之间使用空行分隔。\n"
        + "- 不要输出 HTML 标签。";

    private final HaloAgentPresetToolService haloPresetToolService;
    private final RagAgentToolService ragAgentToolService;
    private final AgentToolNormalizer normalizer;

    public AgentToolSet buildTools(AgentSettings settings, boolean authenticated) {
        return buildTools(settings, authenticated, true);
    }

    public AgentToolSet buildTools(AgentSettings settings, boolean authenticated,
        boolean agentAllowed) {
        return buildTools(settings, authenticated, agentAllowed, true);
    }

    public AgentToolSet buildTools(AgentSettings settings, boolean authenticated,
        boolean agentAllowed, boolean ragAvailable) {
        if (!agentAllowed) {
            return AgentToolSet.disabled();
        }
        var resolvedSettings = settings == null ? AgentSettings.defaults() : settings;
        if (!resolvedSettings.isEnabled()) {
            return AgentToolSet.disabled();
        }

        List<ToolDefinition> tools = new ArrayList<>();
        addBuiltInBrowserTools(tools, resolvedSettings);
        addHaloPresetTools(tools, resolvedSettings);
        addRagTools(tools, resolvedSettings, ragAvailable);
        normalizer.normalizeCustomTools(resolvedSettings).stream()
            .filter(tool -> isAllowed(tool.requiredAuth(), authenticated))
            .map(this::toBrowserToolDefinition)
            .forEach(tools::add);
        return new AgentToolSet(true, List.copyOf(tools));
    }

    public String appendCapabilityPrompt(String systemMessage, AgentToolSet toolSet) {
        var prompt = systemMessage == null ? "" : systemMessage;
        if (toolSet == null || !toolSet.agentEnabled() || toolSet.tools().isEmpty()) {
            return prompt + RESPONSE_FORMAT_PROMPT + "\n\n【Agent 能力边界】\n"
                + "当前站点未向访客开放 Agent 操作能力。你可以正常聊天，但不能承诺打开页面、提交内容或控制站点功能。";
        }
        var hasRagTools = hasTool(toolSet, "search_rag_resources");
        var hasHaloTools = hasTool(toolSet, "search_halo_resources");
        var builder = new StringBuilder(prompt)
            .append(RESPONSE_FORMAT_PROMPT)
            .append("\n\n【Agent 能力】\n")
            .append("- 你可以在工具可用时协助访客执行已授权的站点操作。\n")
            .append("- 只能调用当前已声明的工具；不要承诺未声明或未授权的能力。\n");
        if (hasRagTools && hasHaloTools) {
            builder.append("- Agent 是操作和检索编排层，RAG 是资料来源之一；需要站内依据时，让 Halo 公开内容检索、RAG 检索和详情读取配合工作。\n")
                .append("- 用户要查站点内容、关于博主、页面位置、分类标签、导入文档、知识库资料或某篇文章时，优先使用站内搜索、页面列表或 RAG 检索工具。\n");
        } else if (hasRagTools) {
            builder.append("- 站点已开放 RAG 知识库检索；用户要查知识库资料、导入文档或站点资料时，优先使用 RAG 检索工具。\n");
        } else if (hasHaloTools) {
            builder.append("- 当前站点未开放 RAG 知识库检索；需要站内依据时，优先使用 Halo 公开内容搜索、页面列表和资源详情工具。\n");
        } else {
            builder.append("- 当前站点未开放站内搜索或 RAG 检索工具；你可以正常聊天，但不要声称能检索知识库或读取站内资料。\n");
        }
        builder.append("- 当用户只是问通用概念或公开常识，且没有表达“本站、站内、知识库、某篇文章、打开/跳转”等站点意图时，可以直接回答；不要为了凑来源强行检索弱相关资源。\n");
        if (hasRagTools) {
            builder.append("- 检索到候选资源后，只选择和问题强相关的文章、页面或文档读取详情；再把站内正文、RAG 片段和你的推理合并成一份最终回答。\n");
        } else if (hasHaloTools) {
            builder.append("- 检索到候选资源后，只选择和问题强相关的文章或页面读取详情；再把站内正文和你的推理合并成一份最终回答。\n");
        }
        return builder
            .append("- 不要在工具返回前输出实质性答案；工具用完后只输出一份整合后的最终回答，不要先给通用回答再追加一段知识库回答。\n")
            .append("- 工具返回的资源会由前台展示为关联资源，正文只保留必要引用和结论，不要重复罗列完整来源清单，也不要引用弱相关候选。\n")
            .append("- 用户只输入短页面名或站点入口名，例如“关于博主”“关于”“友链”“留言”“归档”，也视为导航意图；应先使用页面列表或站内搜索找到强匹配页面，再调用打开资源工具。\n")
            .append("- 如果工具返回了可信资源，并且用户表达了“带我去、打开、跳转、看看页面”或只输入页面名/入口名，应调用打开资源工具，不要只停留在文字说明。\n")
            .append("- 执行评论、表单填写、页面定位等依赖当前页面结构的操作前，应先读取当前页面上下文；如果页面不具备对应能力，应如实说明。\n")
            .append("- 需要访客确认的操作必须等待确认，不能声称已经完成。\n")
            .append("- 导航、搜索、评论和外部读取都应以工具结果为准。")
            .toString();
    }

    private void addHaloPresetTools(List<ToolDefinition> tools, AgentSettings settings) {
        var builtIn = settings.builtIn();
        if (builtIn.haloContentSearch()) {
            tools.add(ToolDefinition.builder()
                .name("search_halo_resources")
                .description("使用 Halo 自身全文搜索引擎搜索公开内容资源，适合查找本站文章、页面或其他已接入搜索索引的公开内容。用户询问关于博主、关于本站、某篇文章、站内资料、页面位置，或问题可能对应站内文章时使用；泛百科问题没有站点意图时不要强行调用。找到强匹配资源后，通常继续调用 get_halo_resource_detail 读取详情；用户只输入“关于博主”“关于”“友链”“留言”“归档”等短页面名时，应搜索或配合 get_pages 找到强匹配页面，并继续调用 open_halo_resource 打开。")
                .inputSchema(JsonSchema.object()
                    .property("keyword", JsonSchema.string().description("搜索关键词"))
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 20"))
                    .property("includeTypes", JsonSchema.array(JsonSchema.string().build())
                        .description("可选内容类型列表，只会使用站点允许的类型"))
                    .required("keyword")
                    .build())
                .executor(context -> haloPresetToolService.searchHaloResources(context.getInput(),
                    settings))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_halo_resource_detail")
                .description("读取已查询到的公开 Halo 资源详情，用于把站内文章或页面内容纳入最终回答。只读取和用户问题强相关的候选资源，不要为了罗列来源读取弱相关资源。")
                .inputSchema(JsonSchema.object()
                    .property("resourceId", JsonSchema.string().description("可信资源 ID"))
                    .required("resourceId")
                    .build())
                .executor(context -> haloPresetToolService.getHaloResourceDetail(context.getInput(),
                    settings))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_latest_halo_resources")
                .description("查看站点最新公开内容资源。第一版稳定支持最新文章。")
                .inputSchema(JsonSchema.object()
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 20"))
                    .build())
                .executor(context -> haloPresetToolService.getLatestHaloResources(context.getInput()))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_categories")
                .description("查看站点公开分类列表。")
                .inputSchema(JsonSchema.object()
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 100"))
                    .build())
                .executor(context -> haloPresetToolService.getCategories(context.getInput()))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_tags")
                .description("查看站点公开标签列表。")
                .inputSchema(JsonSchema.object()
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 100"))
                    .build())
                .executor(context -> haloPresetToolService.getTags(context.getInput()))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_posts_by_category")
                .description("查看指定分类下的公开文章。")
                .inputSchema(JsonSchema.object()
                    .property("categoryName", JsonSchema.string().description("分类元数据名称"))
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 20"))
                    .required("categoryName")
                    .build())
                .executor(context -> haloPresetToolService.getPostsByCategory(context.getInput()))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_posts_by_tag")
                .description("查看指定标签下的公开文章。")
                .inputSchema(JsonSchema.object()
                    .property("tagName", JsonSchema.string().description("标签元数据名称"))
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 20"))
                    .required("tagName")
                    .build())
                .executor(context -> haloPresetToolService.getPostsByTag(context.getInput()))
                .build());
            tools.add(ToolDefinition.builder()
                .name("get_pages")
                .description("查看站点公开独立页面列表，适合查找“关于”“关于博主”“友链”“留言”“归档”等页面。用户只输入短页面名时，应优先使用该工具找强匹配页面，并继续调用 open_halo_resource 打开。")
                .inputSchema(JsonSchema.object()
                    .property("keyword", JsonSchema.string()
                        .description("可选页面关键词，例如 友链、关于、留言"))
                    .property("limit", JsonSchema.integer().description("返回数量，1 到 100"))
                    .build())
                .executor(context -> haloPresetToolService.getPages(context.getInput()))
                .build());
        }
        if (builtIn.networkAccess()) {
            tools.add(ToolDefinition.builder()
                .name("fetch_allowed_url")
                .description("通过后端读取站长白名单中的公网 URL。仅支持 GET，只能访问网络访问安全策略允许的 Origin，不能访问 localhost、内网或链路本地地址。适合读取公开 API、公开 JSON、文本页面或文档摘要。")
                .inputSchema(JsonSchema.object()
                    .property("url", JsonSchema.string().description("要读取的完整公网 URL，必须属于站长配置的允许 Origin"))
                    .required("url")
                    .build())
                .executor(context -> haloPresetToolService.fetchAllowedUrl(context.getInput(),
                    settings))
                .build());
        }
    }

    private void addRagTools(List<ToolDefinition> tools, AgentSettings settings,
        boolean ragAvailable) {
        if (!ragAvailable || !settings.builtIn().ragContentSearch()) {
            return;
        }
        tools.add(ToolDefinition.builder()
            .name("search_rag_resources")
            .description("检索站点 RAG 知识库，适合查询站点资料、导入文档、文章片段、业务说明和需要可追溯来源的问题。它是 Agent 的资料工具，应与 Halo 站内搜索配合使用来形成一份最终回答；泛百科问题没有站点或知识库意图时不要强行调用。")
            .inputSchema(JsonSchema.object()
                .property("keyword", JsonSchema.string().description("检索关键词或用户问题"))
                .property("knowledgeBase", JsonSchema.string().description("可选知识库 metadata.name"))
                .property("limit", JsonSchema.integer().description("返回数量，1 到 20"))
                .required("keyword")
                .build())
            .executor(context -> ragAgentToolService.searchRagResources(context.getInput(),
                settings))
            .build());
        tools.add(ToolDefinition.builder()
            .name("get_rag_resource_detail")
            .description("读取已检索到的 RAG 文档详情，用于把知识库资料纳入最终回答。只读取和用户问题强相关的文档，不要把弱相关候选塞进答案。")
            .inputSchema(JsonSchema.object()
                .property("resourceId", JsonSchema.string().description("可信 RAG 资源 ID"))
                .required("resourceId")
                .build())
            .executor(context -> ragAgentToolService.getRagResourceDetail(context.getInput(),
                settings))
            .build());
    }

    private void addBuiltInBrowserTools(List<ToolDefinition> tools, AgentSettings settings) {
        var builtIn = settings.builtIn();
        if (builtIn.pageContext()) {
            tools.add(ToolDefinition.builder()
                .name("get_current_page_context")
                .description("读取当前访客页面上下文和可操作能力，例如页面标题、地址、主要标题、选中文本、评论区/评论输入框/提交按钮是否存在、页面表单摘要和站内链接摘要。不会读取表单当前值、Cookie 或本地存储。执行评论、表单填写或页面定位前应先使用该工具判断当前页面是否支持对应操作。")
                .inputSchema(JsonSchema.object().build())
                .build());
        }
        if (builtIn.haloNavigation()) {
            tools.add(ToolDefinition.builder()
                .name("open_halo_resource")
                .description("打开刚由 Halo 或 RAG 查询工具返回的可信资源。只能打开工具结果中出现过的资源。用户只输入短页面名或站点入口名时，找到强匹配资源后应调用本工具自动跳转。")
                .inputSchema(JsonSchema.object()
                    .property("resourceId", JsonSchema.string().description("可信资源 ID"))
                    .required("resourceId")
                    .build())
                .build());
            tools.add(ToolDefinition.builder()
                .name("open_current_page_link")
                .description("打开当前页面上下文中读取到的可信链接。只能打开 get_current_page_context 返回过的链接 ID。")
                .inputSchema(JsonSchema.object()
                    .property("linkId", JsonSchema.string().description("当前页面上下文中的链接 ID"))
                    .required("linkId")
                    .build())
                .build());
        }
        if (builtIn.commentCapability() != AgentCommentCapability.OFF) {
            tools.add(ToolDefinition.builder()
                .name("open_comment_area")
                .description("打开或滚动到当前页面评论区。该工具不会自动提交评论。")
                .inputSchema(JsonSchema.object().build())
                .build());
            tools.add(ToolDefinition.builder()
                .name("draft_comment")
                .description("滚动到评论区，并将评论草稿写入当前页面的评论输入框。该工具不会自动提交评论。")
                .inputSchema(JsonSchema.object()
                    .property("content", JsonSchema.string().description("评论草稿内容"))
                    .required("content")
                    .build())
                .build());
        }
        if (builtIn.commentCapability() == AgentCommentCapability.SUBMIT) {
            tools.add(ToolDefinition.builder()
                .name("submit_comment")
                .description("滚动到评论区，写入评论内容，并在访客审批后尝试提交评论。只有站点评论流程允许且必要校验满足时才可成功。")
                .inputSchema(JsonSchema.object()
                    .property("content", JsonSchema.string().description("评论内容"))
                    .required("content")
                    .build())
                .requiresApproval(true)
                .build());
        }
    }

    private ToolDefinition toBrowserToolDefinition(NormalizedAgentTool tool) {
        return ToolDefinition.builder()
            .name(tool.name())
            .description(descriptionWithPolicy(tool))
            .inputSchema(tool.inputSchema())
            .build();
    }

    private String descriptionWithPolicy(NormalizedAgentTool tool) {
        var description = tool.description();
        if (tool.approval() == AgentToolApproval.ALWAYS) {
            description += "。该工具需要访客确认后才会执行。";
        }
        if ("dispatch-event".equals(tool.actionType())) {
            description += "。该工具只会触发站点声明的事件，具体行为由站点实现。";
        }
        if ("registered".equals(tool.actionType())) {
            description += "。该工具由站点注册的前端执行器处理。";
        }
        return description;
    }

    private boolean isAllowed(AgentToolAuth requiredAuth, boolean authenticated) {
        return requiredAuth != AgentToolAuth.AUTHENTICATED || authenticated;
    }

    private boolean hasTool(AgentToolSet toolSet, String name) {
        return toolSet.tools().stream().anyMatch(tool -> name.equals(tool.getName()));
    }

    public static Map<String, Object> emptyObjectSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", Map.of());
        return schema;
    }
}
