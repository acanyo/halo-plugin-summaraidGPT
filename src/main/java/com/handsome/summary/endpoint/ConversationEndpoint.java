package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import com.handsome.summary.service.AiService;
import com.handsome.summary.service.AiServiceFactory;
import com.handsome.summary.service.SettingConfigGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
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

    private final AiServiceFactory aiServiceFactory;
    private final SettingConfigGetter settingConfigGetter;

    public record ConversationRequest(String conversationHistory) {}

    public record ApiResponse(boolean success, String message, String response, String aiType, Long timestamp) {
        public static ApiResponse success(String message, String response, String aiType) {
            return new ApiResponse(true, message, response, aiType, System.currentTimeMillis());
        }

        public static ApiResponse error(String message) {
            return new ApiResponse(false, message, "", "", System.currentTimeMillis());
        }

        public static ApiResponse error(String message, String response, String aiType) {
            return new ApiResponse(false, message, response, aiType, System.currentTimeMillis());
        }
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/Conversation";

        return SpringdocRouteBuilder.route()
            .POST("/conversation", this::multiTurnConversation,
                builder -> builder.operationId("MultiTurnConversation")
                    .tag(tag)
                    .description("进行多轮对话，支持与AI进行连续对话")
                    .response(responseBuilder().implementation(ApiResponse.class))
            )
            .POST("/conversationStream", this::multiTurnConversationStream,
                builder -> builder.operationId("MultiTurnConversationStream")
                    .tag(tag)
                    .description("进行流式多轮对话，实时返回AI响应")
                    .response(responseBuilder().implementation(String.class))
            )
            .build();
    }

    /**
     * 多轮对话接口
     */
    private Mono<ServerResponse> multiTurnConversation(ServerRequest request) {
        return request.bodyToMono(ConversationRequest.class)
            .onErrorResume(e -> {
                // 如果解析ConversationRequest失败，尝试作为纯字符串处理
                log.debug("尝试解析为ConversationRequest失败，转为字符串处理: {}", e.getMessage());
                return request.bodyToMono(String.class)
                    .map(conversationHistory -> new ConversationRequest(conversationHistory));
            })
            .flatMap(this::processConversation)
            .flatMap(response -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response))
            .onErrorResume(e -> {
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

        return settingConfigGetter.getBasicConfig()
                .zipWith(settingConfigGetter.getAssistantConfig())
                .map(tuple -> {
                    var basicConfig = tuple.getT1();
                    var assistantConfig = tuple.getT2();
                    
                    try {
                        // 从配置中获取AI服务类型
                        String aiType = basicConfig.getModelType();
                        if (aiType == null || aiType.trim().isEmpty()) {
                            return ApiResponse.error("AI服务类型未配置");
                        }
                        
                        log.debug("使用AI服务类型: {}", aiType);
                        AiService aiService = aiServiceFactory.getService(aiType);

                        // 验证对话历史
                        if (request.conversationHistory() == null || request.conversationHistory().trim().isEmpty()) {
                            return ApiResponse.error("对话历史不能为空");
                        }

                        // 调用AI服务进行多轮对话，直接传递系统人设
                        String systemPrompt = assistantConfig.getConversationSystemPrompt();
                        String aiResponse = aiService.multiTurnChat(request.conversationHistory(), systemPrompt, basicConfig, null, null, null);

                        // 检查AI响应是否包含错误信息
                        if (aiResponse.startsWith("[") && aiResponse.contains("异常")) {
                            return ApiResponse.error(aiResponse, aiResponse, aiType);
                        }

                        log.info("多轮对话成功完成: AI类型={}", aiType);
                        return ApiResponse.success("多轮对话成功", aiResponse, aiType);

                    } catch (Exception e) {
                        log.error("多轮对话处理异常", e);
                        return ApiResponse.error("多轮对话处理异常: " + e.getMessage());
                    }
                });
    }

    /**
     * 流式多轮对话接口
     */
    private Mono<ServerResponse> multiTurnConversationStream(ServerRequest request) {
        return request.bodyToMono(ConversationRequest.class)
            .onErrorResume(e -> {
                // 如果解析ConversationRequest失败，尝试作为纯字符串处理
                log.debug("尝试解析为ConversationRequest失败，转为字符串处理: {}", e.getMessage());
                return request.bodyToMono(String.class)
                    .map(ConversationRequest::new);
            })
            .flatMap(this::processStreamConversation)
            .onErrorResume(e -> {
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

        return settingConfigGetter.getBasicConfig()
                .zipWith(settingConfigGetter.getAssistantConfig())
                .flatMap(tuple -> {
                    var basicConfig = tuple.getT1();
                    var assistantConfig = tuple.getT2();
                    
                    try {

                        // 从配置中获取AI服务类型
                        String aiType = basicConfig.getModelType();
                        if (aiType == null || aiType.trim().isEmpty()) {
                            return ServerResponse.ok()
                                .contentType(MediaType.TEXT_PLAIN)
                                .bodyValue("ERROR: AI服务类型未配置");
                        }
                        
                        log.debug("使用AI服务类型进行流式对话: {}", aiType);
                        AiService aiService = aiServiceFactory.getService(aiType);

                        // 验证对话历史
                        if (request.conversationHistory() == null || request.conversationHistory().trim().isEmpty()) {
                            return ServerResponse.ok()
                                .contentType(MediaType.TEXT_PLAIN)
                                .bodyValue("ERROR: 对话历史不能为空");
                        }

                        // 创建流式数据发射器
                        Sinks.Many<String> sink = Sinks.many().unicast().onBackpressureBuffer();
                        Flux<String> dataFlux = sink.asFlux();

                        // 异步调用AI服务进行流式多轮对话
                        String systemPrompt = assistantConfig.getConversationSystemPrompt();
                        log.info(systemPrompt);
                        
                        // 在新线程中执行AI调用，避免阻塞响应式流
                        Thread.ofVirtual().start(() -> {
                            try {
                                aiService.multiTurnChat(
                                    request.conversationHistory(), 
                                    systemPrompt, 
                                    basicConfig,
                                    // onData: 每收到数据块时发送到流中
                                    data -> sink.tryEmitNext(data),
                                    // onComplete: 完成时关闭流
                                    () -> sink.tryEmitComplete(),
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

                        log.info("流式多轮对话开始: AI类型={}", aiType);
                        
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

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
