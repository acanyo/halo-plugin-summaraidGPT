# RAG 智能助手

配置组：`assistant`

RAG 智能助手用于控制前台悬浮宠物、问答面板、快捷问题、PetDex 资源加载和助手样式。

## 基础配置

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 启用前台智能助手 | `enableAssistant` | `true` | 关闭后前台不显示宠物和智能助手。 |
| 前台显示模式 | `displayMode` | `ragAgent` | 控制宠物入口后的问答链路。 |
| 助手名称 | `assistantName` | `智阅助手` | 前台窗口中显示的助手名称。 |
| 欢迎语 | `welcomeMessage` | 内置欢迎语 | 全屏会话首次打开时展示，支持 `{assistantName}` 占位符。 |
| 快捷问题 | `quickQuestions` | 内置问题 | 展示在会话输入框上方，点击后填入输入框。 |
| 对话头像 | `assistantAvatar` | 插件图标 | 聊天标题和助手消息使用的头像。 |
| 悬浮宠物大小 | `petSize` | `76` | 宠物单帧宽度，单位 px。 |

## 显示模式与链路

| 模式 | 值 | 说明 |
| --- | --- | --- |
| 知识库问答 + Agent | `ragAgent` | 展示宠物，问答走 Agent 链路，并在 RAG 开启时把知识库检索作为 Agent 工具。 |
| 仅知识库问答 | `rag` | 展示宠物，问答只走 RAG 知识库问答，不调用 Agent 工具。 |
| 仅 Agent | `agent` | 展示宠物，问答只走 Agent 链路，不挂 RAG 工具。 |
| 纯宠物 | `petOnly` | 只展示宠物和气泡，不打开问答面板。 |

如果站点只需要装饰或陪伴型宠物，选择 `petOnly` 即可。

## 宠物气泡文案

| 配置项 | 字段 | 适用模式 |
| --- | --- | --- |
| 对话模式宠物气泡文案 | `petSpeechMessages` | `ragAgent`、`rag`、`agent` |
| 仅宠物模式气泡文案 | `petOnlySpeechMessages` | `petOnly` |

建议：

- 对话模式文案侧重引导提问，例如“有什么站内资料想查？”。
- 仅宠物模式文案侧重陪伴和装饰，例如“今天也要元气满满。”。

## PetDex 反代域名

| 配置项 | 字段 | 说明 |
| --- | --- | --- |
| PetDex 反代域名 | `petdexProxyBaseUrl` | 用于将 PetDex 资源 URL 改写到自建反向代理域名。 |

留空表示直连 PetDex。填写 `https://proxy.example.com/` 时，插件会把 PetDex 资源改写为同路径代理地址。

也支持模板：

```text
https://proxy.example.com/{url}
https://proxy.example.com/?url={encodedUrl}
https://proxy.example.com{path}
```

模板变量：

| 变量 | 说明 |
| --- | --- |
| `{url}` | 原始完整 URL，例如 `https://assets.petdex.dev/pets/.../sprite.webp`。 |
| `{encodedUrl}` | URL 编码后的完整 URL。 |
| `{path}` | 原始 URL 的路径和查询参数。 |

### Nginx 反代参考

PetDex 的 API 和资源来自不同上游，建议按路径分开代理。

```nginx
location ^~ /pets/ {
    proxy_pass https://assets.petdex.dev;
    proxy_set_header Host assets.petdex.dev;
    proxy_ssl_server_name on;
    proxy_ssl_name assets.petdex.dev;
}

location ^~ /manifests/ {
    proxy_pass https://assets.petdex.dev;
    proxy_set_header Host assets.petdex.dev;
    proxy_ssl_server_name on;
    proxy_ssl_name assets.petdex.dev;
}

location ^~ /api/ {
    proxy_pass https://petdex.dev;
    proxy_set_header Host petdex.dev;
    proxy_ssl_server_name on;
    proxy_ssl_name petdex.dev;
    proxy_redirect https://assets.petdex.dev/ https://petdex.halo.sb/;
    proxy_redirect https://petdex.dev/ https://petdex.halo.sb/;
}

location ^~ /install/ {
    proxy_pass https://petdex.dev;
    proxy_set_header Host petdex.dev;
    proxy_ssl_server_name on;
    proxy_ssl_name petdex.dev;
}
```

不要把 `proxy_set_header Host` 设置为 `$host`，否则上游 Cloudflare 可能返回 `421 Misdirected Request`。

## PetDex 附件库本地化

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 保存 PetDex 资源到附件库 | `petdexAttachmentStorage.enabled` | `false` | 开启后，导入 PetDex 宠物时会下载资源并上传到 Halo 附件库。 |
| 存储策略 | `petdexAttachmentStorage.policyName` | 空 | 选择上传宠物资源使用的 Halo 附件存储策略。 |
| 附件分组 | `petdexAttachmentStorage.groupName` | 空 | 可选，选择上传后归档到哪个附件分组。 |

开启后，插件会把 `sprite.webp` 和 `petjson.json` 保存到附件库，并把宠物配置中的资源地址替换为附件 permalink。

注意：

- 只对新导入或重新保存的 PetDex 宠物生效。
- 已导入的旧宠物需要重新导入，或打开编辑后保存一次，才会转换为附件库资源。
- 如果同时配置反代域名，本地化下载阶段也会使用反代地址拉取资源。

## 助手样式配置

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 配色方案 | `styleConfig.stylePreset` | `default` | 可选默认暖白、黑金、海盐蓝、清透蓝、松石绿、蔷薇、自定义。 |
| 主色 | `styleConfig.primaryColor` | `#a16207` | 自定义配色时用于按钮、引用高亮和重点状态。 |
| 辅色 | `styleConfig.secondaryColor` | `#f4f4f5` | 自定义配色时用于浅色背景和悬浮状态。 |
| 面板背景 | `styleConfig.surfaceColor` | `#fafafa` | 自定义配色时用于聊天窗口和输入区背景。 |
| 文字颜色 | `styleConfig.textColor` | `#18181b` | 自定义配色时用于标题、正文和按钮文字。 |
| 圆角风格 | `styleConfig.borderRadius` | `soft` | 可选标准、柔和、圆润。 |
| 颜色模式 | `styleConfig.colorMode` | `light` | 可选跟随系统、浅色、深色。 |

## 默认悬浮位置

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 默认左右位置 | `floatingPosition.buttonPosition` | `right` | 首次展示时使用的左右位置。 |
| 默认横向偏移 | `floatingPosition.horizontalOffset` | `24` | 距离所选左右边缘的像素值。 |
| 默认纵向偏移 | `floatingPosition.verticalOffset` | `24` | 距离页面底部的像素值。 |

用户拖动宠物后，浏览器本地保存的位置会优先于默认配置。

## 相关配置

- 问答是否允许匿名访问，由 [AI 设置](./ai-settings.md) 中的 AI 助手访问模式控制。
- 是否允许 Agent 工具，由 [Agent 能力](./agent-settings.md) 和 AI 助手访问模式共同控制。
- 知识库检索参数由 [知识库设置](./rag-settings.md) 控制。
