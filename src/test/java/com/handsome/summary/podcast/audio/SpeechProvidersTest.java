package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

class SpeechProvidersTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final byte[] pcm = new byte[PcmAudio.BYTES_PER_SECOND];
    private final SpeechTransport transport = mock(SpeechTransport.class);
    private final VoiceService voice = new VoiceService("speech-2.8-turbo", "voice-a", "voice-b");

    @Test
    void minimaxWireContractsAndPcmTimelineStayDifferentAcrossChannels() {
        voice.setApiKey("test-key");
        var provider = new TurnSpeechProvider(transport);
        var captured = new AtomicReference<Map<?, ?>>();
        when(transport.post(any(), any(), any())).thenAnswer(call -> {
            Map<?, ?> body = call.getArgument(2);
            captured.set(body);
            var audio = Map.of("base_resp", Map.of("status_code", 0), "data", Map.of("audio", HexFormat.of().formatHex(pcm)));
            return Mono.just(mapper.valueToTree(body.containsKey("input") ? Map.of("output", audio) : audio));
        });
        var turns = List.of(new Turn("A", "提问"), new Turn("B", "解释"));
        var direct = provider.synthesize("minimax", voice, turns, count -> { }).block();
        assertThat(captured.get().containsKey("text")).isTrue();
        assertThat(captured.get().containsKey("voice_setting")).isTrue();
        assertThat(captured.get().containsKey("input")).isFalse();
        assertThat(direct.turns().get(0).getStartMs()).isZero();
        assertThat(direct.turns().get(0).getEndMs()).isEqualTo(1000);
        assertThat(direct.turns().get(1).getStartMs()).isEqualTo(1180);
        assertThat(direct.turns().get(1).getEndMs()).isEqualTo(2180);
        provider.synthesize("bailian-minimax", voice, turns, count -> { }).block();
        assertThat(captured.get().containsKey("input")).isTrue();
        assertThat(captured.get().containsKey("text")).isFalse();
    }

    @Test
    void cosyvoiceDownloadsRawPcmFromItsWorkspaceEndpoint() {
        voice.setApiKey("test-key");
        voice.setWorkspaceId("workspace-123");
        voice.setModel("cosyvoice-v3-flash");
        when(transport.post(any(), any(), any())).thenReturn(Mono.just(mapper.valueToTree(
            Map.of("output", Map.of("audio", Map.of("url", "https://result.oss-cn-beijing.aliyuncs.com/audio.pcm"))))));
        when(transport.download(any())).thenReturn(Mono.just(pcm));
        assertThat(TurnSpeechProvider.endpoint("bailian-cosyvoice", voice))
            .isEqualTo(URI.create("https://workspace-123.cn-beijing.maas.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer"));
        var result = new TurnSpeechProvider(transport).synthesize("bailian-cosyvoice", voice, List.of(new Turn("A", "内容")), count -> { }).block();
        assertThat(result.pcm()).hasSize(pcm.length);
        voice.setWorkspaceId("bad/host");
        assertThatThrownBy(() -> TurnSpeechProvider.endpoint("bailian-cosyvoice", voice)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void doubaoRequiresEveryRoundAndTheFinalEventBeforePublishingAudio() {
        voice.setApiKey("test-key");
        voice.setModel("podcast");
        var start = new SpeechTransport.Event("360", mapper.valueToTree(Map.of("code", 0,
            "payload", Map.of("round_id", 0, "speaker", "voice-a", "text", "内容"))));
        var chunk = new SpeechTransport.Event("361", mapper.valueToTree(Map.of("code", 0, "data", Base64.getEncoder().encodeToString(pcm))));
        var end = new SpeechTransport.Event("362", mapper.valueToTree(Map.of("code", 0)));
        var done = new SpeechTransport.Event("152", mapper.valueToTree(Map.of("code", 20000000)));
        var provider = new DoubaoPodcastProvider(transport);
        when(transport.events(any(), any(), any())).thenReturn(Flux.just(start, chunk, end, done));
        assertThat(provider.synthesize("doubao", voice, List.of(new Turn("A", "内容")), count -> { }).block().turns().getFirst().getEndMs()).isEqualTo(1000);
        when(transport.events(any(), any(), any())).thenReturn(Flux.just(start, chunk, end));
        assertThatThrownBy(() -> provider.synthesize("doubao", voice, List.of(new Turn("A", "内容")), count -> { }).block())
            .hasMessageContaining("中断");
    }

    @Test
    void wavHeaderDescribesActualAudioAndRejectsInvalidPcm() {
        var wav = ByteBuffer.wrap(PcmAudio.wav(pcm)).order(ByteOrder.LITTLE_ENDIAN);
        assertThat(wav.getInt(24)).isEqualTo(24000);
        assertThat(wav.getInt(40)).isEqualTo(pcm.length);
        assertThatThrownBy(() -> PcmAudio.wav(new byte[1])).isInstanceOf(IllegalArgumentException.class);
    }
}
