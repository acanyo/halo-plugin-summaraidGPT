package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings.VoiceService;
import java.net.URI;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

class DoubaoPodcastProviderTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final SpeechTransport transport = mock(SpeechTransport.class);
    private final DoubaoPodcastProvider provider = new DoubaoPodcastProvider(transport);
    private final byte[] pcm = new byte[PcmAudio.BYTES_PER_SECOND];

    @Test
    void nativeRequestUsesSelectedVoicesAndRateWithoutLeakingForeignTags() {
        var settings = settings();
        settings.setVoiceA(" voice-a ");
        settings.setSpeechRate(35);
        var body = new AtomicReference<JsonNode>();
        when(transport.events(any(), any(), any())).thenAnswer(call -> {
            assertThat(call.<URI>getArgument(0).toString()).isEqualTo("https://openspeech.bytedance.com/api/v3/podcast/sse");
            assertThat(call.<Map<String, String>>getArgument(1)).containsEntry("x-api-resource-id", "volc.service_type.10050");
            body.set(mapper.valueToTree(call.getArgument(2)));
            return Flux.fromIterable(round("voice-a", 0));
        });

        var result = provider.synthesize("doubao", settings, List.of(new Turn("A", "[laughing]正文[第一部分]")), count -> { }).block();

        assertThat(body.get().path("action").asInt()).isEqualTo(3);
        assertThat(body.get().path("audio_config").path("format").asText()).isEqualTo("pcm");
        assertThat(body.get().path("audio_config").path("sample_rate").asInt()).isEqualTo(24000);
        assertThat(body.get().path("audio_config").path("speech_rate").asInt()).isEqualTo(35);
        assertThat(body.get().path("use_head_music").asBoolean()).isFalse();
        assertThat(body.get().path("use_tail_music").asBoolean()).isFalse();
        assertThat(body.get().path("nlp_texts").get(0).path("speaker").asText()).isEqualTo("voice-a");
        assertThat(body.get().path("nlp_texts").get(0).path("text").asText()).isEqualTo("正文[第一部分]");
        assertThat(result.turns().getFirst().getText()).isEqualTo("[laughing]正文[第一部分]");
    }

    @Test
    void audioOutsideRoundsAndEmptyTextRoundsCannotProduceASubtitleTimeline() {
        var complete = round("voice-a", 0);
        List<List<SpeechTransport.Event>> invalid = List.of(
            List.of(chunk(), complete.get(0), chunk(), complete.get(2), terminal()),
            List.of(complete.get(0), chunk(), complete.get(2), chunk(), terminal()),
            List.of(event("360", Map.of("payload", Map.of("round_id", -1, "speaker", "music", "text", ""))), chunk(), complete.get(2), terminal()),
            List.of(event("360", Map.of("payload", Map.of("round_id", 0, "speaker", "voice-a"))), chunk(), complete.get(2), terminal()));
        for (var events : invalid) {
            when(transport.events(any(), any(), any())).thenReturn(Flux.fromIterable(events));
            assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容")), count -> { }).block())
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Test
    void musicIsRejectedBeforeAnyPaidRequestUntilItsTimelineContractIsVerified() {
        for (var head : List.of(false, true)) {
            for (var tail : List.of(false, true)) {
                if (!head && !tail) continue;
                var settings = settings();
                settings.setUseHeadMusic(head);
                settings.setUseTailMusic(tail);
                assertThatThrownBy(() -> provider.synthesize("doubao", settings, List.of(new Turn("A", "内容")), count -> { }).block())
                    .hasMessage("豆包片头片尾音效的时间轴尚未兼容，请关闭音效后再合成");
            }
        }
        verifyNoInteractions(transport);
    }

    @Test
    void invalidConfigurationAndLateInvalidTurnsAreRejectedBeforeCallingTheProvider() {
        List<Consumer<VoiceService>> invalid = List.of(
            value -> value.setModel("speech-2.8-turbo"),
            value -> value.setApiKey(""),
            value -> value.setApiKey("secret\r\nX-Other: injected"),
            value -> value.setVoiceB(" voice-a "),
            value -> value.setVoiceB("bad voice"),
            value -> value.setSpeechRate(-51),
            value -> value.setSpeechRate(101),
            value -> value.setLanguage("zh"),
            value -> value.setInstruction("请更开心"),
            value -> value.setEmotion("happy"),
            value -> value.setAutoEmotion(true));
        for (var change : invalid) {
            var settings = settings();
            change.accept(settings);
            assertThatThrownBy(() -> provider.synthesize("doubao", settings, List.of(new Turn("A", "内容")), count -> { }).block())
                .isInstanceOf(IllegalArgumentException.class);
        }
        var longTurn = new Turn("B", "字".repeat(301));
        assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容"), longTurn), count -> { }).block())
            .hasMessageContaining("300");
        var expressed = new Turn("B", "第二轮");
        expressed.setInterjection("laughing");
        assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容"), expressed), count -> { }).block())
            .hasMessageContaining("逐轮情感");
        assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("C", "内容")), count -> { }).block())
            .hasMessageContaining("主持人 A 或 B");
        verifyNoInteractions(transport);
    }

    @Test
    void speedBoundariesAndMissingOptionalSettingsRemainValid() {
        for (var rate : List.of(-50, 0, 100)) {
            var settings = settings();
            settings.setSpeechRate(rate);
            DoubaoPodcastProvider.validate(settings, List.of());
        }
        var settings = settings();
        settings.setSpeechRate(null);
        settings.setUseHeadMusic(null);
        settings.setUseTailMusic(null);
        var body = mapper.valueToTree(DoubaoPodcastRequest.body(settings, List.of(new Turn("A", "正文"))));
        assertThat(body.path("audio_config").path("speech_rate").asInt()).isZero();
        assertThat(body.path("use_head_music").asBoolean()).isFalse();
        assertThat(body.path("use_tail_music").asBoolean()).isFalse();
    }

    @Test
    void malformedOrTruncatedRoundsCannotProducePublishableAudio() {
        var start = event("360", Map.of("payload", Map.of("round_id", 0, "speaker", "voice-a", "text", "内容")));
        var end = event("362", Map.of());
        var done = terminal();
        List<List<SpeechTransport.Event>> invalid = List.of(
            List.of(start, chunk(), done),
            List.of(start, chunk(), end),
            List.of(start, start, chunk(), end, done),
            List.of(chunk(), start, chunk(), end, done),
            List.of(start, end, done),
            List.of(start, chunk(), end, end, done),
            List.of(event("360", Map.of("payload", Map.of("speaker", "other-voice", "text", "内容"))), chunk(), end, done),
            List.of(start, event("361", Map.of("data", "invalid@@")), end, done),
            List.of(start, chunk(), event("362", Map.of("payload", Map.of("is_error", true))), done),
            List.of(new SpeechTransport.Event("153", mapper.valueToTree(Map.of("code", 0, "message", "secret-provider-response")))));
        for (var events : invalid) {
            when(transport.events(any(), any(), any())).thenReturn(Flux.fromIterable(events));
            assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容")), count -> { }).block())
                .isInstanceOf(IllegalStateException.class).hasMessageNotContaining("secret-provider-response");
        }
    }

    @Test
    void completeRoundsKeepTheirRequestedSpeakerAndExactPcmOffsets() {
        var events = new ArrayList<SpeechTransport.Event>();
        events.addAll(round("voice-a", 3).subList(0, 3));
        events.addAll(round("voice-b", 4));
        when(transport.events(any(), any(), any())).thenReturn(Flux.fromIterable(events));
        var progress = new ArrayList<Integer>();

        var result = provider.synthesize("doubao", settings(), List.of(new Turn("A", "提问"), new Turn("B", "回答")), progress::add).block();

        assertThat(result.turns()).extracting(Turn::getSpeaker).containsExactly("A", "B");
        assertThat(result.turns()).extracting(Turn::getStartMs).containsExactly(0L, 1000L);
        assertThat(result.turns()).extracting(Turn::getEndMs).containsExactly(1000L, 2000L);
        assertThat(progress).containsExactly(1, 2);
    }

    @Test
    void sessionFinishedIsTheOnlySuccessSignalAndPodcastEndIsOptional() {
        var complete = round("voice-a", 0);
        when(transport.events(any(), any(), any())).thenReturn(Flux.fromIterable(complete)
            .concatWith(Flux.error(new IllegalStateException("reader must stop after SessionFinished"))));
        assertThat(provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容")), count -> { }).block().pcm())
            .hasSize(pcm.length);

        var withMetadata = new ArrayList<>(complete.subList(0, 3));
        withMetadata.add(event("363", Map.of("meta_info", Map.of())));
        withMetadata.add(event("154", Map.of("payload", Map.of("usage", Map.of("total_tokens", 10)))));
        withMetadata.add(terminal());
        when(transport.events(any(), any(), any())).thenReturn(Flux.fromIterable(withMetadata));
        assertThat(provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容")), count -> { }).block().pcm())
            .hasSize(pcm.length);
    }

    @Test
    void podcastEndOrCompleteAudioWithoutSuccessfulSessionCannotBePublished() {
        var prefix = round("voice-a", 0).subList(0, 3);
        List<List<SpeechTransport.Event>> endings = List.of(
            List.of(),
            List.of(event("363", Map.of())),
            List.of(event("152", Map.of())),
            List.of(event("152", Map.of("code", 0))),
            List.of(event("152", Map.of("code", "20000000"))),
            List.of(event("152", Map.of("code", 20000000.0))),
            List.of(event("151", Map.of())),
            List.of(event("153", Map.of())),
            List.of(event("363", Map.of()), event("151", Map.of())),
            List.of(event("363", Map.of()), event("153", Map.of("code", 0))));
        for (var ending : endings) {
            var events = new ArrayList<>(prefix);
            events.addAll(ending);
            when(transport.events(any(), any(), any())).thenReturn(Flux.fromIterable(events));
            assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容")), count -> { }).block())
                .isInstanceOf(IllegalStateException.class);
        }
    }

    @Test
    void nonTerminalCodeIsOptionalAndWhenPresentMustBeAValidSuccessfulInteger() {
        for (var code : List.of(mapper.valueToTree(Map.of("code", "0")), mapper.valueToTree(Map.of("code", 0.0)),
            mapper.valueToTree(Map.of("code", 123)), mapper.createObjectNode().putNull("code"))) {
            var start = new SpeechTransport.Event("360", code);
            when(transport.events(any(), any(), any())).thenReturn(Flux.just(start, chunk(), event("362", Map.of()), terminal()));
            assertThatThrownBy(() -> provider.synthesize("doubao", settings(), List.of(new Turn("A", "内容")), count -> { }).block())
                .isInstanceOf(IllegalStateException.class);
        }
    }

    private List<SpeechTransport.Event> round(String speaker, int roundId) {
        return List.of(event("360", Map.of("payload", Map.of("round_id", roundId, "speaker", speaker, "text", "内容"))), chunk(),
            event("362", Map.of()), terminal());
    }

    private SpeechTransport.Event terminal() {
        return event("152", Map.of("code", 20000000, "session_id", "session-test"));
    }

    private SpeechTransport.Event chunk() {
        return event("361", Map.of("code", 0, "data", Base64.getEncoder().encodeToString(pcm)));
    }

    private SpeechTransport.Event event(String type, Map<String, ?> values) {
        return new SpeechTransport.Event(type, mapper.valueToTree(values));
    }

    private VoiceService settings() {
        var value = new VoiceService("podcast", "voice-a", "voice-b");
        value.setApiKey("test-key");
        return value;
    }
}
