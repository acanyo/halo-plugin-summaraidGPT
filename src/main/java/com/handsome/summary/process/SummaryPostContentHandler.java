
package com.handsome.summary.process;

import com.handsome.summary.reading.service.ArticleReadingService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.theme.ReactivePostContentHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class SummaryPostContentHandler implements ReactivePostContentHandler {
    
    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");
    
    private final SettingConfigGetter settingConfigGetter;
    private final ObjectProvider<ArticleReadingService> articleReadingServiceProvider;

    @Override
    public Mono<PostContentContext> handle(@NotNull PostContentContext contentContext) {
        return Mono.zip(
            settingConfigGetter.getSummaryConfig(),
            settingConfigGetter.getArticleReadingConfig()
        ).map(tuple -> {
            var summaryConfig = tuple.getT1();
            var articleReadingConfig = tuple.getT2();
            // 检查摘要功能是否启用
            boolean isSummaryEnabled = summaryConfig.getEnable() != null && summaryConfig.getEnable();
            // 检查是否注入摘要框UI
            boolean isSummaryUiEnabled = summaryConfig.getEnableUiInjection() == null || summaryConfig.getEnableUiInjection();
            boolean isArticleReadingEnabled = articleReadingConfig.getEnable() == null
                || articleReadingConfig.getEnable();
            boolean isArticleReadingUiEnabled = isArticleReadingEnabled
                && (articleReadingConfig.getEnableUiInjection() == null
                || articleReadingConfig.getEnableUiInjection());
            boolean isArticleReadingAutoGenerate = isArticleReadingEnabled
                && (articleReadingConfig.getAutoGenerate() == null
                || articleReadingConfig.getAutoGenerate());

            if (!isSummaryEnabled && !isArticleReadingEnabled) {
                return contentContext;
            }

            injectSummaryDOM(
                contentContext,
                isSummaryEnabled && isSummaryUiEnabled,
                isSummaryEnabled && !isSummaryUiEnabled,
                isArticleReadingUiEnabled
            );
            if (isArticleReadingAutoGenerate) {
                scheduleArticleReading(contentContext.getPost());
            }
            return contentContext;
        }).onErrorResume(e -> Mono.just(contentContext));
    }

    private void scheduleArticleReading(Post post) {
        if (post == null || post.getMetadata() == null) {
            return;
        }
        var postName = post.getMetadata().getName();
        var articleReadingService = articleReadingServiceProvider.getIfAvailable();
        if (articleReadingService == null) {
            return;
        }
        articleReadingService.ensureGenerated(postName)
            .subscribe(
                reading -> log.debug("洞察图谱生成完成，文章: {}", postName),
                error -> log.warn("洞察图谱生成失败，文章: {}, 错误: {}",
                    postName, error.getMessage())
            );
    }

    private void injectSummaryDOM(PostContentContext contentContext, boolean injectSummaryUi,
        boolean injectSummaryData, boolean injectArticleReadingUi) {
        Properties properties = new Properties();
        Post post = contentContext.getPost();
        properties.setProperty("kind", Post.GVK.kind());
        properties.setProperty("group", Post.GVK.group());
        properties.setProperty("name", post.getMetadata().getName());
        
        StringBuilder domBuilder = new StringBuilder();
        
        if (injectSummaryUi) {
            String summaryDOM = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
                "<ai-summaraidGPT kind=\"${kind}\" group=\"${group}\" name=\"${name}\"></ai-summaraidGPT>\n",
                properties
            );
            domBuilder.append(summaryDOM);
        }
        if (injectArticleReadingUi) {
            String readingDOM = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
                "<ai-summaraidGPT-reading kind=\"${kind}\" group=\"${group}\" name=\"${name}\"></ai-summaraidGPT-reading>\n",
                properties
            );
            domBuilder.append(readingDOM);
        }
        if (injectSummaryData) {
            String hiddenDataTag = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
                "<ai-summaraidGPT-data kind=\"${kind}\" group=\"${group}\" name=\"${name}\" style=\"display:none;\"></ai-summaraidGPT-data>\n",
                properties
            );
            domBuilder.append(hiddenDataTag);
        }
        
        if (!domBuilder.isEmpty()) {
            contentContext.setContent(domBuilder.toString() + contentContext.getContent());
        }
    }
}
