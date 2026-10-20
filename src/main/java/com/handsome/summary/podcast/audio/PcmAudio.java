package com.handsome.summary.podcast.audio;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;

/** 24 kHz, signed 16-bit little-endian mono, shared by every speech adapter. */
public final class PcmAudio {
    public static final int SAMPLE_RATE = 24000;
    public static final int BYTES_PER_SECOND = SAMPLE_RATE * 2;
    public static final int MAX_BYTES = BYTES_PER_SECOND * 8 * 60;

    private PcmAudio() { }

    public static void validate(byte[] bytes) {
        if (bytes == null || bytes.length < 2 || bytes.length > MAX_BYTES || bytes.length % 2 != 0) {
            throw new IllegalArgumentException("语音服务返回的 PCM 音频为空、过大或格式不完整");
        }
        if (bytes.length >= 4 && new String(bytes, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")) {
            throw new IllegalArgumentException("语音服务返回了 WAV，预期为 24kHz PCM");
        }
    }

    public static long durationMs(int byteCount) {
        return byteCount * 1000L / BYTES_PER_SECOND;
    }

    public static byte[] wav(byte[] pcm) {
        validate(pcm);
        return ByteBuffer.allocate(44 + pcm.length).order(ByteOrder.LITTLE_ENDIAN)
            .put("RIFF".getBytes(StandardCharsets.US_ASCII)).putInt(36 + pcm.length)
            .put("WAVEfmt ".getBytes(StandardCharsets.US_ASCII)).putInt(16)
            .putShort((short) 1).putShort((short) 1).putInt(SAMPLE_RATE)
            .putInt(BYTES_PER_SECOND).putShort((short) 2).putShort((short) 16)
            .put("data".getBytes(StandardCharsets.US_ASCII)).putInt(pcm.length).put(pcm).array();
    }
}
