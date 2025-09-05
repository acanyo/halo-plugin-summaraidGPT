
package com.handsome.summary.process;

import com.handsome.summary.service.SettingConfigGetter;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
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

    @Override
    public Mono<PostContentContext> handle(@NotNull PostContentContext contentContext) {
        return settingConfigGetter.getSummaryConfig()
            .map(summaryConfig -> {
                // 检查是否启用摘要功能
                if (summaryConfig.getEnable() == null || !summaryConfig.getEnable()) {
                    return contentContext;
                }
                injectSummaryDOM(contentContext);
                return contentContext;
            })
            .onErrorResume(e -> {
                log.error("Summary PostContent handle failed", e);
                return Mono.just(contentContext);
            });
    }

    private void injectSummaryDOM(PostContentContext contentContext) {
        Properties properties = new Properties();
        Post post = contentContext.getPost();
        properties.setProperty("kind", Post.GVK.kind());
        properties.setProperty("group", Post.GVK.group());
        properties.setProperty("name", post.getMetadata().getName());
        
        String summaryDOM = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
            "<ai-summaraidGPT kind=\"${kind}\" group=\"${group}\" name=\"${name}\"></ai-summaraidGPT>\n"
                + "<ai-dialog></ai-dialog>\n",
            properties
        );
        
        contentContext.setContent(summaryDOM + "\n" + contentContext.getContent());
    }
}

