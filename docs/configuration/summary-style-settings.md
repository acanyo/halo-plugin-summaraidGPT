# 摘要框样式设置

配置组：`style`

摘要框样式设置用于控制文章摘要框在前台的布局、配色、密度、Logo 和经典主题细节。

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
- 如果摘要框不显示，请先检查 [摘要设置](./summary-settings.md) 中的 `enableUiInjection` 是否开启。
