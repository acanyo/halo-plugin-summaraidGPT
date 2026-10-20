package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

class MinimaxSpeechResponseTest {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void decodesFinalPcmAndAcceptsLegacyResponsesWithoutOptionalStatus() {
        var result = success("00fF1234");
        result.withObject("/data").put("status", 2);
        result.set("extra_info", MAPPER.valueToTree(Map.of(
            "audio_format", "pcm", "audio_sample_rate", 24000, "audio_channel", 1)));
        assertThat(MinimaxSpeechResponse.decode(result)).containsExactly(new byte[]{0, (byte) 255, 18, 52});
        result.withObject("/data").remove("status");
        assertThat(MinimaxSpeechResponse.decode(result)).hasSize(4);
    }

    @ParameterizedTest
    @CsvSource({
        "1001, 超时", "1002, 限流", "1039, 限流", "1004, 鉴权", "2049, 鉴权",
        "1008, 余额", "1026, 内容审核", "1042, 非法字符", "2013, 参数", "20132, 参数",
        "2042, 音色", "2056, 套餐", "9999, 合成失败"
    })
    void mapsProviderFailuresWithoutExposingStatusMessages(int code, String expected) {
        var result = MAPPER.valueToTree(Map.of("base_resp", Map.of(
            "status_code", code, "status_msg", "secret-sk-sensitive https://private.example")));
        assertThatThrownBy(() -> MinimaxSpeechResponse.decode(result))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining(expected)
            .hasMessageNotContaining("secret-sk-sensitive")
            .hasMessageNotContaining("private.example")
            .hasNoCause();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "0", "00", "000", "000000", "secret-sk-sensitive", "00z1", "524946460000"})
    void rejectsMalformedOrNonPcmAudioWithFixedMessages(String audio) {
        assertThatThrownBy(() -> MinimaxSpeechResponse.decode(success(audio)))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("PCM 音频")
            .hasMessageNotContaining("secret-sk-sensitive")
            .hasNoCause();
    }

    @Test
    void rejectsMissingOrMalformedSuccessStatusAndAudio() {
        var invalid = List.of(
            MAPPER.nullNode(), MAPPER.createObjectNode(),
            MAPPER.valueToTree(Map.of("base_resp", Map.of("status_code", "0"))),
            MAPPER.valueToTree(Map.of("base_resp", Map.of("status_code", 0), "data", Map.of())),
            MAPPER.valueToTree(Map.of("base_resp", Map.of("status_code", 0), "data", Map.of("audio", 1234)))
        );
        for (var result : invalid) {
            assertThatThrownBy(() -> MinimaxSpeechResponse.decode(result))
                .isInstanceOf(IllegalStateException.class).hasNoCause();
        }
        assertThatThrownBy(() -> MinimaxSpeechResponse.decode(null))
            .isInstanceOf(IllegalStateException.class).hasNoCause();
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 3})
    void rejectsUnfinishedOrUnknownAudioStatus(int status) {
        var result = success("00000000");
        result.withObject("/data").put("status", status);
        assertThatThrownBy(() -> MinimaxSpeechResponse.decode(result))
            .isInstanceOf(IllegalStateException.class).hasMessageContaining("尚未完成").hasNoCause();
    }

    @Test
    void rejectsDeclaredAudioFormatsThatWouldCorruptThePcmTimeline() {
        for (var metadata : List.of(Map.of("audio_format", "mp3"), Map.of("audio_sample_rate", 32000),
            Map.of("audio_channel", 2))) {
            var result = success("00000000");
            result.set("extra_info", MAPPER.valueToTree(metadata));
            assertThatThrownBy(() -> MinimaxSpeechResponse.decode(result))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("PCM 音频").hasNoCause();
        }
    }

    private static com.fasterxml.jackson.databind.node.ObjectNode success(String hex) {
        return MAPPER.valueToTree(Map.of("base_resp", Map.of("status_code", 0), "data", Map.of("audio", hex)));
    }
}
