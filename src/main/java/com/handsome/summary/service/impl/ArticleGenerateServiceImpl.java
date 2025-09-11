package com.handsome.summary.service.impl;

import com.handsome.summary.service.ArticleGenerateService;
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
 * 文章生成服务实现类
 * <p>
 * 基于AI服务实现文章生成功能，支持多种生成类型和写作风格
 * </p>
 * 
 * @author handsome
 * @since 3.1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleGenerateServiceImpl implements ArticleGenerateService {
    
    private final AiConfigService aiConfigService;
    
    @Override
    public Mono<GenerateResponse> generateArticle(GenerateRequest request) {
        log.info("开始生成文章，主题: {}, 类型: {}, 风格: {}", 
            request.topic(), request.type(), request.style());
        
        return aiConfigService.getAiConfigForFunction("generate")
            .flatMap(aiConfig -> aiConfigService.getAiServiceForFunction("generate")
                .flatMap(aiService -> generateWithAi(request, aiService, aiConfig)))
            .onErrorResume(this::handleGenerateError);
    }
    
    
    
    /**
     * 使用AI生成文章内容
     */
    private Mono<GenerateResponse> generateWithAi(GenerateRequest request, AiService aiService, 
                                                 SettingConfigGetter.AiConfigResult aiConfig) {
        String prompt = buildGeneratePrompt(request, aiConfig.getSystemPrompt());
        
        return Mono.fromCallable(() -> {
            SettingConfigGetter.BasicConfig basicConfig = createBasicConfig(aiConfig);
            return aiService.chatCompletionRaw(prompt, basicConfig);
        })
            .<GenerateResponse>handle((response, sink) -> {
                String content = AiServiceUtils.extractContentFromResponse(response);
                if (AiServiceUtils.isErrorMessage(content)) {
                    sink.error(new RuntimeException("AI生成失败: " + content));
                    return;
                }
                sink.next(GenerateResponse.success(content, request.type()));
            })
        .doOnSuccess(response -> log.info("文章生成成功，长度: {}", response.length()))
        .doOnError(error -> log.error("文章生成失败", error));
    }
    
    
    /**
     * 构建文章生成提示词
     */
    private String buildGeneratePrompt(GenerateRequest request, String systemPrompt) {
        StringBuilder prompt = new StringBuilder();
        
        if (StringUtils.hasText(systemPrompt)) {
            prompt.append(systemPrompt).append("\n\n");
        }
        
        prompt.append("请根据以下要求生成文章：\n");
        prompt.append("主题：").append(request.topic()).append("\n");
        
        if (StringUtils.hasText(request.style())) {
            prompt.append("写作风格：").append(getStyleDescription(request.style())).append("\n");
        }
        
        if (StringUtils.hasText(request.type())) {
            prompt.append("生成类型：").append("完整文章").append("\n");
        }
        
        if (request.maxLength() != null && request.maxLength() > 0) {
            prompt.append("文章长度：约").append(request.maxLength()).append("字\n");
        }
        
        // 根据格式要求添加说明
        if ("markdown".equals(request.format())) {
            prompt.append("输出格式：请使用Markdown格式输出\n");
        } else if ("html".equals(request.format())) {
            prompt.append("输出格式：请使用HTML格式输出\n");
        }
        
        prompt.append("\n请直接输出生成的内容，不要包含任何解释或说明。");
        
        return prompt.toString();
    }
    
    
    /**
     * 获取风格描述
     */
    private String getStyleDescription(String style) {
        return switch (style) {
            case "通俗易懂" -> "用简单语言解释复杂概念，适合大众阅读";
            case "正式学术" -> "严谨的学术写作风格，适合论文和研究报告";
            case "新闻资讯" -> "客观、简洁的新闻报道风格，注重事实";
            case "技术文档" -> "详细、准确的技术说明，适合开发者";
            case "创意文学" -> "富有想象力的文学表达，语言优美";
            case "幽默风趣" -> "轻松幽默的表达方式，增加趣味性";
            case "严谨专业" -> "专业、权威的写作风格，适合商务场合";
            case "轻松活泼" -> "轻松愉快的表达方式，亲和力强";
            case "商务正式" -> "正式的商务写作风格，专业且礼貌";
            case "科普教育" -> "通俗易懂的科学解释，适合教学";
            case "个人博客" -> "个人化的写作风格，亲切自然";
            case "产品介绍" -> "突出产品特点，吸引用户关注";
            case "教程指南" -> "步骤清晰，易于跟随操作";
            case "评论分析" -> "深入分析，提供独到见解";
            case "故事叙述" -> "生动有趣的故事化表达";
            case "对话访谈" -> "问答形式，互动性强";
            default -> style; // 如果是自定义风格，直接返回
        };
    }
    
    /**
     * 创建基础配置
     */
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
    
    /**
     * 处理生成错误
     */
    private Mono<GenerateResponse> handleGenerateError(Throwable error) {
        log.error("文章生成服务异常", error);
        return Mono.just(GenerateResponse.error("生成失败: " + error.getMessage()));
    }
}
