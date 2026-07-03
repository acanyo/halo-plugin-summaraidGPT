package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.agent.model.AgentAccessMode;
import com.handsome.summary.agent.model.AgentSettings;
import com.handsome.summary.pet.extension.PetCompanion;
import com.handsome.summary.pet.service.PetCompanionService;
import com.handsome.summary.pet.support.DefaultPetCompanionAssets;
import com.handsome.summary.pet.support.PetdexProxyUrlResolver;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.AiRequestSecurityService;
import com.handsome.summary.service.SettingConfigGetter;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

/**
 * 多轮对话API端点
 * @author handsome
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ConversationEndpoint implements CustomEndpoint {

    private static final String AI_FOUNDATION_SERVICE = "aiFoundation";
    private static final String DEFAULT_ASSISTANT_NAME = "智阅助手";
    private static final String DEFAULT_DISPLAY_MODE = "ragAgent";
    private static final String LEGACY_ASSISTANT_DISPLAY_MODE = "assistant";
    private static final String RAG_AGENT_DISPLAY_MODE = "ragAgent";
    private static final String RAG_DISPLAY_MODE = "rag";
    private static final String AGENT_DISPLAY_MODE = "agent";
    private static final String PET_ONLY_DISPLAY_MODE = "petOnly";
    private static final String DEFAULT_BUTTON_POSITION = "right";
    private static final String DEFAULT_STYLE_PRESET = "default";
    private static final String DEFAULT_PRIMARY_COLOR = "#a16207";
    private static final String DEFAULT_SECONDARY_COLOR = "#f4f4f5";
    private static final String DEFAULT_SURFACE_COLOR = "#fafafa";
    private static final String DEFAULT_TEXT_COLOR = "#18181b";
    private static final String DEFAULT_BORDER_RADIUS = "soft";
    private static final String DEFAULT_COLOR_MODE = "light";
    private static final int DEFAULT_FLOATING_OFFSET = 24;
    private static final int MAX_FLOATING_OFFSET = 800;
    private static final int MIN_PET_SIZE = 48;
    private static final int MAX_PET_SIZE = 160;
    private static final int MAX_WELCOME_MESSAGE_CHARS = 260;
    private static final int MAX_QUICK_QUESTION_CHARS = 80;

    private final AiFoundationAiService aiFoundationAiService;
    private final AiRequestSecurityService aiRequestSecurityService;
    private final SettingConfigGetter settingConfigGetter;
    private final PetCompanionService petCompanionService;
    private final PetdexProxyUrlResolver petdexProxyUrlResolver;

    public record ConversationRequest(String conversationHistory) {}
    
    public record DialogConfig(
        String assistantAvatar,
        String assistantName,
        String displayMode,
        Boolean ragEnabled,
        String welcomeMessage,
        List<String> quickQuestions,
        AssistantStyleConfig styleConfig,
        String buttonPosition,
        Integer horizontalOffset,
        Integer verticalOffset,
        Integer petSize,
        List<String> petSpeechMessages,
        PetConfig pet,
        AccessConfig access,
        AgentSettings agent
    ) {}

    public record AccessConfig(
        String mode,
        Boolean allowAnonymous,
        Boolean agentAllowed,
        Boolean authenticated
    ) {}

    public record PetConfig(
        Boolean enabled,
        String displayName,
        String petJsonUrl,
        String spritesheetUrl
    ) {}

    public record AssistantStyleConfig(
        String stylePreset,
        String primaryColor,
        String secondaryColor,
        String surfaceColor,
        String textColor,
        String borderRadius,
        String colorMode
    ) {}
    
    public record SummaryConfig(
        String logo,
        String summaryTitle,
        String gptName,
        Integer typeSpeed,
        String darkSelector,
        String uiStyle,
        String fixedTone,
        String fixedDensity,
        String themeName,
        String theme,
        Boolean typewriter
    ) {}

    public record ApiResponse(boolean success, String message, String response, String aiService, Long timestamp) {
        public static ApiResponse success(String message, String response, String aiService) {
            return new ApiResponse(true, message, response, aiService, System.currentTimeMillis());
        }

        public static ApiResponse error(String message) {
            return new ApiResponse(false, message, "", "", System.currentTimeMillis());
        }

        public static ApiResponse error(String message, String response, String aiService) {
            return new ApiResponse(false, message, response, aiService, System.currentTimeMillis());
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/Conversation";

        return SpringdocRouteBuilder.route()
            .POST("conversation", this::multiTurnConversation,
                builder -> builder.operationId("MultiTurnConversation")
                    .tag(tag)
                    .description("进行多轮对话，支持与AI进行连续对话")
                    .response(responseBuilder().implementation(ApiResponse.class))
            )
            .POST("conversationStream", this::multiTurnConversationStream,
                builder -> builder.operationId("MultiTurnConversationStream")
                    .tag(tag)
                    .description("进行流式多轮对话，实时返回AI响应")
                    .response(responseBuilder().implementation(String.class))
            )
            .GET("dialogConfig", this::getDialogConfig,
                builder -> builder.operationId("GetDialogConfig")
                    .tag(tag)
                    .description("获取对话框配置信息")
                    .response(responseBuilder().implementation(DialogConfig.class))
            )
            .GET("summaryConfig", this::getSummaryConfig,
                builder -> builder.operationId("GetSummaryConfig")
                    .tag(tag)
                    .description("获取摘要框配置信息")
                    .response(responseBuilder().implementation(SummaryConfig.class))
            )
            .build();
    }

    /**
     * 多轮对话接口
     */
    private Mono<ServerResponse> multiTurnConversation(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(ConversationRequest.class))
            .onErrorResume(e -> {
                if (e instanceof ResponseStatusException) {
                    return Mono.error(e);
                }
                // 如果解析ConversationRequest失败，尝试作为纯字符串处理
                log.debug("尝试解析为ConversationRequest失败，转为字符串处理: {}", e.getMessage());
                return request.bodyToMono(String.class)
                    .map(ConversationRequest::new);
            })
            .flatMap(this::processConversation)
            .flatMap(response -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response))
            .onErrorResume(e -> {
                if (e instanceof ResponseStatusException) {
                    return Mono.error(e);
                }
                log.error("多轮对话处理失败，错误: {}", e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(ApiResponse.error("多轮对话处理失败：" + e.getMessage()));
            });
    }

    /**
     * 处理多轮对话请求
     */
    private Mono<ApiResponse> processConversation(ConversationRequest request) {
        log.info("收到多轮对话请求，对话历史长度={}", 
                request.conversationHistory() != null ? request.conversationHistory().length() : 0);

        return settingConfigGetter.getAiConfigForFunction("conversation")
            .flatMap(aiConfig -> {
                // 验证对话历史
                if (request.conversationHistory() == null
                    || request.conversationHistory().trim().isEmpty()) {
                    return Mono.just(ApiResponse.error("对话历史不能为空"));
                }

                log.debug("使用AI服务: {}", AI_FOUNDATION_SERVICE);

                // 调用AI服务进行多轮对话
                String systemPrompt = aiConfig.getSystemPrompt();
                return aiFoundationAiService.chat(request.conversationHistory(), systemPrompt,
                        aiConfig)
                    .map(aiResponse -> {
                        log.info("多轮对话成功完成: AI服务={}", AI_FOUNDATION_SERVICE);
                        return ApiResponse.success("多轮对话成功", aiResponse,
                            AI_FOUNDATION_SERVICE);
                    })
                    .onErrorResume(e -> {
                        log.error("多轮对话处理异常", e);
                        return Mono.just(ApiResponse.error("多轮对话处理异常: " + e.getMessage()));
                    });
            });
    }

    /**
     * 流式多轮对话接口
     */
    private Mono<ServerResponse> multiTurnConversationStream(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(ConversationRequest.class))
            .onErrorResume(e -> {
                if (e instanceof ResponseStatusException) {
                    return Mono.error(e);
                }
                // 如果解析ConversationRequest失败，尝试作为纯字符串处理
                log.debug("尝试解析为ConversationRequest失败，转为字符串处理: {}", e.getMessage());
                return request.bodyToMono(String.class)
                    .map(ConversationRequest::new);
            })
            .flatMap(this::processStreamConversation)
            .onErrorResume(e -> {
                if (e instanceof ResponseStatusException) {
                    return Mono.error(e);
                }
                log.error("流式多轮对话处理失败，错误: {}", e.getMessage(), e);
                return ServerResponse.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .bodyValue("ERROR: 流式多轮对话处理失败：" + e.getMessage());
            });
    }

    /**
     * 处理流式多轮对话请求
     */
    private Mono<ServerResponse> processStreamConversation(ConversationRequest request) {
        log.info("收到流式多轮对话请求，对话历史长度={}", 
                request.conversationHistory() != null ? request.conversationHistory().length() : 0);

        return settingConfigGetter.getAiConfigForFunction("conversation")
        .flatMap(aiConfig -> {
            try {
                // 验证对话历史
                if (request.conversationHistory() == null || request.conversationHistory().trim().isEmpty()) {
                    return ServerResponse.ok()
                        .contentType(MediaType.TEXT_PLAIN)
                        .bodyValue("ERROR: 对话历史不能为空");
                }

                log.debug("使用AI服务进行流式对话: {}", AI_FOUNDATION_SERVICE);

                // 创建流式数据发射器
                Sinks.Many<String> sink = Sinks.many().unicast().onBackpressureBuffer();
                Flux<String> dataFlux = sink.asFlux();

                // 异步调用AI服务进行流式多轮对话
                String systemPrompt = aiConfig.getSystemPrompt();
                log.info(systemPrompt);
                
                // 在新线程中执行AI调用，避免阻塞响应式流
                Thread.ofVirtual().start(() -> {
                    try {
                        aiFoundationAiService.streamChat(
                            request.conversationHistory(), 
                            systemPrompt, 
                            aiConfig,
                            // onData: 每收到数据块时发送到流中
                            sink::tryEmitNext,
                            // onComplete: 完成时关闭流
                            sink::tryEmitComplete,
                            // onError: 错误时发送错误到流中
                            error -> {
                                sink.tryEmitNext("ERROR: " + error);
                                        sink.tryEmitComplete();
                                    }
                                );
                            } catch (Exception e) {
                                log.error("流式对话执行异常", e);
                                sink.tryEmitNext("ERROR: 流式对话执行异常：" + e.getMessage());
                                sink.tryEmitComplete();
                            }
                        });

                        log.info("流式多轮对话开始: AI服务={}", AI_FOUNDATION_SERVICE);
                        
                        // 返回流式响应
                        return ServerResponse.ok()
                            .contentType(MediaType.TEXT_PLAIN)
                            .header("Cache-Control", "no-cache")
                            .header("Connection", "keep-alive")
                            .body(dataFlux, String.class);

                    } catch (Exception e) {
                        log.error("流式多轮对话处理异常", e);
                        return ServerResponse.ok()
                            .contentType(MediaType.TEXT_PLAIN)
                            .bodyValue("ERROR: 流式多轮对话处理异常: " + e.getMessage());
                    }
                });
    }

    /**
     * 获取对话框配置信息
     */
    private Mono<ServerResponse> getDialogConfig(ServerRequest request) {
        return Mono.zip(
                settingConfigGetter.getAssistantConfig(),
                settingConfigGetter.getAgentSettings(),
                settingConfigGetter.getAiSecurityConfig(),
                settingConfigGetter.getRagConfig(),
                isAuthenticated(request)
            )
            .flatMap(tuple -> petCompanionService.getActive()
                .map(Optional::of)
                .defaultIfEmpty(Optional.empty())
                .map(activePet -> {
                    var assistantConfig = tuple.getT1();
                    var securityConfig = tuple.getT3();
                    var ragConfig = tuple.getT4();
                    var accessMode = aiRequestSecurityService.resolveAccessMode(securityConfig);
                    var assistantName = normalizeAssistantName(assistantConfig.getAssistantName());
                    var displayMode = normalizeDisplayMode(assistantConfig.getDisplayMode());
                    return new DialogConfig(
                        normalizeAvatarUrl(assistantConfig.getAssistantAvatar()),
                        assistantName,
                        displayMode,
                        !Boolean.FALSE.equals(ragConfig.getEnableRag()),
                        normalizeWelcomeMessage(assistantConfig.getWelcomeMessage(),
                            assistantName),
                        normalizeQuickQuestions(assistantConfig.getQuickQuestions()),
                        normalizeStyleConfig(assistantConfig.getStyleConfig()),
                        normalizeButtonPosition(assistantConfig.getButtonPosition()),
                        normalizeFloatingOffset(assistantConfig.getHorizontalOffset()),
                        normalizeFloatingOffset(assistantConfig.getVerticalOffset()),
                        normalizePetSize(assistantConfig.getPetSize()),
                        resolvePetSpeechMessages(assistantConfig, displayMode),
                        activePet.map(pet -> toPetConfig(pet, assistantConfig))
                            .orElseGet(this::defaultPetConfig),
                        toAccessConfig(accessMode, tuple.getT5()),
                        tuple.getT2()
                    );
                }))
            .flatMap(dialogConfig -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(dialogConfig))
            .onErrorResume(e -> {
                log.error("获取对话框配置失败", e);
                // 返回默认配置
                var fallbackAssistantConfig = new SettingConfigGetter.AssistantConfig();
                DialogConfig defaultConfig = new DialogConfig(
                    SettingConfigGetter.AssistantConfig.DEFAULT_ASSISTANT_AVATAR,
                    DEFAULT_ASSISTANT_NAME,
                    DEFAULT_DISPLAY_MODE,
                    true,
                    normalizeWelcomeMessage(fallbackAssistantConfig.getWelcomeMessage(),
                        DEFAULT_ASSISTANT_NAME),
                    normalizeQuickQuestions(fallbackAssistantConfig.getQuickQuestions()),
                    defaultStyleConfig(),
                    DEFAULT_BUTTON_POSITION,
                    DEFAULT_FLOATING_OFFSET,
                    DEFAULT_FLOATING_OFFSET,
                    SettingConfigGetter.AssistantConfig.DEFAULT_PET_SIZE,
                    normalizePetSpeechMessages(fallbackAssistantConfig.getPetSpeechMessages(),
                        fallbackAssistantConfig.getPetSpeechMessages()),
                    defaultPetConfig(),
                    toAccessConfig(AgentAccessMode.ANONYMOUS_CHAT_AGENT, false),
                    AgentSettings.defaults()
                );
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(defaultConfig);
            });
    }

    private Mono<Boolean> isAuthenticated(ServerRequest request) {
        return request.principal()
            .map(Principal::getName)
            .map(name -> StringUtils.hasText(name) && !"anonymousUser".equals(name))
            .defaultIfEmpty(false);
    }

    private PetConfig toPetConfig(PetCompanion pet, SettingConfigGetter.AssistantConfig assistantConfig) {
        var spec = pet.getSpec();
        if (spec == null) {
            return null;
        }
        return new PetConfig(
            spec.getEnabled(),
            normalizeAssistantName(spec.getDisplayName()),
            petdexProxyUrlResolver.publicUrl(spec.getPetJsonUrl(), assistantConfig),
            petdexProxyUrlResolver.publicUrl(spec.getSpritesheetUrl(), assistantConfig)
        );
    }

    private PetConfig defaultPetConfig() {
        return new PetConfig(
            true,
            DefaultPetCompanionAssets.DISPLAY_NAME,
            DefaultPetCompanionAssets.PET_JSON_URL,
            DefaultPetCompanionAssets.SPRITESHEET_URL
        );
    }

    private List<String> resolvePetSpeechMessages(
        SettingConfigGetter.AssistantConfig assistantConfig,
        String displayMode
    ) {
        var defaults = new SettingConfigGetter.AssistantConfig();
        return PET_ONLY_DISPLAY_MODE.equals(displayMode)
            ? normalizePetSpeechMessages(assistantConfig.getPetOnlySpeechMessages(),
                defaults.getPetOnlySpeechMessages())
            : normalizePetSpeechMessages(assistantConfig.getPetSpeechMessages(),
                defaults.getPetSpeechMessages());
    }

    private List<String> normalizePetSpeechMessages(List<String> messages, List<String> fallback) {
        var normalized = messages == null ? List.<String>of() : messages.stream()
            .filter(StringUtils::hasText)
            .map(String::strip)
            .distinct()
            .limit(12)
            .toList();
        if (!normalized.isEmpty()) {
            return normalized;
        }
        return fallback;
    }

    private String normalizeWelcomeMessage(String welcomeMessage, String assistantName) {
        var fallback = new SettingConfigGetter.AssistantConfig().getWelcomeMessage();
        var value = StringUtils.hasText(welcomeMessage) ? welcomeMessage.strip() : fallback.strip();
        return limitText(value, MAX_WELCOME_MESSAGE_CHARS)
            .replace("{assistantName}", normalizeAssistantName(assistantName));
    }

    private List<String> normalizeQuickQuestions(List<String> questions) {
        var normalized = questions == null ? List.<String>of() : questions.stream()
            .filter(StringUtils::hasText)
            .map(String::strip)
            .map(question -> limitText(question, MAX_QUICK_QUESTION_CHARS))
            .distinct()
            .limit(8)
            .toList();
        if (!normalized.isEmpty()) {
            return normalized;
        }
        return new SettingConfigGetter.AssistantConfig().getQuickQuestions();
    }

    private String limitText(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private Integer normalizePetSize(Integer petSize) {
        if (petSize == null) {
            return SettingConfigGetter.AssistantConfig.DEFAULT_PET_SIZE;
        }
        return Math.min(Math.max(petSize, MIN_PET_SIZE), MAX_PET_SIZE);
    }

    private String normalizeAssistantName(String assistantName) {
        return StringUtils.hasText(assistantName) ? assistantName.strip() : DEFAULT_ASSISTANT_NAME;
    }

    private String normalizeDisplayMode(String displayMode) {
        if (!StringUtils.hasText(displayMode)) {
            return DEFAULT_DISPLAY_MODE;
        }
        return switch (displayMode.strip()) {
            case LEGACY_ASSISTANT_DISPLAY_MODE, RAG_AGENT_DISPLAY_MODE -> RAG_AGENT_DISPLAY_MODE;
            case RAG_DISPLAY_MODE -> RAG_DISPLAY_MODE;
            case AGENT_DISPLAY_MODE -> AGENT_DISPLAY_MODE;
            case PET_ONLY_DISPLAY_MODE -> PET_ONLY_DISPLAY_MODE;
            default -> DEFAULT_DISPLAY_MODE;
        };
    }

    private AccessConfig toAccessConfig(AgentAccessMode accessMode, boolean authenticated) {
        return new AccessConfig(
            accessMode.value(),
            accessMode.anonymousChatAllowed(),
            accessMode.agentAllowed(),
            authenticated
        );
    }

    private String normalizeAvatarUrl(String avatarUrl) {
        if (!StringUtils.hasText(avatarUrl)) {
            return SettingConfigGetter.AssistantConfig.DEFAULT_ASSISTANT_AVATAR;
        }
        var value = avatarUrl.strip();
        return value.regionMatches(true, 0, "javascript:", 0, "javascript:".length())
            ? null
            : value;
    }

    private AssistantStyleConfig normalizeStyleConfig(
        SettingConfigGetter.AssistantStyleConfig styleConfig) {
        if (styleConfig == null) {
            return defaultStyleConfig();
        }
        var stylePreset = normalizeStylePreset(styleConfig.getStylePreset());
        var palette = paletteFor(stylePreset);
        var custom = "custom".equals(stylePreset);
        return new AssistantStyleConfig(
            stylePreset,
            normalizeColor(custom ? styleConfig.getPrimaryColor() : palette.primaryColor(),
                DEFAULT_PRIMARY_COLOR),
            normalizeColor(custom ? styleConfig.getSecondaryColor() : palette.secondaryColor(),
                DEFAULT_SECONDARY_COLOR),
            normalizeColor(custom ? styleConfig.getSurfaceColor() : palette.surfaceColor(),
                DEFAULT_SURFACE_COLOR),
            normalizeColor(custom ? styleConfig.getTextColor() : palette.textColor(),
                DEFAULT_TEXT_COLOR),
            normalizeBorderRadius(styleConfig.getBorderRadius()),
            normalizeColorMode(styleConfig.getColorMode())
        );
    }

    private AssistantStyleConfig defaultStyleConfig() {
        return new AssistantStyleConfig(
            DEFAULT_STYLE_PRESET,
            DEFAULT_PRIMARY_COLOR,
            DEFAULT_SECONDARY_COLOR,
            DEFAULT_SURFACE_COLOR,
            DEFAULT_TEXT_COLOR,
            DEFAULT_BORDER_RADIUS,
            DEFAULT_COLOR_MODE
        );
    }

    private String normalizeStylePreset(String stylePreset) {
        if (!StringUtils.hasText(stylePreset)) {
            return DEFAULT_STYLE_PRESET;
        }
        return switch (stylePreset.strip()) {
            case "graphite", "ocean", "azure", "forest", "rose", "custom" -> stylePreset.strip();
            default -> DEFAULT_STYLE_PRESET;
        };
    }

    private AssistantStylePalette paletteFor(String stylePreset) {
        return switch (stylePreset) {
            case "graphite" -> new AssistantStylePalette("#d6b46c", "#2a2a28", "#171717",
                "#f7f2e8");
            case "ocean" -> new AssistantStylePalette("#1f7a8c", "#d9f0f3", "#fbfeff",
                "#142326");
            case "azure" -> new AssistantStylePalette("#3b82f6", "#dbeafe", "#f8fafc",
                "#0f172a");
            case "forest" -> new AssistantStylePalette("#2f7d50", "#dceedd", "#fbfdf8",
                "#18251b");
            case "rose" -> new AssistantStylePalette("#b85c7a", "#f8dfe8", "#fffafc",
                "#2b1720");
            default -> new AssistantStylePalette(DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR,
                DEFAULT_SURFACE_COLOR, DEFAULT_TEXT_COLOR);
        };
    }

    private record AssistantStylePalette(
        String primaryColor,
        String secondaryColor,
        String surfaceColor,
        String textColor
    ) {}

    private String normalizeColor(String color, String fallback) {
        if (!StringUtils.hasText(color)) {
            return fallback;
        }
        var value = color.strip();
        return value.matches("^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$") ? value : fallback;
    }

    private String normalizeBorderRadius(String borderRadius) {
        if (!StringUtils.hasText(borderRadius)) {
            return DEFAULT_BORDER_RADIUS;
        }
        return switch (borderRadius.strip()) {
            case "standard", "round" -> borderRadius.strip();
            default -> DEFAULT_BORDER_RADIUS;
        };
    }

    private String normalizeColorMode(String colorMode) {
        if (!StringUtils.hasText(colorMode)) {
            return DEFAULT_COLOR_MODE;
        }
        return switch (colorMode.strip()) {
            case "auto", "light", "dark" -> colorMode.strip();
            default -> DEFAULT_COLOR_MODE;
        };
    }

    private String normalizeButtonPosition(String buttonPosition) {
        return StringUtils.hasText(buttonPosition) && "left".equals(buttonPosition.strip())
            ? "left" : DEFAULT_BUTTON_POSITION;
    }

    private Integer normalizeFloatingOffset(Integer offset) {
        if (offset == null) {
            return DEFAULT_FLOATING_OFFSET;
        }
        return Math.min(Math.max(offset, 0), MAX_FLOATING_OFFSET);
    }

    /**
     * 获取摘要框配置信息
     */
    private Mono<ServerResponse> getSummaryConfig(ServerRequest request) {
        return Mono.zip(
            settingConfigGetter.getSummaryConfig(),
            settingConfigGetter.getStyleConfig()
        ).map(tuple -> {
            var summaryConfig = tuple.getT1();
            var styleConfig = tuple.getT2();
            
            return new SummaryConfig(
                styleConfig.getLogo() != null ? styleConfig.getLogo() : "icon.svg",
                summaryConfig.getSummaryTitle() != null ? summaryConfig.getSummaryTitle() : "文章摘要",
                summaryConfig.getGptName() != null ? summaryConfig.getGptName() : "智阅GPT",
                summaryConfig.getTypeSpeed() != null ? summaryConfig.getTypeSpeed() : 20,
                summaryConfig.getDarkSelector() != null ? summaryConfig.getDarkSelector() : "",
                resolveUiStyle(styleConfig),
                resolveFixedTone(styleConfig),
                resolveFixedDensity(styleConfig),
                resolveThemeName(styleConfig),
                buildThemeString(styleConfig),
                summaryConfig.getTypewriter() != null ? summaryConfig.getTypewriter() : true
            );
        })
        .flatMap(summaryConfig -> ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(summaryConfig))
        .onErrorResume(e -> {
            log.error("获取摘要框配置失败", e);
            // 返回默认配置
            SummaryConfig defaultConfig = new SummaryConfig(
                "icon.svg",
                "文章摘要",
                "智阅GPT",
                20,
                "",
                "simple",
                "violet",
                "compact",
                "custom",
                "{\"bg\":\"#f7f9fe\",\"main\":\"#4F8DFD\",\"contentFontSize\":\"16px\",\"title\":\"#3A5A8C\",\"content\":\"#222\",\"gptName\":\"#7B88A8\",\"contentBg\":\"#fff\",\"border\":\"#e3e8f7\",\"shadow\":\"0 2px 12px 0 rgba(60,80,180,0.08)\",\"tagBg\":\"#f0f4ff\",\"tagColor\":\"#4F8DFD\",\"cursor\":\"#4F8DFD\"}",
                true
            );
            return ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(defaultConfig);
        });
    }
    
    /**
     * 构建主题字符串
     */
    private String buildThemeString(SettingConfigGetter.StyleConfig styleConfig) {
        return String.format("{\"bg\":\"%s\",\"main\":\"%s\",\"contentFontSize\":\"%s\",\"title\":\"%s\",\"content\":\"%s\",\"gptName\":\"%s\",\"contentBg\":\"%s\",\"border\":\"%s\",\"shadow\":\"%s\",\"tagBg\":\"%s\",\"tagColor\":\"%s\",\"cursor\":\"%s\"}",
            styleConfig.getThemeBg() != null ? styleConfig.getThemeBg() : "#f7f9fe",
            styleConfig.getThemeMain() != null ? styleConfig.getThemeMain() : "#4F8DFD",
            styleConfig.getThemeContentFontSize() != null ? styleConfig.getThemeContentFontSize() : "16px",
            styleConfig.getThemeTitle() != null ? styleConfig.getThemeTitle() : "#3A5A8C",
            styleConfig.getThemeContent() != null ? styleConfig.getThemeContent() : "#222",
            styleConfig.getThemeGptName() != null ? styleConfig.getThemeGptName() : "#7B88A8",
            styleConfig.getThemeContentBg() != null ? styleConfig.getThemeContentBg() : "#fff",
            styleConfig.getThemeBorder() != null ? styleConfig.getThemeBorder() : "#e3e8f7",
            styleConfig.getThemeShadow() != null ? styleConfig.getThemeShadow() : "0 2px 12px 0 rgba(60,80,180,0.08)",
            styleConfig.getThemeTagBg() != null ? styleConfig.getThemeTagBg() : "#f0f4ff",
            styleConfig.getThemeTagColor() != null ? styleConfig.getThemeTagColor() : "#4F8DFD",
            styleConfig.getThemeCursor() != null ? styleConfig.getThemeCursor() : "#4F8DFD"
        );
    }

    private String resolveUiStyle(SettingConfigGetter.StyleConfig styleConfig) {
        if (styleConfig.getUiStyle() != null) {
            if ("simple".equals(styleConfig.getUiStyle())) {
                return "simple";
            }
            if ("inline".equals(styleConfig.getUiStyle())) {
                return "inline";
            }
            if ("note".equals(styleConfig.getUiStyle())
                || "minimal".equals(styleConfig.getUiStyle())
                || "stripe".equals(styleConfig.getUiStyle())
                || "quiet".equals(styleConfig.getUiStyle())) {
                return "simple";
            }
            return "classic";
        }
        if ("spotlight".equals(styleConfig.getThemeName())) {
            return "simple";
        }
        return "simple";
    }

    private String resolveFixedTone(SettingConfigGetter.StyleConfig styleConfig) {
        if ("graphite".equals(styleConfig.getFixedTone()) || "copper".equals(styleConfig.getFixedTone())) {
            return styleConfig.getFixedTone();
        }
        return "violet";
    }

    private String resolveFixedDensity(SettingConfigGetter.StyleConfig styleConfig) {
        if ("comfortable".equals(styleConfig.getFixedDensity())) {
            return "comfortable";
        }
        return "compact";
    }

    private String resolveThemeName(SettingConfigGetter.StyleConfig styleConfig) {
        if ("spotlight".equals(styleConfig.getThemeName())) {
            return "default";
        }
        return styleConfig.getThemeName() != null ? styleConfig.getThemeName() : "custom";
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
