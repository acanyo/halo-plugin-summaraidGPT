// package com.handsome.summary.process;
//
// import com.handsome.summary.service.SettingConfigGetter;
// import java.util.Properties;
// import lombok.RequiredArgsConstructor;
// import org.jetbrains.annotations.NotNull;
// import org.pf4j.PluginWrapper;
// import org.springframework.stereotype.Component;
// import org.springframework.util.PropertyPlaceholderHelper;
// import org.thymeleaf.context.ITemplateContext;
// import org.thymeleaf.model.IModel;
// import org.thymeleaf.model.IModelFactory;
// import org.thymeleaf.processor.element.IElementModelStructureHandler;
// import reactor.core.publisher.Mono;
// import run.halo.app.core.extension.content.Post;
// import run.halo.app.extension.ReactiveExtensionClient;
// import run.halo.app.theme.dialect.TemplateHeadProcessor;
//
// @Component
// @RequiredArgsConstructor
// public class ChatPostProcess implements TemplateHeadProcessor {
//
//     static final PropertyPlaceholderHelper
//         PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");
//
//     private final PluginWrapper pluginWrapper;
//     private final ReactiveExtensionClient client;
//     private final SettingConfigGetter settingConfigGetter;
//
//     @Override
//     public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
//         IElementModelStructureHandler iElementModelStructureHandler) {
//         final IModelFactory modelFactory = iTemplateContext.getModelFactory();
//         String name = iTemplateContext.getVariable("name") == null ? null : iTemplateContext.getVariable("name").toString();
//         if (name != null && !name.isEmpty()) {
//             return client.fetch(Post.class, name)
//                 .flatMap(postContent -> Mono.zip(
//                         settingConfigGetter.getSummaryConfig(),
//                         settingConfigGetter.getStyleConfig(),
//                         settingConfigGetter.getBasicConfig()
//                     )
//                     .map(tuple -> buildLikccSummaryBoxScript(tuple.getT1(), tuple.getT2(), tuple.getT3(),true))
//                     .flatMap(jsContent -> insertJsAndCss(jsContent, iModel, modelFactory))
//                 );
//         } else {
//             return Mono.zip(
//                     settingConfigGetter.getSummaryConfig(),
//                     settingConfigGetter.getStyleConfig(),
//                     settingConfigGetter.getBasicConfig()
//                 )
//                 .map(tuple -> buildLikccSummaryBoxScript(tuple.getT1(), tuple.getT2(), tuple.getT3(),false))
//                 .flatMap(jsContent -> insertJsAndCss(jsContent, iModel, modelFactory));
//         }
//     }
//
//     /**
//      * 向页面插入摘要框所需的 CSS、主 JS 脚本和动态初始化 JS。
//      */
//     private Mono<Void> insertJsAndCss(String jsContent, IModel iModel, IModelFactory modelFactory) {
//         // 获取插件版本号
//         String version = pluginWrapper.getDescriptor().getVersion();
//         // 插入 CSS，添加版本号参数
//         String cssTag = "<link rel=\"stylesheet\" href=\"/plugins/summaraidGPT/assets/static/ArticleSummary.css?version=" + version + "\" />";
//         String css1Tag = "<link rel=\"stylesheet\" href=\"/plugins/summaraidGPT/assets/static/article-ai-dialog.css?version=" + version + "\" />";
//         // 插入主 JS 脚本，添加版本号参数
//         String mainJsTag = "<script src=\"/plugins/summaraidGPT/assets/static/ArticleSummary.js?version=" + version + "\"></script>";
//         String main1JsTag = "<script src=\"/plugins/summaraidGPT/assets/static/article-ai-dialog.umd.cjs?version=" + version + "\"></script>";
//         // 拼接完整 HTML 内容
//         String fullScript = String.join("\n", cssTag, mainJsTag, css1Tag, main1JsTag, jsContent);
//         iModel.add(modelFactory.createText(fullScript));
//         return Mono.empty();
//     }
//
//     /**
//      * 构建 likcc 摘要框的动态 JS 初始化代码。
//      * 参数全部动态化，模板结构优雅，便于维护。
//      */
//     private String buildLikccSummaryBoxScript(
//             SettingConfigGetter.SummaryConfig summaryConfig,
//             SettingConfigGetter.StyleConfig styleConfig,
//             SettingConfigGetter.BasicConfig basicConfig,Boolean isPost) {
//         final Properties properties = getProperties(summaryConfig, styleConfig);
//         // JS 初始化模板
//         // JS 初始化模板
//         String script = """
//             <script>
//                 // 摘要框渲染函数
//                 function showLikccSummaryBox() {
//                     likcc_summaraidGPT_initSummaryBox({
//                         logo: '${logo}', // Logo图片路径
//                         summaryTitle: '${summaryTitle}',
//                         gptName: '${gptName}', // AI模型名称
//                         typeSpeed: ${typeSpeed}, // 打字机动画速度（毫秒/字符）
//                         target: '${target}', // 摘要框插入目标元素选择器
//                         darkSelector: '${darkSelector}', // 跟随网站深色模式自动切换
//                         // 主题选择：
//                         // 1. themeName: 'custom' + theme: {...} 用自定义配色
//                         // 2. themeName: 'blue' | 'default' | 'green' 用内置主题
//                         // 3. darkSelector 命中时自动切换 dark 主题
//                         themeName: '${themeName}', // 'custom' 用 theme 配色，'blue' 用内置主题
//                         theme: ${theme},
//                         typewriter: ${typewriter}, // 是否启用打字机效果
//                         whitelist: '${whitelist}' // 只在指定路径下显示
//                     });
//                 }
//                 document.addEventListener('DOMContentLoaded', showLikccSummaryBox, { once: true });
//                 document.addEventListener('pjax:success', showLikccSummaryBox);
//                 document.addEventListener('pjax:complete', showLikccSummaryBox);
//             </script>
//             <script>
//               const dialog = new ArticleAIDialog({
//                                                 useApiConfig: true,
//                                                 articleSelector: '#article'
//                                             })
//             </script>
//             """;
//         return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(script, properties);
//     }
//
//     @NotNull
//     private Properties getProperties(SettingConfigGetter.SummaryConfig summaryConfig,
//         SettingConfigGetter.StyleConfig styleConfig) {
//         final Properties properties = new Properties();
//         // 动态参数填充
//         // 动态参数填充
//         properties.setProperty("logo", nvl(styleConfig.getLogo(), "icon.svg"));
//         properties.setProperty("summaryTitle", nvl(summaryConfig.getSummaryTitle(), "文章摘要"));
//         properties.setProperty("gptName", nvl(summaryConfig.getGptName(), "智阅GPT"));
//         properties.setProperty("typeSpeed", String.valueOf(
//             summaryConfig.getTypeSpeed() != null ? summaryConfig.getTypeSpeed() : 20));
//         properties.setProperty("target", nvl(summaryConfig.getTarget(), ".article-content"));
//         properties.setProperty("darkSelector", nvl(summaryConfig.getDarkSelector(), ""));
//         properties.setProperty("themeName", nvl(styleConfig.getThemeName(), "custom"));
//         properties.setProperty("typewriter", String.valueOf(
//             summaryConfig.getTypewriter() != null ? summaryConfig.getTypewriter() : true));
//         // whitelist 直接用字符串
//         properties.setProperty("whitelist", summaryConfig.getWhitelist() != null ? summaryConfig.getWhitelist() : "/archives/*");
//         // 主题对象动态组装
//         String theme = String.format("{bg: '%s', main: '%s', contentFontSize: '%s', title: '%s', content: '%s', gptName: '%s', contentBg: '%s', border: '%s', shadow: '%s', tagBg: '%s', cursor: '%s'}",
//             nvl(styleConfig.getThemeBg(), "#f7f9fe"),
//             nvl(styleConfig.getThemeMain(), "#4F8DFD"),
//             nvl(styleConfig.getThemeContentFontSize(), "16px"),
//             nvl(styleConfig.getThemeTitle(), "#3A5A8C"),
//             nvl(styleConfig.getThemeContent(), "#222"),
//             nvl(styleConfig.getThemeGptName(), "#7B88A8"),
//             nvl(styleConfig.getThemeContentBg(), "#fff"),
//             nvl(styleConfig.getThemeBorder(), "#e3e8f7"),
//             nvl(styleConfig.getThemeShadow(), "0 2px 12px 0 rgba(60,80,180,0.08)"),
//             nvl(styleConfig.getThemeTagBg(), "#f0f4ff"),
//             nvl(styleConfig.getThemeCursor(), "#4F8DFD")
//         );
//         properties.setProperty("theme", theme);
//         return properties;
//     }
//
//     private String nvl(String value, String defaultValue) {
//         return value != null && !value.isEmpty() ? value : defaultValue;
//     }
// }