# 智阅全能AI助手配置文档

本文档按插件设置页的配置分组拆分，每个 Markdown 文件对应一个配置分类。

## 配置分类

| 分类 | 配置组 | 文档 |
| --- | --- | --- |
| AI 设置 | `basic` | [AI 设置](./ai-settings.md) |
| 角色设置 | `roles` | [角色设置](./role-settings.md) |
| 知识库设置 | `rag` | [知识库设置](./rag-settings.md) |
| 摘要设置 | `summary` | [摘要设置](./summary-settings.md) |
| 摘要框样式设置 | `style` | [摘要框样式设置](./summary-style-settings.md) |
| RAG 智能助手 | `assistant` | [RAG 智能助手](./rag-assistant.md) |
| Agent 能力 | `agent` | [Agent 能力](./agent-settings.md) |

## 配置前置条件

- Halo 版本需要满足插件要求：`>= 2.25.0`。
- AI 相关能力依赖 Halo AI Foundation，请先在 AI 基座插件中配置可用的语言模型、Embedding 模型和 Rerank 模型。
- 若启用 RAG 知识库，至少需要配置 Embedding 模型。
- 若启用 PetDex 附件库本地化，需要先在 Halo 中配置可用的附件存储策略。

## 推荐配置路径

首次安装后，建议按以下顺序配置：

1. 在 [AI 设置](./ai-settings.md) 中选择主语言模型、Embedding 模型和安全策略。
2. 在 [知识库设置](./rag-settings.md) 中确认分块、索引批量和检索参数。
3. 在 [RAG 智能助手](./rag-assistant.md) 中配置前台助手、宠物和 PetDex 资源加载方式。
4. 如需站点操作能力，再进入 [Agent 能力](./agent-settings.md) 开启对应工具。
5. 最后按站点风格调整 [摘要设置](./summary-settings.md) 和 [摘要框样式设置](./summary-style-settings.md)。

## 常见场景

- 只想生成文章摘要：配置 AI 设置中的语言模型，开启摘要设置即可。
- 想让访客问站内知识库：配置语言模型、Embedding 模型，开启知识库和 RAG 智能助手。
- 国内服务器加载 PetDex 慢或失败：在 RAG 智能助手中配置 PetDex 反代域名，或开启 PetDex 附件库本地化。
- 想限制访客 AI 调用成本：在 AI 设置中关闭匿名访问、开启限流，并谨慎开放 Agent 能力。
