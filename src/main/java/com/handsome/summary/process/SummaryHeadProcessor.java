package com.handsome.summary.process;

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

    @Override
    public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
        IElementModelStructureHandler iElementModelStructureHandler) {
        
        final IModelFactory modelFactory = iTemplateContext.getModelFactory();
        
        // 只注入CSS和JS文件，不需要动态配置
        return insertScripts(iModel, modelFactory);
    }

    /**
     * 向页面插入所需的 CSS、JS 脚本和动态初始化代码
     */
    private Mono<Void> insertScripts(IModel iModel, IModelFactory modelFactory) {
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
        String fullScript = String.join("\n", cssTag, mainJsTag, dialogCssTag, dialogJsTag);
        iModel.add(modelFactory.createText(fullScript));
        return Mono.empty();
    }

}

