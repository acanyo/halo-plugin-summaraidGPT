# 摘要设置

配置组：`summary`

摘要设置用于控制文章摘要是否生成、是否注入前台摘要框，以及摘要框的基础展示文案和动画。

## 配置项

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 是否启用文章摘要 | `enable` | `true` | 关闭后将不会生成摘要内容。 |
| 是否注入前端 UI | `enableUiInjection` | `true` | 关闭后不注入摘要框 UI，但仍可生成摘要内容入库。 |
| 摘要框标题 | `summaryTitle` | `文章摘要` | 摘要框顶部显示的标题。 |
| AI 模型名称 | `gptName` | `智阅GPT` | 摘要框中展示的模型或助手名称。 |
| 打字机速度 | `typeSpeed` | `20` | 打字机动画速度，单位为毫秒每字符。 |
| 启用打字机效果 | `typewriter` | `true` | 控制摘要内容是否以打字机动画展示。 |

## 启用逻辑

### `enable`

控制摘要功能本身。

- 开启：文章可以生成摘要。
- 关闭：不再生成摘要内容。

### `enableUiInjection`

控制前台是否自动显示插件内置摘要框。

- 开启：插件会向前台注入摘要框所需的 CSS、JS 和 DOM。
- 关闭：摘要内容仍可生成入库，但前台不会自动显示摘要框。

## 适用场景

| 场景 | 推荐配置 |
| --- | --- |
| 使用插件默认摘要框 | `enable = true`，`enableUiInjection = true` |
| 只想生成摘要，主题自己展示 | `enable = true`，`enableUiInjection = false` |
| 暂停摘要功能 | `enable = false` |
| 想要更快展示摘要 | `typewriter = false` |

## 文案建议

- `summaryTitle` 可改为“本文摘要”“AI 摘要”“快速导读”等。
- `gptName` 可使用站点品牌名，例如“某某博客 AI 助手”。
- 如果站点风格偏正式，建议关闭打字机效果或调快速度。

## 注意事项

- 摘要生成使用 [AI 设置](./ai-settings.md) 中的摘要语言模型或主语言模型。
- 摘要提示词由 [角色设置](./role-settings.md) 中的 `summarySystemPrompt` 控制。
- 前台摘要框的视觉样式由 [摘要框样式设置](./summary-style-settings.md) 控制。
