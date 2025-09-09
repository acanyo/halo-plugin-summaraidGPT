package com.handsome.summary.service.impl;

import com.handsome.summary.service.ArticleTitleService;
import com.handsome.summary.service.AiService;
import com.handsome.summary.service.AiServiceFactory;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * 文章标题生成服务实现
 * 
 * @author Handsome
 * @since 3.1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleTitleServiceImpl implements ArticleTitleService {
    
    private final AiServiceFactory aiServiceFactory;
    private final SettingConfigGetter settingConfigGetter;
    
    @Override
    public Mono<TitleResponse> generateTitle(TitleRequest request) {
        log.info("开始生成标题，内容长度: {}, 风格: {}, 数量: {}", 
            request.content() != null ? request.content().length() : 0, 
            request.style(), 
            request.count());
        
        try {
            // 获取标题生成专用AI类型
            String titleAiType = settingConfigGetter.getTitleAiType();
            log.info("使用标题生成AI类型: {}", titleAiType);
            
            // 获取AI服务
            AiService aiService = aiServiceFactory.getService(titleAiType);
            if (aiService == null) {
                log.error("无法获取AI服务，类型: {}", titleAiType);
                return Mono.just(TitleResponse.error("AI服务不可用"));
            }
            
            // 获取基本配置
            return settingConfigGetter.getBasicConfig()
                .flatMap(basicConfig -> {
                    // 构建标题生成提示词
                    String prompt = buildTitlePrompt(request);
                    log.info("构建的标题生成提示词: {}", prompt);
                    
                    // 调用AI服务生成标题
                    String response = aiService.chatCompletionRaw(prompt, basicConfig);
                    log.info("AI返回的标题内容: {}", response);
                    return Mono.just(TitleResponse.success(response));
                })
                .onErrorResume(throwable -> {
                    log.error("标题生成失败", throwable);
                    return Mono.just(TitleResponse.error("标题生成失败：" + throwable.getMessage()));
                });
                
        } catch (Exception e) {
            log.error("标题生成处理异常", e);
            return Mono.just(TitleResponse.error("标题生成处理异常：" + e.getMessage()));
        }
    }
    
    /**
     * 构建标题生成提示词
     */
    private String buildTitlePrompt(TitleRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        // 获取标题生成专用系统提示词
        String systemPrompt = settingConfigGetter.getTitleSystemPrompt();
        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            prompt.append(systemPrompt).append("\n\n");
        }
        
        // 添加具体任务描述
        prompt.append("请根据以下文章内容生成").append(request.count() != null ? request.count() : 5).append("个标题：\n\n");
        prompt.append("文章内容：\n").append(request.content()).append("\n\n");
        
        // 添加风格要求
        if (request.style() != null && !request.style().trim().isEmpty()) {
            prompt.append("写作风格：").append(request.style()).append("\n\n");
        }
        
        // 添加输出格式要求
        prompt.append("请按以下格式输出标题，每个标题占一行：\n");
        prompt.append("1. 标题一\n");
        prompt.append("2. 标题二\n");
        prompt.append("3. 标题三\n");
        prompt.append("...\n\n");
        prompt.append("注意：标题要简洁有力，能够吸引读者注意，准确反映文章内容。");
        
        return prompt.toString();
    }
}
