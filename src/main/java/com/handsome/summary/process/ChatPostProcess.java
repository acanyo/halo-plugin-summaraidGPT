package com.handsome.summary.process;

import com.handsome.summary.Constant;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.plugin.ReactiveSettingFetcher;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

@Component
@RequiredArgsConstructor
public class ChatPostProcess implements TemplateHeadProcessor {

    static final PropertyPlaceholderHelper
        PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");

    private static String CSS_CONTENT = "";

    private final ReactiveSettingFetcher settingFetcher;

    private final ReactiveExtensionClient client;
    private final SettingConfigGetter settingConfigGetter;

    @Override
    public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
        IElementModelStructureHandler iElementModelStructureHandler) {
        final IModelFactory modelFactory = iTemplateContext.getModelFactory();
        String name = iTemplateContext.getVariable("name") == null ? null : iTemplateContext.getVariable("name").toString();
        if (name != null && !name.isEmpty()) {
            return client.fetch(Post.class, name)
                .flatMap(postContent -> Mono.zip(
                        settingConfigGetter.getSummaryConfig(),
                        settingConfigGetter.getStyleConfig(),
                        settingConfigGetter.getBasicConfig()
                    )
                    .map(tuple -> buildLikccSummaryBoxScript(tuple.getT1(), tuple.getT2(), tuple.getT3()))
                    .flatMap(jsContent -> insertJsAndCss(jsContent, iModel, modelFactory))
                );
        } else {
            return Mono.zip(
                    settingConfigGetter.getSummaryConfig(),
                    settingConfigGetter.getStyleConfig(),
                    settingConfigGetter.getBasicConfig()
                )
                .map(tuple -> buildLikccSummaryBoxScript(tuple.getT1(), tuple.getT2(), tuple.getT3()))
                .flatMap(jsContent -> insertJsAndCss(jsContent, iModel, modelFactory));
        }
    }

    private Mono<Void> insertJsAndCss(String jsContent, IModel iModel, IModelFactory modelFactory) {
        // 1. 插入 CSS
        String cssTag = "<link rel=\"stylesheet\" href=\"/plugins/summaraidGPT/assets/static/summary.css\" />";
        // 2. 插入主 JS 脚本
        String mainJsTag = "<script src=\"/plugins/summaraidGPT/assets/static/summary.js\"></script>";
        // 3. 插入你的动态 JS
        String fullScript = cssTag + "\n" + mainJsTag + "\n" + jsContent;
        iModel.add(modelFactory.createText(fullScript));
        return Mono.empty();
    }

    private String buildLikccSummaryBoxScript(
            SettingConfigGetter.SummaryConfig summaryConfig,
            SettingConfigGetter.StyleConfig styleConfig,
            SettingConfigGetter.BasicConfig basicConfig) {
        final Properties properties = new Properties();
        properties.setProperty("enable", "true");
        properties.setProperty("logo", nvl(styleConfig.getLogo(), "icon.svg"));
        properties.setProperty("summaryTitle", nvl(summaryConfig.getSummaryTitle(), "文章摘要"));
        properties.setProperty("gptName", nvl(summaryConfig.getGptName(), "智阅GPT"));
        properties.setProperty("content", nvl(summaryConfig.getGptName(), "近年来，深度学习和大模型的发展极大提升了AI的感知与推理能力。以GPT-4为代表的生成式AI，能够自动撰写文章、生成代码，甚至进行复杂的逻辑推理。这些能力不仅提升了生产效率，也为内容创作、教育、科研等领域带来了革命性的变革。"));
        properties.setProperty("typeSpeed", String.valueOf(summaryConfig.getTypeSpeed() != null ? summaryConfig.getTypeSpeed() : 20));
        properties.setProperty("target", nvl(summaryConfig.getTarget(), ".article-content"));
        properties.setProperty("darkSelector", nvl(summaryConfig.getDarkSelector(), "data-theme=dark"));
        properties.setProperty("themeName", nvl(styleConfig.getThemeName(), "custom"));
        properties.setProperty("typewriter", String.valueOf(summaryConfig.getTypewriter() != null ? summaryConfig.getTypewriter() : true));
        properties.setProperty("whitelist", summaryConfig.getWhitelist() != null ? summaryConfig.getWhitelist() : "[]");
        // 主题对象
        String theme = String.format("{bg: '%s', main: '%s', contentFontSize: '%s', title: '%s', content: '%s', gptName: '%s', contentBg: '%s', border: '%s', shadow: '%s', tagBg: '%s', cursor: '%s'}",
            nvl(styleConfig.getThemeBg(), "#f7f9fe"),
            nvl(styleConfig.getThemeMain(), "#4F8DFD"),
            nvl(styleConfig.getThemeContentFontSize(), "16px"),
            nvl(styleConfig.getThemeTitle(), "#3A5A8C"),
            nvl(styleConfig.getThemeContent(), "#222"),
            nvl(styleConfig.getThemeGptName(), "#7B88A8"),
            nvl(styleConfig.getThemeContentBg(), "#fff"),
            nvl(styleConfig.getThemeBorder(), "#e3e8f7"),
            nvl(styleConfig.getThemeShadow(), "0 2px 12px 0 rgba(60,80,180,0.08)"),
            nvl(styleConfig.getThemeTagBg(), "#f0f4ff"),
            nvl(styleConfig.getThemeCursor(), "#4F8DFD")
        );
        properties.setProperty("theme", theme);
        String script = """
            <script>
                // 摘要框渲染函数
                function showLikccSummaryBox() {
                    likcc_summaraidGPT_initSummaryBox({
                        enable: ${enable}, // 是否启用AI摘要框
                        logo: '${logo}', // Logo图片路径
                        summaryTitle: '${summaryTitle}', // 摘要框标题
                        gptName: '${gptName}', // AI模型名称
                        content: '${content}',
                        typeSpeed: ${typeSpeed}, // 打字机动画速度（毫秒/字符）
                        target: '${target}', // 摘要框插入目标元素选择器
                        darkSelector: '${darkSelector}', // 跟随网站深色模式自动切换
                        // 主题选择：
                        // 1. themeName: 'custom' + theme: {...} 用自定义配色
                        // 2. themeName: 'blue' | 'default' | 'green' 用内置主题
                        // 3. darkSelector 命中时自动切换 dark 主题
                        themeName: '${themeName}', // 'custom' 用 theme 配色，'blue' 用内置主题
                        theme: ${theme},
                        typewriter: ${typewriter}, // 是否启用打字机效果
                        whitelist: ${whitelist} // 只在 /post/ 路径下显示
                    });
                }
                document.addEventListener('DOMContentLoaded', showLikccSummaryBox, { once: true });
                document.addEventListener('pjax:success', showLikccSummaryBox);
            </script>
            """;
        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(script, properties);
    }

    private String nvl(String value, String defaultValue) {
        return value != null && !value.isEmpty() ? value : defaultValue;
    }
}