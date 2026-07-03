# Agent 能力

配置组：`agent`

Agent 能力用于控制前台助手是否可以调用站点工具，例如读取页面上下文、搜索 Halo 内容、检索 RAG 知识库、打开可信页面、定位评论区和生成评论草稿。

## 总开关

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 启用站点操作 Agent | `enabled` | `true` | 开启后，前台宠物助手可以在白名单工具范围内使用站点操作能力。 |

注意：即使这里开启，访客是否能使用 Agent 还会受到 [AI 设置](./ai-settings.md) 中 `aiSecuritySetting.accessMode` 的限制。

## 与前台宠物模式的关系

Agent 链路由前台智能助手的 `assistant.displayMode` 决定：

| 前台模式 | 链路 |
| --- | --- |
| `ragAgent` | 走 Agent 链路；如果 RAG 总开关开启，并且本页 `builtIn.ragContentSearch` 开启，则把 RAG 检索和详情读取挂成 Agent 工具。 |
| `agent` | 只走 Agent 链路，不挂 RAG 工具。 |
| `rag` | 只走普通 RAG 问答，不进入 Agent 链路。 |
| `petOnly` | 只展示宠物，不提供问答入口。 |

因此，RAG 和 Agent 不是互相依赖关系；只有选择 `ragAgent` 时，两者才会配合。

## 预设能力

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 当前页面上下文 | `builtIn.pageContext` | `true` | 允许模型读取当前页面标题、地址、选中文本、导航链接摘要和评论区状态。 |
| 打开可信页面 | `builtIn.haloNavigation` | `true` | 允许模型打开 Halo 搜索、RAG 检索或当前页面上下文中返回过的可信链接。 |
| Halo 内容搜索 | `builtIn.haloContentSearch` | `true` | 允许模型搜索公开文章、独立页面、分类和标签。 |
| RAG 知识库检索 | `builtIn.ragContentSearch` | `true` | 允许模型检索本站 RAG 知识库并读取有限详情。 |
| 后端网络访问 | `builtIn.networkAccess` | `false` | 允许模型读取白名单公网 URL。默认关闭，并阻止 localhost、内网和链路本地地址。 |
| 评论能力 | `builtIn.commentCapability` | `assist` | 控制评论相关工具开放程度。 |

### 评论能力选项

| 选项 | 值 | 说明 |
| --- | --- | --- |
| 关闭 | `off` | 不开放评论工具。 |
| 辅助 | `assist` | 允许定位评论区和填写草稿。 |
| 提交 | `submit` | 访客确认后尝试提交评论。 |

## 浏览器工具安全

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 允许打开的外部站点 | `toolSecurity.allowedExternalOrigins` | `[]` | 仅填写 Origin，例如 `https://github.com`。未配置时只允许打开本站链接。 |
| 允许新窗口打开 | `toolSecurity.allowNewTab` | `false` | 控制工具是否可以在新窗口打开页面。 |

## Halo 搜索

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 允许搜索的内容类型 | `haloSearch.allowedTypes` | 文章、独立页面 | 控制 Agent 可以搜索哪些 Halo 内容。 |
| 默认返回数量 | `haloSearch.defaultLimit` | `5` | 每次搜索默认返回的结果数。 |

可选内容类型：

| 类型 | 值 |
| --- | --- |
| 文章 | `post.content.halo.run` |
| 独立页面 | `singlepage.content.halo.run` |
| 瞬间 | `moment.moment.halo.run` |

## RAG 检索

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 默认返回数量 | `ragSearch.defaultLimit` | `5` | RAG 工具默认返回的结果数。 |
| 单条详情最大字符数 | `ragSearch.maxContentChars` | `3000` | 每条 RAG 详情允许返回给模型的最大字符数。 |

## Halo 资源详情

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 单条详情最大字符数 | `haloResourceDetail.maxContentChars` | `3000` | 读取 Halo 资源详情时返回给模型的最大字符数。 |

## 后端网络访问

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 允许读取的 Origin | `networkAccess.allowedOrigins` | `[]` | 仅填写完整 Origin，例如 `https://api.example.com`。 |
| 最大响应字符数 | `networkAccess.maxResponseChars` | `4000` | 网络读取返回给模型的最大字符数。 |
| 请求超时 | `networkAccess.timeoutSeconds` | `5` | 网络读取超时时间，单位秒。 |

后端网络访问默认关闭。只有在明确需要让模型读取可信公网 API 时才建议开启。

## 自定义浏览器工具 JSON

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 自定义浏览器工具 JSON | `aiTools` | `[]` | 高级选项，仅支持 `navigate`、`scroll-to`、`highlight`、`dispatch-event`、`registered` 这几类浏览器动作。 |

## 安全建议

- 公网站点不建议开放后端网络访问，除非配置了严格的 `allowedOrigins`。
- 匿名用户如果允许使用 Agent，建议只开放页面上下文、Halo 搜索和 RAG 检索。
- 评论能力建议保持 `assist`，由用户最终确认是否提交。
- 外部站点白名单只填写可信 Origin，不要填写通配域名。
- `aiTools` 是高级能力，配置前应确认动作不会造成越权跳转或危险操作。

## 与访问模式的关系

Agent 工具是否可用由两部分共同决定：

1. 本页 `agent.enabled` 和各工具开关。
2. [AI 设置](./ai-settings.md) 中的 `aiSecuritySetting.accessMode` 是否允许 Agent。

例如：

- `anonymous_chat`：匿名用户可对话，但不能用 Agent。
- `anonymous_chat_agent`：匿名用户可对话，也可使用已开启的 Agent 工具。
- `authenticated_chat_agent`：只有登录用户可对话并使用 Agent。
