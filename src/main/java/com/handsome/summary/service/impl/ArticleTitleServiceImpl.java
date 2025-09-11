package com.handsome.summary.service.impl;

import com.handsome.summary.service.ArticleTitleService;
import com.handsome.summary.service.AiConfigService;
import com.handsome.summary.service.AiService;
import com.handsome.summary.service.AiServiceUtils;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
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
    
    private final AiConfigService aiConfigService;
    
    @Override
    public Mono<TitleResponse> generateTitle(TitleRequest request) {
        log.info("开始生成标题，内容长度: {}, 风格: {}, 数量: {}", 
            request.content() != null ? request.content().length() : 0, 
            request.style(), 
            request.count());
        
        return aiConfigService.getAiConfigForFunction("title")
            .flatMap(aiConfig -> aiConfigService.getAiServiceForFunction("title")
                .flatMap(aiService -> generateWithAi(request, aiService, aiConfig)))
            .onErrorResume(this::handleGenerateError);
    }
    
    private Mono<TitleResponse> generateWithAi(TitleRequest request, AiService aiService, 
                                               SettingConfigGetter.AiConfigResult aiConfig) {
        String prompt = buildTitlePrompt(request, aiConfig.getSystemPrompt());
        
        return Mono.fromCallable(() -> {
            SettingConfigGetter.BasicConfig basicConfig = createBasicConfig(aiConfig);
            return aiService.chatCompletionRaw(prompt, basicConfig);
        })
            .<TitleResponse>handle((response, sink) -> {
                String content = AiServiceUtils.extractContentFromResponse(response);
                if (AiServiceUtils.isErrorMessage(content)) {
                    sink.error(new RuntimeException("AI标题生成失败: " + content));
                    return;
                }
                sink.next(TitleResponse.success(content));
            })
        .doOnSuccess(response -> log.info("标题生成成功，内容长度: {}", response.content().length()))
        .doOnError(error -> log.error("标题生成失败", error));
    }
    
    /**
     * 构建标题生成提示词
     */
    private String buildTitlePrompt(TitleRequest request, String systemPrompt) {
        StringBuilder prompt = new StringBuilder();
        
        if (StringUtils.hasText(systemPrompt)) {
            prompt.append(systemPrompt).append("\n\n");
        }
        
        int count = request.count() != null ? request.count() : 5;
        prompt.append("请根据以下文章内容生成").append(count).append("个标题：\n\n");
        prompt.append("文章内容：\n").append(request.content()).append("\n\n");
        
        if (StringUtils.hasText(request.style())) {
            prompt.append("写作风格：").append(getStyleDescription(request.style())).append("\n\n");
        }
        
        prompt.append("请按以下格式输出标题，每个标题占一行：\n");
        for (int i = 1; i <= count; i++) {
            prompt.append(i).append(". 标题").append(i).append("\n");
        }
        prompt.append("\n注意：标题要简洁有力，能够吸引读者注意，准确反映文章内容。");
        
        return prompt.toString();
    }
    
    private String getStyleDescription(String style) {
        return switch (style) {
            case "有利于SEO的标题" -> "优化搜索引擎排名，包含关键词，吸引点击";
            case "吸引眼球的标题" -> "使用数字、疑问句、对比等技巧，增加点击率";
            case "简洁明了" -> "直接表达核心内容，简洁有力";
            case "文艺范" -> "富有诗意和文学性，语言优美";
            case "专业术语" -> "使用专业词汇，体现权威性";
            case "疑问式" -> "以疑问句形式，引发读者思考";
            case "数字式" -> "包含具体数字，增加可信度";
            case "对比式" -> "通过对比突出文章价值";
            case "故事式" -> "具有故事性，引人入胜";
            case "热点式" -> "结合当前热点话题";
            default -> style;
        };
    }
    
    private SettingConfigGetter.BasicConfig createBasicConfig(SettingConfigGetter.AiConfigResult aiConfig) {
        SettingConfigGetter.BasicConfig basicConfig = new SettingConfigGetter.BasicConfig();
        basicConfig.setGlobalAiType(aiConfig.getAiType());
        
        SettingConfigGetter.AiModelConfig modelConfig = new SettingConfigGetter.AiModelConfig();
        
        switch (aiConfig.getAiType()) {
            case "openAi" -> {
                SettingConfigGetter.OpenAiConfig openAiConfig = new SettingConfigGetter.OpenAiConfig();
                openAiConfig.setApiKey(aiConfig.getApiKey());
                openAiConfig.setModelName(aiConfig.getModelName());
                openAiConfig.setBaseUrl(aiConfig.getBaseUrl());
                modelConfig.setOpenAiConfig(openAiConfig);
            }
            case "zhipuAi" -> {
                SettingConfigGetter.ZhipuAiConfig zhipuAiConfig = new SettingConfigGetter.ZhipuAiConfig();
                zhipuAiConfig.setApiKey(aiConfig.getApiKey());
                zhipuAiConfig.setModelName(aiConfig.getModelName());
                modelConfig.setZhipuAiConfig(zhipuAiConfig);
            }
            case "dashScope" -> {
                SettingConfigGetter.DashScopeConfig dashScopeConfig = new SettingConfigGetter.DashScopeConfig();
                dashScopeConfig.setApiKey(aiConfig.getApiKey());
                dashScopeConfig.setModelName(aiConfig.getModelName());
                modelConfig.setDashScopeConfig(dashScopeConfig);
            }
            case "codesphere" -> {
                SettingConfigGetter.CodesphereConfig codesphereConfig = new SettingConfigGetter.CodesphereConfig();
                codesphereConfig.setApiKey(aiConfig.getApiKey());
                codesphereConfig.setModelName(aiConfig.getModelName());
                modelConfig.setCodesphereConfig(codesphereConfig);
            }
            case "siliconFlow" -> {
                SettingConfigGetter.SiliconFlowConfig siliconFlowConfig = new SettingConfigGetter.SiliconFlowConfig();
                siliconFlowConfig.setApiKey(aiConfig.getApiKey());
                siliconFlowConfig.setModelName(aiConfig.getModelName());
                siliconFlowConfig.setBaseUrl(aiConfig.getBaseUrl());
                modelConfig.setSiliconFlowConfig(siliconFlowConfig);
            }
        }
        
        basicConfig.setAiModelConfig(modelConfig);
        return basicConfig;
    }
    
    private Mono<TitleResponse> handleGenerateError(Throwable error) {
        log.error("标题生成服务异常", error);
        return Mono.just(TitleResponse.error("生成失败: " + error.getMessage()));
    }
}
