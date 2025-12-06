
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
            
            // 检查摘要功能是否启用
            boolean isSummaryEnabled = summaryConfig.getEnable() != null && summaryConfig.getEnable();
            // 检查是否注入摘要框UI
            boolean isSummaryUiEnabled = summaryConfig.getEnableUiInjection() == null || summaryConfig.getEnableUiInjection();
            
            // 检查助手功能是否启用
            boolean isAssistantEnabled = assistantConfig.getEnableAssistant() != null && assistantConfig.getEnableAssistant();
            
            if (!isSummaryEnabled && !isAssistantEnabled) {
                return contentContext;
            }
            
            injectSummaryDOM(contentContext, isSummaryEnabled, isSummaryUiEnabled, isAssistantEnabled);
            return contentContext;
        }).onErrorResume(e -> Mono.just(contentContext));
    }

    private void injectSummaryDOM(PostContentContext contentContext, 
                                boolean isSummaryEnabled, boolean isSummaryUiEnabled, boolean isAssistantEnabled) {
        Properties properties = new Properties();
        Post post = contentContext.getPost();
        properties.setProperty("kind", Post.GVK.kind());
        properties.setProperty("group", Post.GVK.group());
        properties.setProperty("name", post.getMetadata().getName());
        
        StringBuilder domBuilder = new StringBuilder();
        
        // 摘要功能启用时
        if (isSummaryEnabled) {
            if (isSummaryUiEnabled) {
                String summaryDOM = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
                    "<ai-summaraidGPT kind=\"${kind}\" group=\"${group}\" name=\"${name}\"></ai-summaraidGPT>\n",
                    properties
                );
                domBuilder.append(summaryDOM);
            } else {
                String hiddenDataTag = PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(
                    "<ai-summaraidGPT-data kind=\"${kind}\" group=\"${group}\" name=\"${name}\" style=\"display:none;\"></ai-summaraidGPT-data>\n",
                    properties
                );
                domBuilder.append(hiddenDataTag);
            }
        }
        
        if (isAssistantEnabled) {
            // 助手功能相关 DOM
            domBuilder.append("<ai-dialog></ai-dialog>\n");
        }
        
        if (!domBuilder.isEmpty()) {
            contentContext.setContent(domBuilder.toString() + contentContext.getContent());
        }
    }
}

