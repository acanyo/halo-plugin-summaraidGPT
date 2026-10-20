package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;

/** Converts provider failures to fixed, credential-free messages suitable for job status. */
final class SpeechServiceErrors {
    static final int MAX_ERROR_BYTES = 8192;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private SpeechServiceErrors() {
    }

    static IllegalStateException fromHttp(int status, InputStream body) {
        JsonNode error = null;
        try {
            var bytes = body.readNBytes(MAX_ERROR_BYTES + 1);
            if (bytes.length <= MAX_ERROR_BYTES) error = MAPPER.readTree(bytes);
        } catch (Exception ignored) {
            // Parser exceptions can contain provider response text; never propagate them.
        }
        return failure(status, error);
    }

    static void checkResponse(JsonNode response) {
        if (response == null) throw new IllegalStateException("语音服务未返回有效响应");
        var code = response.get("code");
        if (code != null && !code.isNull()
            && code.asLong(-1) != 0 && code.asLong(-1) != 20000000L) {
            throw failure(200, response);
        }
    }

    private static IllegalStateException failure(int status, JsonNode response) {
        var code = response == null ? "" : response.path("code").asText();
        if ("InvalidParameter".equals(code) && response.path("message").asText().contains("The product is not activated")) {
            return new IllegalStateException("当前百炼账号尚未开通所选模型服务，请在百炼控制台开通后重试");
        }
        if ("BadRequest.IllegalEndpoint".equals(code)) {
            return new IllegalStateException("百炼业务空间端点无效（BadRequest.IllegalEndpoint），请核对北京地域的业务空间 ID 与 API Key 所属空间");
        }
        var message = switch (status) {
            case 401 -> "语音服务鉴权失败（HTTP 401），请检查 API Key 是否有效及所属地域";
            case 403 -> "语音服务拒绝访问（HTTP 403），请检查 API Key、业务空间和模型的访问权限";
            case 429 -> "语音服务限流或额度不足（HTTP 429），请检查服务额度后重试";
            case 200 -> "语音服务请求失败，请检查模型、音色、余额与密钥权限";
            default -> "语音服务返回 HTTP " + status + "，请检查语音服务配置";
        };
        return new IllegalStateException(message);
    }
}
