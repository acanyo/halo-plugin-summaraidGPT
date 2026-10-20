package com.handsome.summary.podcast.audio;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PushbackReader;
import java.io.Reader;

/** Bounded SSE framing for speech services that send one JSON value per event. */
final class SpeechEventReader implements AutoCloseable {
    static final int MAX_LINE_BYTES = 2 * 1024 * 1024;
    static final int MAX_EVENT_BYTES = 2 * 1024 * 1024;
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final PushbackReader reader;
    private boolean firstCharacter = true;

    SpeechEventReader(Reader reader) {
        this.reader = new PushbackReader(new BufferedReader(reader), 1);
    }

    SpeechTransport.Event next() {
        var event = "";
        var data = new StringBuilder();
        boolean hasData = false;
        int frameBytes = 0;
        try {
            while (true) {
                var line = readLine();
                if (line == null) return hasData ? parse(event, data) : null;
                if (line.isEmpty()) {
                    if (hasData) return parse(event, data);
                    // An empty/comment-only frame must not leak its event name to later data.
                    event = "";
                    frameBytes = 0;
                    continue;
                }
                frameBytes += line.chars().map(SpeechEventReader::utf8Weight).sum() + 1;
                if (frameBytes > MAX_EVENT_BYTES) throw tooLarge();
                if (line.charAt(0) == ':') continue;
                int separator = line.indexOf(':');
                var field = separator < 0 ? line : line.substring(0, separator);
                var value = separator < 0 ? "" : line.substring(separator + 1);
                // SSE removes only one optional ASCII space after the separator.
                if (value.startsWith(" ")) value = value.substring(1);
                if ("event".equals(field)) event = value;
                else if ("data".equals(field)) {
                    if (hasData) data.append('\n');
                    data.append(value);
                    hasData = true;
                }
            }
        } catch (IOException ignored) {
            throw new IllegalStateException("语音事件流读取失败，请重新合成");
        }
    }

    private SpeechTransport.Event parse(String event, StringBuilder data) {
        try {
            var json = MAPPER.readTree(data.toString());
            if (json == null || json.isMissingNode()) throw new IllegalArgumentException();
            return new SpeechTransport.Event(event, json);
        } catch (Exception ignored) {
            // Jackson errors can contain provider text or audio payloads; never expose their cause.
            throw new IllegalStateException("语音事件流未返回有效 JSON，请重新合成");
        }
    }

    private String readLine() throws IOException {
        var line = new StringBuilder();
        int lineBytes = 0;
        while (true) {
            int value = reader.read();
            if (firstCharacter) {
                firstCharacter = false;
                if (value == '\ufeff') continue;
            }
            if (value < 0) return line.isEmpty() ? null : line.toString();
            if (value == '\n') return line.toString();
            if (value == '\r') {
                int following = reader.read();
                if (following >= 0 && following != '\n') reader.unread(following);
                return line.toString();
            }
            lineBytes += utf8Weight(value);
            if (lineBytes > MAX_LINE_BYTES) throw tooLarge();
            line.append((char) value);
        }
    }

    // Count UTF-16 surrogate halves conservatively as three bytes each; paired input stays bounded.
    private static int utf8Weight(int value) { return value < 0x80 ? 1 : value < 0x800 ? 2 : 3; }

    private static IllegalStateException tooLarge() {
        return new IllegalStateException("语音事件流分片超过 2 MiB 上限，请重新合成");
    }

    @Override
    public void close() throws IOException { reader.close(); }
}
