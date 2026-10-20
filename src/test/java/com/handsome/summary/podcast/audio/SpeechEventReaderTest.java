package com.handsome.summary.podcast.audio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class SpeechEventReaderTest {
    @ParameterizedTest
    @ValueSource(strings = {"\n", "\r\n", "\r"})
    void readsBomMultilineJsonAndFinalFrameAtEof(String newline) throws Exception {
        try (var reader = reader("\ufeff: heartbeat" + newline + newline
            + "event: 360" + newline + "data: {" + newline + "data:  \"code\": 0" + newline + "data: }"
            + newline + newline + "event: 363" + newline + "data: {\"code\":20000000}")) {
            var first = reader.next();
            assertThat(first.event()).isEqualTo("360");
            assertThat(first.data().path("code").asInt()).isZero();
            var finalEvent = reader.next();
            assertThat(finalEvent.event()).isEqualTo("363");
            assertThat(finalEvent.data().path("code").asInt()).isEqualTo(20000000);
            assertThat(reader.next()).isNull();
        }
    }

    @Test
    void skipsEmptyFramesAndClearsEventNameAfterHeartbeat() throws Exception {
        try (var reader = reader("event: stale\n: keepalive\n\n\n: heartbeat\n\ndata: {\"ready\":true}\n\n"
            + "event: second\ndata: {}\n\ndata: {}\n\n")) {
            assertThat(reader.next().event()).isEmpty();
            assertThat(reader.next().event()).isEqualTo("second");
            assertThat(reader.next().event()).isEmpty();
            assertThat(reader.next()).isNull();
        }
    }

    @Test
    void stripsOnlyOneSpaceAndUsesLastEventField() throws Exception {
        try (var reader = reader("id: ignored\nretry: 1000\nevent: first\nevent:  second \ndata:{\"text\":\" leading and trailing \"}\n\n")) {
            var event = reader.next();
            assertThat(event.event()).isEqualTo(" second ");
            assertThat(event.data().path("text").asText()).isEqualTo(" leading and trailing ");
        }
    }

    @Test
    void emptyAndCommentOnlyStreamsEndNormally() throws Exception {
        for (var source : new String[]{"", "\ufeff", "\n\n", ": heartbeat", "event: unused\n\n"}) {
            try (var reader = reader(source)) {
                assertThat(reader.next()).isNull();
            }
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"data: secret-sk-sensitive\n\n", "data: {\"secret-sk-sensitive\":\n\n", "data:\n\n"})
    void malformedJsonHasFixedMessageWithoutPayloadOrCause(String source) throws Exception {
        try (var reader = reader(source)) {
            assertThatThrownBy(reader::next)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("语音事件流未返回有效 JSON，请重新合成")
                .hasMessageNotContaining("secret-sk-sensitive")
                .hasNoCause();
        }
    }

    @Test
    void stopsReadingAnOversizedLineWithoutAllocatingTheRest() throws Exception {
        var source = new RepeatingReader((long) SpeechEventReader.MAX_LINE_BYTES * 20);
        try (var reader = new SpeechEventReader(source)) {
            assertThatThrownBy(reader::next).hasMessageContaining("2 MiB").hasNoCause();
            assertThat(source.read).isLessThanOrEqualTo(SpeechEventReader.MAX_LINE_BYTES + 8192L);
        }
    }

    @Test
    void rejectsOversizedMultilineFrames() throws Exception {
        var oneLine = "data: " + "x".repeat(1024) + "\n";
        try (var reader = reader(oneLine.repeat(SpeechEventReader.MAX_EVENT_BYTES / 1024 + 1))) {
            assertThatThrownBy(reader::next).hasMessageContaining("2 MiB").hasNoCause();
        }
    }

    @Test
    void limitsMultibyteTextByEncodedSize() throws Exception {
        try (var reader = reader("data: " + "汉".repeat(SpeechEventReader.MAX_LINE_BYTES / 3 + 1))) {
            assertThatThrownBy(reader::next).hasMessageContaining("2 MiB").hasNoCause();
        }
    }

    @Test
    void readerFailuresNeverExposeProviderControlledExceptionMessages() throws Exception {
        try (var reader = new SpeechEventReader(new Reader() {
            @Override
            public int read(char[] target, int offset, int length) throws IOException {
                throw new IOException("secret-sk-sensitive");
            }
            @Override
            public void close() { }
        })) {
            assertThatThrownBy(reader::next)
                .hasMessage("语音事件流读取失败，请重新合成").hasNoCause();
        }
    }

    private SpeechEventReader reader(String input) { return new SpeechEventReader(new StringReader(input)); }

    private static final class RepeatingReader extends Reader {
        private final long length;
        private long read;
        RepeatingReader(long length) { this.length = length; }
        @Override
        public int read(char[] target, int offset, int requested) {
            int count = (int) Math.min(length - read, requested);
            if (count == 0) return -1;
            java.util.Arrays.fill(target, offset, offset + count, 'x');
            read += count;
            return count;
        }
        @Override
        public void close() { }
    }
}
