package com.handsome.summary.process;

import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
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

    private final PluginWrapper pluginWrapper;
    private final SettingConfigGetter settingConfigGetter;

    @Override
    public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
        IElementModelStructureHandler iElementModelStructureHandler) {
        
        final IModelFactory modelFactory = iTemplateContext.getModelFactory();
        
        // 检查配置是否启用，根据启用的功能选择性注入资源
        return checkConfigAndInsertScripts(iModel, modelFactory);
    }

    /**
     * 检查配置并决定是否注入脚本
     */
    private Mono<Void> checkConfigAndInsertScripts(IModel iModel, IModelFactory modelFactory) {
        return Mono.zip(
            settingConfigGetter.getSummaryConfig(),
            settingConfigGetter.getAssistantConfig(),
            settingConfigGetter.getArticleReadingConfig()
        ).flatMap(tuple -> {
            SettingConfigGetter.SummaryConfig summaryConfig = tuple.getT1();
            SettingConfigGetter.AssistantConfig assistantConfig = tuple.getT2();
            SettingConfigGetter.ArticleReadingConfig articleReadingConfig = tuple.getT3();
            // 检查摘要、洞察图谱和助手功能是否启用
            boolean isSummaryEnabled = summaryConfig.getEnable() != null && summaryConfig.getEnable();
            boolean isAssistantEnabled = assistantConfig.getEnableAssistant() != null && assistantConfig.getEnableAssistant();
            boolean isArticleReadingEnabled = articleReadingConfig.getEnable() == null
                || articleReadingConfig.getEnable();
            boolean isArticleReadingUiEnabled = isArticleReadingEnabled
                && (articleReadingConfig.getEnableUiInjection() == null
                || articleReadingConfig.getEnableUiInjection());
            boolean needsArticleSummaryAssets = isSummaryEnabled || isArticleReadingUiEnabled;
            if (!needsArticleSummaryAssets && !isAssistantEnabled) {
                return Mono.empty();
            }
            return insertScripts(iModel, modelFactory, needsArticleSummaryAssets, isAssistantEnabled);
        }).onErrorResume(error -> Mono.empty());
    }

    /**
     * 向页面插入所需的 CSS、JS 脚本和动态初始化代码
     */
    private Mono<Void> insertScripts(IModel iModel, IModelFactory modelFactory, 
                                   boolean needsArticleSummaryAssets, boolean isAssistantEnabled) {
        // 获取插件版本号
        String version = pluginWrapper.getDescriptor().getVersion();
        StringBuilder scriptBuilder = new StringBuilder();
        scriptBuilder.append("<!-- plugin-summaraidGPT start -->\n");
        
        // 根据启用的功能选择性注入资源
        if (needsArticleSummaryAssets) {
            // 摘要和洞察图谱共用 ArticleSummary 入口，样式已内置在 Lit 组件中
            scriptBuilder.append("<script src=\"/plugins/summaraidGPT/assets/static/ArticleSummary.js?version=")
                        .append(version).append("\"></script>\n");
        }
        
        if (isAssistantEnabled) {
            // 前台智能助手资源，样式已内置在 Lit 组件中
            scriptBuilder.append("<script src=\"/plugins/summaraidGPT/assets/static/RagAssistant.js?version=")
                        .append(version).append("\"></script>\n");
        }
        
        scriptBuilder.append("<!-- plugin-summaraidGPT end -->\n");
        
        // 添加脚本到页面
        iModel.add(modelFactory.createText(scriptBuilder.toString()));
        return Mono.empty();
    }

}
