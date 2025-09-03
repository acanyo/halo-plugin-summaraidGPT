package com.handsome.summary.process;

import com.handsome.summary.service.SettingConfigGetter;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

@Slf4j
@Component
@RequiredArgsConstructor
public class SummaryHeadProcessor implements TemplateHeadProcessor {

    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");

    private final PluginWrapper pluginWrapper;
    private final SettingConfigGetter settingConfigGetter;

    @Override
    public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
        IElementModelStructureHandler iElementModelStructureHandler) {
        
        final IModelFactory modelFactory = iTemplateContext.getModelFactory();
        String name = iTemplateContext.getVariable("name") == null ? null : iTemplateContext.getVariable("name").toString();
        
        if (name != null && !name.isEmpty()) {
            // 文章页面，注入摘要和对话功能
            return settingConfigGetter.getSummaryConfig()
                .flatMap(summaryConfig -> Mono.zip(
                    settingConfigGetter.getStyleConfig(),
                    settingConfigGetter.getAssistantConfig()
                ).map(tuple -> buildHeadScripts(tuple.getT1(), tuple.getT2(), true))
                .flatMap(scriptContent -> insertScripts(scriptContent, iModel, modelFactory)));
        } else {
            // 非文章页面，只注入对话功能
            return settingConfigGetter.getAssistantConfig()
                .map(assistantConfig -> buildHeadScripts(null, assistantConfig, false))
                .flatMap(scriptContent -> insertScripts(scriptContent, iModel, modelFactory));
        }
    }

    /**
     * 向页面插入所需的 CSS、JS 脚本和动态初始化代码
     */
    private Mono<Void> insertScripts(String scriptContent, IModel iModel, IModelFactory modelFactory) {
        // 获取插件版本号
        String version = pluginWrapper.getDescriptor().getVersion();
        
        // 插入 CSS，添加版本号参数
        String cssTag = "<!-- plugin-summaraidGPT start -->\n<link rel=\"stylesheet\" href=\"/plugins/summaraidGPT/assets/static/ArticleSummary.css?version=" + version + "\" />";
        String dialogCssTag = "<link rel=\"stylesheet\" href=\"/plugins/summaraidGPT/assets/static/article-ai-dialog.css?version=" + version + "\" />";
        
        // 插入主 JS 脚本，添加版本号参数
        String mainJsTag = "<script src=\"/plugins/summaraidGPT/assets/static/ArticleSummary.js?version=" + version + "\"></script>";
        String dialogJsTag = "<script src=\"/plugins/summaraidGPT/assets/static/article-ai-dialog.umd.cjs?version=" + version + "\"></script>"
            + "\n<!-- plugin-summaraidGPT end -->\n";
        
        // 拼接完整 HTML 内容
        String fullScript = String.join("\n", cssTag, mainJsTag, dialogCssTag, dialogJsTag, scriptContent);
        iModel.add(modelFactory.createText(fullScript));
        return Mono.empty();
    }

    /**
     * 构建动态 JS 初始化代码
     */
    private String buildHeadScripts(SettingConfigGetter.StyleConfig styleConfig, 
                                   SettingConfigGetter.AssistantConfig assistantConfig, 
                                   boolean isPost) {
        
        StringBuilder scripts = new StringBuilder();
        
        // 摘要框现在通过ai-summaraidGPT标签自动处理，无需额外脚本
        
        if (assistantConfig != null) {
            // 添加对话功能初始化
            scripts.append(buildDialogScript(assistantConfig));
        }
        
        return scripts.toString();
    }
    

    
    /**
     * 构建对话功能初始化脚本
     */
    private String buildDialogScript(SettingConfigGetter.AssistantConfig assistantConfig) {
        final Properties properties = getDialogProperties(assistantConfig);
        
        String script = """
            <script>
                const dialog = new ArticleAIDialog({
                    useApiConfig: true,
                    articleSelector: '#article'
                });
            </script>
            """;
        
        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(script, properties);
    }


    
    @NotNull
    private Properties getDialogProperties(SettingConfigGetter.AssistantConfig assistantConfig) {
        final Properties properties = new Properties();
        
        // 对话功能相关配置
        properties.setProperty("assistantIcon", nvl(assistantConfig.getAssistantIcon(), "/plugins/summaraidGPT/assets/static/icon.svg"));
        properties.setProperty("assistantName", nvl(assistantConfig.getAssistantName(), "智阅GPT助手"));
        properties.setProperty("inputPlaceholder", nvl(assistantConfig.getInputPlaceholder(), "请输入您想了解的问题..."));
        properties.setProperty("dialogType", nvl(assistantConfig.getDialogType(), "overlay"));
        properties.setProperty("buttonPosition", nvl(assistantConfig.getButtonPosition(), "right"));
        
        return properties;
    }

    private String nvl(String value, String defaultValue) {
        return value != null && !value.isEmpty() ? value : defaultValue;
    }
}

