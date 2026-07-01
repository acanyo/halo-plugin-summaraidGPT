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

    private final HaloAgentPresetToolService haloPresetToolService;
    private final RagAgentToolService ragAgentToolService;
    private final AgentToolNormalizer normalizer;

    public AgentToolSet buildTools(AgentSettings settings, boolean authenticated) {
        var resolvedSettings = settings == null ? AgentSettings.defaults() : settings;
        if (!resolvedSettings.isEnabled()) {
            return AgentToolSet.disabled();
        }

        List<ToolDefinition> tools = new ArrayList<>();
        addBuiltInBrowserTools(tools, resolvedSettings);
        addHaloPresetTools(tools, resolvedSettings);
        addRagTools(tools, resolvedSettings);
        normalizer.normalizeCustomTools(resolvedSettings).stream()
            .filter(tool -> isAllowed(tool.requiredAuth(), authenticated))
            .map(this::toBrowserToolDefinition)
            .forEach(tools::add);
        return new AgentToolSet(true, List.copyOf(tools));
    }

    public String appendCapabilityPrompt(String systemMessage, AgentToolSet toolSet) {
        var prompt = systemMessage == null ? "" : systemMessage;
        if (toolSet == null || !toolSet.agentEnabled() || toolSet.tools().isEmpty()) {
            return prompt + "\n\n【Agent 能力边界】\n"
                + "当前站点未向访客开放 Agent 操作能力。你可以正常聊天，但不能承诺打开页面、提交内容或控制站点功能。";
        }
        return prompt + "\n\n【Agent 能力】\n"
            + "- 你可以在工具可用时协助访客执行已授权的站点操作。\n"
            + "- 只能调用当前已声明的工具；不要承诺未声明或未授权的能力。\n"
            + "- 用户要查站点内容、关于博主、页面位置、分类标签或资料来源时，优先使用站内搜索、页面列表或 RAG 检索工具。\n"
            + "- 用户只输入短页面名或站点入口名，例如“关于博主”“关于”“友链”“留言”“归档”，也视为导航意图；应先使用页面列表或站内搜索找到强匹配页面，再调用打开资源工具。\n"
            + "- 如果工具返回了可信资源，并且用户表达了“带我去、打开、跳转、看看页面”或只输入页面名/入口名，应调用打开资源工具，不要只停留在文字说明。\n"
            + "- 执行评论、表单填写、页面定位等依赖当前页面结构的操作前，应先读取当前页面上下文；如果页面不具备对应能力，应如实说明。\n"
            + "- 需要访客确认的操作必须等待确认，不能声称已经完成。\n"
            + "- 导航、搜索、评论和外部读取都应以工具结果为准。";
    }

    private void addHaloPresetTools(List<ToolDefinition> tools, AgentSettings settings) {
        var builtIn = settings.builtIn();
        if (builtIn.haloContentSearch()) {
            tools.add(ToolDefinition.builder()
                .name("search_halo_resources")
                .description("使用 Halo 自身全文搜索引擎搜索公开内容资源，适合查找文章、页面或其他已接入搜索索引的公开内容。用户询问关于博主、关于本站、某篇文章或某个页面位置时，应优先尝试。用户只输入“关于博主”“关于”“友链”“留言”“归档”等短页面名时，应搜索或配合 get_pages 找到强匹配页面，并继续调用 open_halo_resource 打开。")
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
                .description("读取已查询到的公开 Halo 资源的有限详情，用于总结或介绍资源内容。")
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

    private void addRagTools(List<ToolDefinition> tools, AgentSettings settings) {
        if (!settings.builtIn().ragContentSearch()) {
            return;
        }
        tools.add(ToolDefinition.builder()
            .name("search_rag_resources")
            .description("检索站点 RAG 知识库，适合查询站点资料、导入文档、文章片段、业务说明和需要可追溯来源的问题。")
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
            .description("读取已检索到的 RAG 文档有限详情，用于进一步回答或总结资料。")
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

    public static Map<String, Object> emptyObjectSchema() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", Map.of());
        return schema;
    }
}
