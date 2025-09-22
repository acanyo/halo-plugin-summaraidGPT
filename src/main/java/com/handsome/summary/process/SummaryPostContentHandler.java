
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
        return Mono.zip(
            settingConfigGetter.getSummaryConfig(),
            settingConfigGetter.getAssistantConfig()
        ).map(tuple -> {
            SettingConfigGetter.SummaryConfig summaryConfig = tuple.getT1();
            SettingConfigGetter.AssistantConfig assistantConfig = tuple.getT2();
            
            // 检查摘要功能和助手功能是否启用
            boolean isSummaryEnabled = summaryConfig.getEnable() != null && summaryConfig.getEnable();
            boolean isAssistantEnabled = assistantConfig.getEnableAssistant() != null && assistantConfig.getEnableAssistant();
            
            if (!isSummaryEnabled && !isAssistantEnabled) {
                return contentContext;
            }
            
            injectSummaryDOM(contentContext, isSummaryEnabled, isAssistantEnabled);
            return contentContext;
        }).onErrorResume(e -> Mono.just(contentContext));
    }

    private void injectSummaryDOM(PostContentContext contentContext, 
                                boolean isSummaryEnabled, boolean isAssistantEnabled) {
        Properties properties = new Properties();
        Post post = contentContext.getPost();
        properties.setProperty("kind", Post.GVK.kind());
        properties.setProperty("group", Post.GVK.group());
        properties.setProperty("name", post.getMetadata().getName());
        
        StringBuilder domBuilder = new StringBuilder();
        
        // 根据启用的功能选择性注入 DOM 元素
        if (isSummaryEnabled) {
            // 摘要功能相关 DOM
            String summaryDOM = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
                "<ai-summaraidGPT kind=\"${kind}\" group=\"${group}\" name=\"${name}\"></ai-summaraidGPT>\n",
                properties
            );
            domBuilder.append(summaryDOM);
        }
        
        if (isAssistantEnabled) {
            // 助手功能相关 DOM
            domBuilder.append("<ai-dialog></ai-dialog>\n");
        }
        
        if (domBuilder.length() > 0) {
            contentContext.setContent(domBuilder.toString() + contentContext.getContent());
        }
    }
}

