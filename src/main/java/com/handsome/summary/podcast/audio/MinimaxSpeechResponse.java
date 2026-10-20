package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.HexFormat;

/** Decodes the shared MiniMax result inside either a direct or Bailian response. */
final class MinimaxSpeechResponse {
    private static final String INVALID_RESPONSE = "MiniMax 未返回有效的语音合成响应，请重新合成";
    private static final String INVALID_AUDIO = "MiniMax 未返回有效的 24kHz 单声道 PCM 音频，请检查模型后重试";

    private MinimaxSpeechResponse() { }

    static byte[] decode(JsonNode result) {
        if (result == null || !result.isObject()) throw invalidResponse();
        var code = result.path("base_resp").path("status_code");
        if (!code.isIntegralNumber() || !code.canConvertToInt()) throw invalidResponse();
        if (code.intValue() != 0) throw failure(code.intValue());

        var data = result.path("data");
        if (!data.isObject()) throw invalidResponse();
        var status = data.get("status");
        // Older compatible responses can omit status, but a supplied status must be final.
        if (status != null && (!status.isIntegralNumber() || !status.canConvertToInt() || status.intValue() != 2)) {
            throw new IllegalStateException("MiniMax 返回的音频尚未完成，请重新合成");
        }
        validateAudioMetadata(result.get("extra_info"));
        var audio = data.path("audio");
        if (!audio.isTextual()) throw invalidAudio();
        var hex = audio.textValue();
        if (hex.length() < 4 || hex.length() > PcmAudio.MAX_BYTES * 2 || hex.length() % 2 != 0) throw invalidAudio();
        for (int index = 0; index < hex.length(); index++) {
            char value = hex.charAt(index);
            if (!(value >= '0' && value <= '9' || value >= 'a' && value <= 'f' || value >= 'A' && value <= 'F')) {
                throw invalidAudio();
            }
        }
        try {
            var pcm = HexFormat.of().parseHex(hex);
            PcmAudio.validate(pcm);
            return pcm;
        } catch (IllegalArgumentException ignored) {
            // Hex/parser exceptions may include response fragments; never attach them as a cause.
            throw invalidAudio();
        }
    }

    private static void validateAudioMetadata(JsonNode metadata) {
        if (metadata == null || metadata.isNull()) return;
        if (!metadata.isObject()) throw invalidAudio();
        var format = metadata.get("audio_format");
        if (format != null && (!format.isTextual() || !"pcm".equalsIgnoreCase(format.textValue()))) throw invalidAudio();
        var sampleRate = metadata.get("audio_sample_rate");
        if (sampleRate != null && (!sampleRate.isIntegralNumber() || !sampleRate.canConvertToInt()
            || sampleRate.intValue() != PcmAudio.SAMPLE_RATE)) throw invalidAudio();
        var channels = metadata.get("audio_channel");
        if (channels != null && (!channels.isIntegralNumber() || !channels.canConvertToInt() || channels.intValue() != 1)) {
            throw invalidAudio();
        }
    }

    private static IllegalStateException failure(int code) {
        var message = switch (code) {
            case 1001 -> "MiniMax 合成请求超时，请稍后重试";
            case 1002, 1039, 1041, 2045 -> "MiniMax 合成请求受到限流，请稍后重试";
            case 1004, 2049 -> "MiniMax 鉴权失败，请检查所选渠道的 API Key";
            case 1008 -> "MiniMax 余额不足，请检查所选渠道的账户余额";
            case 1026, 1027 -> "MiniMax 未通过内容审核，请调整讨论稿后重试";
            case 1042 -> "MiniMax 检测到过多非法字符，请检查讨论稿后重试";
            case 2013, 20132 -> "MiniMax 合成参数无效，请检查模型、音色、情感与语言设置";
            case 2042 -> "MiniMax 无权访问所选音色，请检查音色 ID 与所属账户";
            case 2056 -> "MiniMax 套餐资源暂时受限，请稍后重试";
            default -> "MiniMax 合成失败，请检查模型、音色、密钥权限和余额";
        };
        return new IllegalStateException(message);
    }

    private static IllegalStateException invalidResponse() { return new IllegalStateException(INVALID_RESPONSE); }
    private static IllegalStateException invalidAudio() { return new IllegalStateException(INVALID_AUDIO); }
}
