package com.handsome.summary.service.impl;

import com.handsome.summary.service.ChatLanguageService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebInputException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ReactiveExtensionClient;

/**
 * 聊天语言服务实现类
 * 根据配置选择不同的AI模型进行聊天
 *
 * @author handsome
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ChatLanguageServiceImpl implements ChatLanguageService {
    private final SettingConfigGetter settingConfigGetter;
    private final ReactiveExtensionClient client;

    @Override
    public Mono<Void> model(String content, Post post) {
        return settingConfigGetter.getBasicConfig()
            .switchIfEmpty(Mono.error(new RuntimeException("无法获取基本配置")))
            .flatMap(config -> {
                try {
                    if (Optional.ofNullable(config.getEnableAi()).orElse(false)){
                        return Mono.empty();
                    }
                    
                    // 暂时返回空，等待新的AI实现
                    log.info("AI功能已移除，等待新的实现");
                    return Mono.empty();
                    
                } catch (Exception e) {
                    return Mono.error(() -> new ServerWebInputException("处理配置时发生错误"));
                }
            });
    }

    private Mono<Void> updatePostSummary(Post post, String summary) {
        post.getMetadata().getLabels().put("isSummary", "true");
        if (post.getStatus() == null) {
            post.setStatus(new Post.PostStatus());
        }
        post.getStatus().setExcerpt(summary);
        return client.update(post)
            .doOnSuccess(p -> log.info("文章[{}]摘要更新成功", p.getMetadata().getName()))
            .then();
    }
}
