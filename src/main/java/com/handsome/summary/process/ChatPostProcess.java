package com.handsome.summary.process;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Collectors;

import com.handsome.summary.Constant;
import lombok.*;
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

    List<String> urlPatterns = new ArrayList<>();
    List<String> blacklist = new ArrayList<>();

    @Override
    public Mono<Void> process(ITemplateContext iTemplateContext, IModel iModel,
        IElementModelStructureHandler iElementModelStructureHandler) {

        final IModelFactory modelFactory = iTemplateContext.getModelFactory();

        if (!"post".equals(iTemplateContext.getVariable(Constant.TEMPLATE_ID_VARIABLE))) {
            return Mono.empty();
        }

        return client.fetch(Post.class, iTemplateContext.getVariable("name").toString())
            .flatMap(postContent -> jsConfigTemplate(postContent.getStatus().getExcerpt())
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
                })
            );
    }

    public Mono<String> jsConfigTemplate(String postSummary) {
        return settingFetcher.get("summary")
            .switchIfEmpty(Mono.error(new RuntimeException("配置不存在")))
            .flatMap(item -> {
                ChatConfig config = new ChatConfig(
                    item.path("enableSummary").asBoolean(false), // path() 不会返回 null
                    item.path("postSelector").asText("article"),
                    item.path("summaryWidth").asText(),
                    item.path("title").asText("文章摘要"),
                    item.path("source").asText("SummaraidGPT"),
                    item.path("summaryStyle").asText(Constant.DEFAULT_CSS),
                    item.path("darkModeSelector").asText(),
                    item.path("postURL").asText("*/archives/*"),
                    item.path("blacklist").asText(""),
                    item.path("customizeIco").asText(Constant.DEFAULT_ICON),
                    item.path("summaryTheme").asText("default"),
                    item.path("postSummary").asText(postSummary)
                );
                urlPatterns = Arrays.stream(config.getPostURL().split("\n"))
                    .map(String::trim)            // 去除首尾空格
                    .filter(s -> !s.isEmpty())    // 过滤空字符串
                    .map(s -> "\"" + s + "\"")    // 为每个元素添加双引号（如 "*/archives/*"）
                    .collect(Collectors.toList());
                blacklist = Arrays.stream(config.getBlacklist().split("\n"))
                    .map(String::trim)            // 去除首尾空格
                    .filter(s -> !s.isEmpty())    // 过滤空字符串
                    .map(s -> "\"" + s + "\"")    // 为每个元素添加双引号（如 "*/archives/*"）
                    .collect(Collectors.toList());
                return Mono.just(config);
            })
            .map(this::buildScriptContent);
    }

    private String buildScriptContent(ChatConfig config) {
        CSS_CONTENT = config.getSummaryStyle() != null ? config.getSummaryStyle()
            : Constant.DEFAULT_CSS;
        final Properties properties = new Properties();
        
        // 处理摘要文本
        String processedSummary = processText(config.getPostSummary());
        
        properties.setProperty("postSelector", config.getPostSelector());
        properties.setProperty("summaryTheme", config.getSummaryTheme());
        properties.setProperty("checkbox", config.getCheckbox().toString());
        properties.setProperty("urlPatterns", urlPatterns.toString());
        properties.setProperty("blacklist", blacklist.toString());
        properties.setProperty("darkModeSelector",
            Optional.ofNullable(config.getDarkModeSelector()).orElse("null"));
        properties.setProperty("customizeIco", config.getCustomizeIco());
        properties.setProperty("title", config.getTitle());
        properties.setProperty("summary", processedSummary);  // 使用处理后的文本
        properties.setProperty("source", config.getSource());
        properties.setProperty("summaryWidth", Optional.of(config.getSummaryWidth()).orElse(null));

        String script = """
            <script>
                const articleConfig = {
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

    @Data
    @AllArgsConstructor
    static class ChatConfig {
        private Boolean checkbox;
        private String postSelector;
        private String summaryWidth;
        private String title;
        private String source;
        private String summaryStyle;
        private String darkModeSelector;
        private String postURL;
        private String blacklist;
        private String customizeIco;
        private String summaryTheme;
        private String postSummary;
    }
}