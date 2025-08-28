package com.handsome.summary.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;

import com.handsome.summary.service.AiService;
import com.handsome.summary.service.AiServiceFactory;
import com.handsome.summary.service.SettingConfigGetter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
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

    public record ConversationRequest(String aiType, String conversationHistory) {}

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
            .build();
    }

    /**
     * 多轮对话接口
     */
    private Mono<ServerResponse> multiTurnConversation(ServerRequest request) {
        return request.bodyToMono(ConversationRequest.class)
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
        log.info("收到多轮对话请求: AI类型={}, 对话历史长度={}", 
                request.aiType(), 
                request.conversationHistory() != null ? request.conversationHistory().length() : 0);

        return settingConfigGetter.getBasicConfig()
                .map(config -> {
                    try {
                        // 验证AI服务是否启用
                        if (config.getEnableAi() == null || !config.getEnableAi()) {
                            return ApiResponse.error("AI服务未启用");
                        }

                        // 获取AI服务实例
                        String aiType = request.aiType() != null ? request.aiType() : config.getModelType();
                        AiService aiService = aiServiceFactory.getService(aiType);

                        // 验证对话历史
                        if (request.conversationHistory() == null || request.conversationHistory().trim().isEmpty()) {
                            return ApiResponse.error("对话历史不能为空");
                        }

                        // 调用AI服务进行多轮对话
                        String aiResponse = aiService.multiTurnChat(request.conversationHistory(), config);

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

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
