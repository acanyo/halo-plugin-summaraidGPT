# 摘要框样式设置

配置组：`style`

摘要框样式设置用于控制文章摘要框在前台的布局、配色、密度、Logo 和经典主题细节，也可选择灵构 UI 作品展示真实摘要。

## UI 风格

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| UI 风格 | `uiStyle` | `simple` | 控制摘要框布局和视觉样式。 |

可选项：

| 选项 | 值 | 说明 |
| --- | --- | --- |
| 经典样式 | `classic` | 使用完整主题配置，可自定义 Logo、背景、边框、阴影和字体。 |
| 内联摘要 | `inline` | 更轻量，适合文章正文内自然展示。 |
| 简约卡片 | `simple` | 默认推荐，适合大多数主题。 |
| 灵构 UI 作品 | `lingui` | 使用已公开嵌入且完成摘要绑定的灵构作品，无法使用时回退到内置摘要。 |

## 灵构 UI 自定义摘要

选择「UI 风格 → 灵构 UI 作品」，再选择已开启公开嵌入的作品。智阅仍负责读取当前文章的真实摘要；灵构作品负责排版和展示，不会另外生成摘要。

### 使用前提与配置

- 使用 Halo 2.26 或更新版本，安装并启用灵构 UI 1.0.3 或更新的兼容版本。
- 配置用户需要灵构 UI 的「查看和使用组件与主题」权限，才能查询和选择作品。
- 在灵构 UI 中为作品开启「公开嵌入」。选择作品不会自动开启公开嵌入。
- 作品需要按下文调用 `zhiyue.summary` 并绑定返回的摘要正文；只有静态示例文字的作品不能代替真实摘要框。

| 配置项 | 完整字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| UI 风格 | `style.uiStyle` | `simple` | 选择 `lingui` 启用灵构自定义展示。 |
| 灵构 UI 作品 | `style.linguiProjectId` | 空字符串 | 保存选择器返回的项目 ID，例如 `component-summary`，不要自行添加前缀。 |

配置入口为「智阅 AI → 设置 → 摘要样式」。选择器支持搜索、清空和作品预览，保存的是项目 ID，不会复制或修改灵构作品。展示时读取最新保存版本；作品更新后，在文章页重新加载即可读取新版本。

灵构未安装、停用、版本不兼容或选择器尚未就绪时，设置页会提示原因并保留已保存的项目 ID。摘要功能本身仍需在 [摘要设置](./summary-settings.md) 中启用。

### 真实数据约定

作品需要先在文档的 `integrations.callbacks` 中声明 `zhiyue.summary` 回调，再在 `mount` 事件中调用它，将返回结果保存到 `/summary`。声明回调是灵构公开嵌入校验的一部分；只有事件动作、没有回调声明时，会提示“引用了未配置的回调”。智阅会在文章页提供回调实现，不需要在作品中写入 JavaScript 或接口凭证。

回调不需要参数，返回以下字段：

| 字段 | 类型 | 含义 | 绑定路径 |
| --- | --- | --- | --- |
| `title` | `string` | 智阅配置的摘要框标题，不是文章标题 | `/summary/title` |
| `gptName` | `string` | 智阅配置的 AI 展示名称，不是模型 ID | `/summary/gptName` |
| `content` | `string` | 当前文章的真实摘要全文 | `/summary/content` |
| `postId` | `string` | 当前文章的内部名称，不是文章 URL | `/summary/postId` |
| `loading` | `boolean` | 当前挂载时为 `false` | `/summary/loading` |
| `error` | `string` | 当前挂载时为空字符串 | `/summary/error` |

当前在摘要成功读取后才挂载作品，加载中或摘要读取失败时继续显示内置卡片。回调返回一次数据快照，不是实时状态订阅；内置打字机效果也不会逐字推送到灵构作品。

以下是符合灵构 `lingui.document/2` 格式、已声明回调依赖的最小文档，仅展示摘要正文。`source` 使用灵构的 OpenUI 源码格式，节点的 `events.mount` 设置回调，`text.path` 读取状态。可将此结构交给灵构 AI 作为绑定参考；它不是智阅插件的配置 JSON。

```json
{
  "schemaVersion": "lingui.document/2",
  "title": "智阅文章摘要",
  "parameters": [],
  "integrations": {
    "apis": [],
    "callbacks": [
      {
        "name": "zhiyue.summary",
        "label": "智阅文章摘要",
        "description": "读取智阅宿主提供的当前文章摘要，由文章页宿主实现，无需发起网络请求。"
      }
    ]
  },
  "state": {
    "summary": {
      "title": "",
      "gptName": "",
      "content": "",
      "postId": "",
      "loading": false,
      "error": ""
    }
  },
  "source": "root = Text({\"id\":\"root\",\"text\":{\"path\":\"/summary/content\"},\"variant\":\"body\",\"events\":{\"mount\":{\"actions\":[{\"type\":\"callback\",\"name\":\"zhiyue.summary\"}],\"resultPath\":\"/summary\"}}}, [])"
}
```

在已有排版中，保留作品原有的接口与回调声明，并在 `integrations.callbacks` 中补充上述回调；再将同样的 `mount` 事件配置放到根节点，保留其原有布局。摘要正文 Text 节点的 `text` 配置为 `{"path":"/summary/content"}`，标题和 AI 名称分别绑定 `/summary/title`、`/summary/gptName`。不要将摘要写死在作品中，也不要使用 `{{summary.content}}` 代替路径绑定。

设置页提供可复制的灵构 AI 设计说明。使用它设计作品时，保留上述回调声明、事件动作、结果路径和字段名称，再调整颜色、字号、留白与移动端布局。

### 预览、回退与交互范围

- 设置页的静态预览只展示作品外观，不执行 `mount` 交互，也不会注入当前文章的真实摘要。应在文章页检查最终数据与排版。
- 作品未绑定回调、被删除、关闭公开嵌入、加载失败，或灵构停用时，文章页保留内置简约摘要卡片。配置失效不会让已有摘要内容消失。
- 作品成功调用摘要回调并完成该次事件后，才替换内置展示。更换文章或作品时，智阅会重新挂载并提供对应文章的数据。
- 当前只注册 `zhiyue.summary` 回调，不继承其他业务回调，也不执行作品配置的 API 或 request 网络交互；不要在作品中另行调用摘要生成接口。读取作品定义以及图片、字体等资源仍会产生正常网络请求。
- 智阅不会更改作品的内容、公开状态或版本历史。作品里的动态文本和样式需要在灵构中维护；取消自定义展示时，可把 UI 风格切回 `simple`、`inline` 或 `classic`。

灵构作品选择、公开嵌入和 reader 的通用规则参见 [灵构 UI 集成说明](https://docs.xhhao.com/plugins/lingui/integration)。

## 固定风格配置

当 `uiStyle` 为 `inline` 或 `simple` 时，可使用固定风格配置。

| 配置项 | 字段 | 默认值 | 可选项 |
| --- | --- | --- | --- |
| 固定风格色调 | `fixedTone` | `violet` | `violet` 知性紫、`graphite` 石墨灰、`copper` 琥珀棕 |
| 固定风格密度 | `fixedDensity` | `compact` | `compact` 紧凑、`comfortable` 舒展 |

### 配置建议

- 文字较密集的博客：使用 `compact`。
- 设计感较强、留白较大的主题：使用 `comfortable`。
- 如果主题色较强，优先选择与主题接近的 `fixedTone`。

## 经典样式配置

当 `uiStyle` 为 `classic` 时，可配置经典主题。

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 主题选择 | `themeName` | `custom` | 可选自定义、蓝色、默认、暗色、绿色。 |
| Logo 图片 | `logo` | `/plugins/summaraidGPT/assets/static/icon.svg` | 摘要框 Logo 图片路径。 |
| 背景色 | `themeBg` | `#f7f9fe` | 支持纯色或 CSS 渐变。 |
| 主色调 | `themeMain` | `#4F8DFD` | 用于边框和强调。 |
| 标题颜色 | `themeTitle` | `#3A5A8C` | 标题文字颜色。 |
| 内容颜色 | `themeContent` | `#222` | 摘要正文颜色。 |
| AI 名称颜色 | `themeGptName` | `#7B88A8` | 模型名称颜色。 |
| 内容背景色 | `themeContentBg` | `#fff` | 内容区域背景色。 |
| 边框颜色 | `themeBorder` | `#e3e8f7` | 摘要框边框颜色。 |
| 阴影效果 | `themeShadow` | `0 2px 12px 0 rgba(60,80,180,0.08)` | CSS 阴影值。 |
| 标签背景色 | `themeTagBg` | `#f0f4ff` | 标签背景色。 |
| 标签文字颜色 | `themeTagColor` | `#4F8DFD` | 标签文字颜色。 |
| 光标颜色 | `themeCursor` | `#4F8DFD` | 打字机光标颜色。 |
| 内容字体大小 | `themeContentFontSize` | `16px` | 摘要正文大小。 |

## 主题适配建议

### 简约博客

```text
uiStyle = simple
fixedTone = graphite
fixedDensity = compact
```

### 内容型站点

```text
uiStyle = inline
fixedTone = violet
fixedDensity = comfortable
```

### 高度自定义主题

```text
uiStyle = classic
themeName = custom
```

然后按主题主色调整 `themeMain`、`themeBorder`、`themeTagColor`。

## 注意事项

- `inline` 和 `simple` 不使用经典主题的颜色字段。
- `classic` 且 `themeName = custom` 时，才会显示完整自定义颜色配置。
- `lingui` 使用作品自身的排版和主题，不使用智阅经典样式的颜色字段；作品不可用时使用内置简约卡片回退。
- 如果摘要框不显示，请先检查 [摘要设置](./summary-settings.md) 中的 `enableUiInjection` 是否开启。
