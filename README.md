<img src="https://www.lik.cc/upload/icon.svg" alt="icon.svg" style="zoom: 200%;" />



# 智阅GPT-智能AI摘要

> 智阅点睛，一键洞见——基于AI大模型的Halo智能摘要解决方案
>
> 📦 [GitHub源码]( https://github.com/acanyo/halo-aipost-summaraidGPT)

# 📍演示站

| 网站名称     | 说明                             | 演示地址                                             |
| ------------ | :------------------------------- | ---------------------------------------------------- |
| **Handsome** | `插件开发者`                     | [Handsome]([首页｜Handsome](https://www.lik.cc/))    |
| **webjing**  | 主题开发\|插件开发\|本插件贡献者 | [webjing]([首页｜webjing](https://blog.webjing.cn/)) |

> 📌 本插件积极维护，欢迎通过 [Issue]([Issues · acanyo/halo-plugin-summaraidGPT](https://github.com/acanyo/halo-plugin-summaraidGPT/issues)) 提交需求或参与共建！

## 功能特性

- 🚀 **多AI驱动** - 大模型 + 文本算法双重摘要引擎
- 🎨 **多主题样式** - 支持5种预设主题（暗色/模糊/七彩等）
- 🛠️ **深度定制** - 可自定义CSS样式/标题/图标/提示语
- ⚡ **智能路由** - 通过URL规则精准匹配文章页面
- ⛔ **黑名单机制** - 灵活排除不需要摘要的页面

---

## 📥 安装指南
1. 在Halo后台进入「插件市场」
2. 搜索「智阅GPT-智能AI摘要」进行安装
3. 重启Halo服务
4. 或者进入📦 [GitHub源码]( https://github.com/acanyo/halo-aipost-summaraidGPT)下载jar手动上传

---

### 摘要设置
| 功能模块     | 核心配置项                 | 说明                                   |
| ------------ | -------------------------- | -------------------------------------- |
| **基础功能** | 开启文章摘要               | ✅ 启用开关                             |
| **内容选择** | 文章选择器                 | 默认 `article`（匹配HTML标签）         |
| **样式配置** | 摘要标题<br>CSS样式地址    | 默认「文章摘要」<br>支持自定义CSS文件  |
| **路由控制** | 文章URL规则<br>黑名单      | 默认 `*/archives/*`<br>英文逗号分隔URL |
| **主题适配** | 暗黑模式选择器<br>预设主题 | 自动切换深色模式<br>5种风格可选        |

------

## 🎨 主题样式库

| 主题名称     | 特性         | 适用场景   |
| :----------- | :----------- | :--------- |
| **默认主题** | 简约白底黑字 | 通用型     |
| **模糊主题** | 毛玻璃效果   | 视觉系博客 |
| **七彩主题** | 渐变背景     | 个性化站点 |
| **暗色主题** | 深色模式     | 夜间阅读   |
| **精简主题** | 无装饰元素   | 极简风格   |

默认主题

![样式1.png](https://www.lik.cc/upload/image-qpcq.png)

精简主题

![样式2.png](https://www.lik.cc/upload/image-ioaq.png)

七彩主题

![样式3.png](https://www.lik.cc/upload/image-cpfp.png)

模糊主题

![样式4.png](https://www.lik.cc/upload/image-kgge.png)

暗色主题

![样式5.png](https://www.lik.cc/upload/image-nrur.png)

更多样式还在开发中

------

## ⚙️ 配置说明

### 基础设置

目前仅支持千帆大模型(绝对不是因为他免费)，

> 🔑 密钥获取路径：[千帆控制台](https://console.bce.baidu.com/qianfan/overview) → 应用接入→创建应用→选择服务→ERNIE-Speed-128K→把对应的API Key和Secret Key 填入插件中

## ⚠️ 注意事项

1. **API调用成本**：千帆模型必须是用ERNIE-Speed-128K，因为他是免费的其他的造成经济损失不负责
2. **网络依赖**：需确保服务器可访问百度云API
3. **选择器验证**：使用浏览器开发者工具检查DOM结构
4. **样式覆盖**：自定义CSS需使用 `!important` 声明

------

## ❓ 常见问题

### Q1: 如何获取千帆API密钥？

前往[百度智能云控制台](https://console.bce.baidu.com/qianfan/overview)，创建应用后获取「API Key」和「Secret Key」

### Q2: 摘要样式不生效怎么办？

1. 检查CSS文件地址是否可公开访问
2. 清除浏览器缓存后重试
3. 在控制台查看CSS加载错误

------

