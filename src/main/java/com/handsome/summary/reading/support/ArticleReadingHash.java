package com.handsome.summary.reading.support;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class ArticleReadingHash {

    private ArticleReadingHash() {
    }

    public static String sha256(String value) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(defaultString(value).getBytes(StandardCharsets.UTF_8));
            var builder = new StringBuilder(hash.length * 2);
            for (byte item : hash) {
                builder.append(String.format("%02x", item));
            }
            return builder.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Unable to calculate article reading hash", e);
        }
    }

    private static String defaultString(String value) {
        return value == null ? "" : value;
    }
}
