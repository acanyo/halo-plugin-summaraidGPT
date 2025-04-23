package com.handsome.summary.process;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Collectors;

import com.handsome.summary.Constant;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.*;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.content.ContentWrapper;
import run.halo.app.content.PostContentService;
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
    List<String> urlPatterns = new ArrayList<>();
    List<String> blacklist = new ArrayList<>();
    public static String getTemplateId(ITemplateContext context) {
        try {
            String  templateName = context.getVariable(Constant.TEMPLATE_ID_VARIABLE).toString();
            return templateName != null && !templateName.isEmpty() ? templateName : "";
        }catch (Exception e){
            return "";
        }
    }
    @Override
    public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
        IElementModelStructureHandler iElementModelStructureHandler) {

        final IModelFactory modelFactory = iTemplateContext.getModelFactory();

        // if (!"post".equals(getTemplateId(iTemplateContext))) {
        //     return Mono.empty();
        // }
        String name = iTemplateContext.getVariable("name") == null ? null : iTemplateContext.getVariable("name").toString();
        if (name!= null && !name.isEmpty()) {
            return client.fetch(Post.class,name)
                .flatMap(postContent -> insertJsAndCss(postContent.getStatus().getExcerpt(), iModel,
                    modelFactory)
                );
        }else {
           return insertJsAndCss("非文章页面不载入摘要", iModel, modelFactory);
        }
    }

    @NotNull
    private Mono<Void> insertJsAndCss(String postContent, IModel iModel,
        IModelFactory modelFactory) {
        return jsConfigTemplate(postContent)
            .flatMap(jsConfig -> {
                // 生成 CSS 和 JS 标签
                String cssContent =
                    String.format("<link rel=\"stylesheet\" href=\"%s\" />", CSS_CONTENT);
                String scriptTag =
                    String.format("<script src=\"%s\"></script>", Constant.scriptUrl);
                // 拼接完整的 HTML 内容
                String fullScript = cssContent + "\n" + scriptTag + "\n" + jsConfig;
                iModel.add(modelFactory.createText(fullScript));
                return Mono.empty();
            });
    }

 

    public Mono<String> jsConfigTemplate(String postSummary) {
        return  settingConfigGetter.getChatConfig()
            .switchIfEmpty(Mono.error(new RuntimeException("无法获取摘要配置")))
            .flatMap(config -> {
                if (postSummary !=null && Objects.equals("非文章页面不载入摘要",postSummary)){
                    config.setEnableSummary(false);
                }
                config.setPostSummary(postSummary);
                // 处理URL模式
                this.urlPatterns = Optional.ofNullable(config.getPostURL())
                    .map(url -> Arrays.stream(url.split("\n"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(s -> "\"" + s + "\"")
                        .collect(Collectors.toList()))
                    .orElseGet(ArrayList::new);

                // 处理黑名单
                this.blacklist = Optional.ofNullable(config.getBlacklist())
                    .map(list -> Arrays.stream(list.split("\n"))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(s -> "\"" + s + "\"")
                        .collect(Collectors.toList()))
                    .orElseGet(ArrayList::new);
                return Mono.just(config);
            })
            .map(this::buildScriptContent);
    }

    private String buildScriptContent(SettingConfigGetter.ChatConfig config) {
        CSS_CONTENT = config.getSummaryStyle() != null ? config.getSummaryStyle()
            : Constant.DEFAULT_CSS;
        final Properties properties = new Properties();

        // 处理摘要文本
        String processedSummary = processText(config.getPostSummary());

        properties.setProperty("postSelector", config.getPostSelector());
        properties.setProperty("summaryTheme", config.getSummaryTheme());
        properties.setProperty("checkbox", config.getEnableSummary().toString());
        properties.setProperty("urlPatterns", urlPatterns.toString());
        properties.setProperty("blacklist", blacklist.toString());
        properties.setProperty("darkModeSelector",
            String.valueOf(config.getDarkModeSelector()));
        properties.setProperty("customizeIco", config.getCustomizeIco());
        properties.setProperty("title", config.getTitle());
        properties.setProperty("summary", processedSummary);
        properties.setProperty("source", config.getSource());

        String script = """
            <script>
                window.articleConfig = {
                    container: '${postSelector}',
                    theme: '${summaryTheme}',
                    enableSummary: ${checkbox},
                    urlPatterns: ${urlPatterns},
                    blacklist: ${blacklist},
                    darkModeSelector: '${darkModeSelector}',
                    summaryWidth: '${summaryWidth}',
                    content: {
                        icon: '${customizeIco}',
                        title: '${title}',
                        text: '${summary}',
                        source: '${source}'
                    },
                    responsive: {
                        mobile: {
                            maxWidth: '768px',
                            fontSize: '13px',
                            padding: '12px'
                        }
                    }
                };
            </script>
            """;
        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(script, properties);
    }

    private String processText(String text) {
        if (text == null) {
            return "";
        }

        return text
            // 处理换行和空格
            .replace("\n", " ")
            .replace("\r", " ")
            .replaceAll("\\s+", " ")
            .trim()
            // 处理JavaScript特殊字符
            .replace("\\", "\\\\")  // 必须先处理反斜杠
            .replace("\"", "\\\"")
            .replace("'", "\\'")
            .replace("\b", "\\b")
            .replace("\f", "\\f")
            .replace("\t", "\\t");
    }
}