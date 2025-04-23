package com.handsome.summary.service.impl;

import static run.halo.app.extension.index.query.QueryFactory.and;
import static run.halo.app.extension.index.query.QueryFactory.equal;

import cn.hutool.core.lang.UUID;
import cn.hutool.core.util.CharsetUtil;
import cn.hutool.core.util.HexUtil;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.handsome.summary.Constant;
import com.handsome.summary.dto.ChatCompletionResponse;
import com.handsome.summary.dto.TokenData;
import com.handsome.summary.entity.TokenSub;
import com.handsome.summary.service.ChatService;
import com.handsome.summary.util.GlobalCacheUtil;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.Secret;
import run.halo.app.extension.index.query.Query;
import run.halo.app.plugin.ReactiveSettingFetcher;

@Component
@Slf4j
public class ChatServiceImpl implements ChatService {
    private final ReactiveSettingFetcher settingFetcher;
    private final ReactiveExtensionClient client;

    private final WebClient webClient;

    private static final String THEME_SETTING = "basic";

    public ChatServiceImpl(ReactiveSettingFetcher settingFetcher, ReactiveExtensionClient client,
        WebClient webClient) {
        this.settingFetcher = settingFetcher;
        this.client = client;
        this.webClient = webClient;
    }
    private Mono<String> getAuthToken(String keyId, String secret) {
        String cachedToken = GlobalCacheUtil.get(keyId);
        return cachedToken != null ? Mono.just(cachedToken) : getAccessTokenFromDatabase(keyId,secret);
    }

     // 从数据库获取 Token
     private Mono<String> getAccessTokenFromDatabase(String clientId, String secret) {
         Query query = and(
             (equal("spec.clientId", clientId)),
             equal("spec.clientSecret", secret)
           );
         ListOptions queryBuild = ListOptions.builder()
             .fieldQuery(query)
             .build();
         Flux<TokenSub> tokenSubFlux =
             client.listAll(TokenSub.class, queryBuild,null);

         return
             tokenSubFlux
                 .filter(f -> Instant.now().getEpochSecond() < f.getSpec().getExpiresIn() - 5 * 60) // 过滤过期Token
                 .collectList()
                 .flatMap(list -> { // 处理有效Token列表
                     if (list.isEmpty()) {
                         return fetchToken(clientId, secret); // 无有效Token则刷新
                     } else {
                         // 找到有效期最长的Token
                         TokenSub latestToken = list.stream()
                             .max(Comparator.comparingLong(c->c.getSpec().getExpiresIn()))
                             .orElse(null);
                         GlobalCacheUtil.put(clientId, latestToken.getSpec().getAccessToken());
                         return Mono.just(latestToken.getSpec().getAccessToken());
                     }
                 });
     }
    private Mono<String> fetchToken(String clientId, String secret) {
        log.info("开始获取新 Token");
        return getAccessToken(clientId,secret)
            .map(tokenData -> {
                String token =
                    HexUtil.encodeHexStr(tokenData.getAccessToken(), CharsetUtil.CHARSET_UTF_8);
                GlobalCacheUtil.put(clientId, token);
                recordTokenResult(token,clientId,secret);
                return HexUtil.encodeHexStr(tokenData.getAccessToken(), CharsetUtil.CHARSET_UTF_8);
            })
            .doOnSuccess(token -> log.info("Token 获取成功"))
            .doOnError(e -> log.info("Token 获取失败",e));
    }
    // 调用认证接口
    private Mono<TokenData> getAccessToken(String clientId, String secretKey) {
        return webClient.post()
            .uri(Constant.TOKEN_URL +
                "?grant_type=client_credentials" +
                "&client_id=" + clientId +
                "&client_secret=" + secretKey)
            .contentType(MediaType.APPLICATION_JSON)
            .retrieve()
            .onStatus(status -> !status.is2xxSuccessful(), response -> {
                log.info("认证接口返回错误状态码: {}", response.statusCode());
                return response.bodyToMono(String.class)
                    .flatMap(errorBody -> {
                        log.info("认证失败详情: {}", errorBody);
                        return Mono.error(new RuntimeException("认证失败: " + errorBody));
                    });
            })
            .bodyToMono(TokenData.class)
            .flatMap(tokenData -> {
                if (tokenData.getError() != null) {
                    log.info("业务错误: code={}, message={}",
                        tokenData.getError(), tokenData.getErrorDescription());
                    return Mono.error(new RuntimeException(
                        "业务错误: " + tokenData.getError() + " - " + tokenData.getErrorDescription()
                    ));
                }
                return Mono.just(tokenData);
            });
    }
    @Override
    public Mono<String> getSummary(String articleContent) {
        return settingFetcher.get(THEME_SETTING)
            .switchIfEmpty(Mono.error(new RuntimeException("配置不存在")))
            .flatMap(item -> {
                JsonNode clientIdNode = item.get("clientId");
                JsonNode clientSecretNode = item.get("clientSecret");
                if (clientIdNode == null || clientSecretNode == null) {
                    return Mono.error(
                        new RuntimeException("缺少必要配置: clientId 或 clientSecret"));
                }
                // 获取认证令牌
                return getAuthToken(clientIdNode.asText(), clientSecretNode.asText())
                    // 获取令牌后调用AI接口
                    .flatMap(token -> sendArticleToAiChat(token, articleContent).map(
                        ChatCompletionResponse::getResult));

            });
    }

    public void recordTokenResult(String tokenResult, String clientId,
        String secretKey) {
        // 当前时间的 UNIX 时间戳（秒级，UTC）
        Long currentTime = Instant.now().getEpochSecond();
        // 计算绝对过期时间
        Long expireTime = currentTime + currentTime;
        TokenSub tokenSub = new TokenSub(new TokenSub.Spec(tokenResult,
            expireTime
            ,clientId,secretKey));
        Metadata metadata = new Metadata();
        metadata.setName(UUID.randomUUID().toString());
        tokenSub.setMetadata(metadata);
        client.create(tokenSub).subscribe();
    }
    private Mono<ChatCompletionResponse> sendArticleToAiChat(String token,String articleContent){
        String accessToken = HexUtil.decodeHexStr(token);
        return settingFetcher.get(THEME_SETTING)
            .switchIfEmpty(Mono.error(new RuntimeException("配置不存在")))
            .flatMap(item -> {
                // 构建Ai角色
                String systemPrompt = Optional.ofNullable(item.get("aiSystem"))
                    .map(JsonNode::asText)
                    .orElse("你是专业写200字左右的文章摘要总结的写手");
                // 构建消息列表 暂时没获取文章 自定义代替
                List<ChatRequest.Message> messages = List.of(
                    new ChatRequest.Message("user", articleContent)
                );

                return Mono.just(new ChatRequest(messages, systemPrompt));
            })
            .flatMap(request ->
                webClient.post()
                    .uri(Constant.CHAT_URL + "?access_token=" + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                log.error("API请求异常: status={}, body={}", response.statusCode(), errorBody);
                                return Mono.error(new RuntimeException("服务调用失败: " + errorBody));
                            }))
                    .bodyToMono(ChatCompletionResponse.class)
            )
            .doOnNext(response -> {
                // 记录完整响应日志（可选）
                log.debug("收到完整响应: {}", response);
            })
            .handle((response, sink) -> {
                // 安全限制检查
                if (Boolean.TRUE.equals(response.getNeedClearHistory())) {
                    log.warn("触发内容安全限制，需清理历史. 问题轮次: {}", response.getBanRound());
                    sink.error(new SecurityException("内容安全限制触发"));
                    return;
                }
                // 直接传递完整响应对象
                sink.next(response);
            });
    }
    public Mono<String> fetchSecretKey(String secretName, String key) {
        return this.client.fetch(Secret.class, secretName).map(Secret::getStringData)
            .map((data) -> {
                return data.get(key);
            });
    }
    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatRequest {
        /**
         * 聊天上下文信息
         */
        private List<Message> messages;

        private String system;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Message {
            /**
             * 角色类型：user
             */
            private String role;
            /**
             * 消息内容
             */
            private String content;
        }
    }

}
