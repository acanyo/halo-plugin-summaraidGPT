package com.handsome.summary.rag.service.impl;

import com.handsome.summary.rag.service.RagContentService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Pattern;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DefaultRagContentService implements RagContentService {

    private static final Pattern HTML_PATTERN = Pattern.compile("<[a-zA-Z][\\s\\S]*>");
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("[\\t\\x0B\\f\\r ]+");
    private static final Pattern BLANK_LINES_PATTERN = Pattern.compile("\\n{3,}");

    @Override
    public String normalize(String content) {
        if (!StringUtils.hasText(content)) {
            return "";
        }
        var text = content;
        if (HTML_PATTERN.matcher(text).find()) {
            var document = Jsoup.parse(text);
            document.select("script,style,noscript,iframe,svg,canvas,form,input,button").remove();
            text = document.body() != null ? document.body().text() : document.text();
        }
        text = text.replace('\u00A0', ' ');
        text = WHITESPACE_PATTERN.matcher(text).replaceAll(" ");
        text = text.lines()
            .map(String::strip)
            .filter(line -> !line.isEmpty())
            .reduce((left, right) -> left + "\n" + right)
            .orElse("");
        return BLANK_LINES_PATTERN.matcher(text).replaceAll("\n\n").strip();
    }

    @Override
    public String hash(String content) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(defaultString(content)
                .getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash RAG document content", e);
        }
    }

    @Override
    public List<String> split(String title, String content, int chunkSize, int chunkOverlap) {
        var normalizedContent = normalize(content);
        if (!StringUtils.hasText(normalizedContent)) {
            return List.of();
        }

        var safeChunkSize = clamp(chunkSize, 200, 3000);
        var safeOverlap = Math.min(Math.max(chunkOverlap, 0), safeChunkSize / 2);
        var prefix = StringUtils.hasText(title) ? "标题：" + title.strip() + "\n\n" : "";
        var paragraphs = normalizedContent.split("\\n+");
        var chunks = new ArrayList<String>();
        var current = new StringBuilder();

        for (var paragraph : paragraphs) {
            var cleanParagraph = paragraph.strip();
            if (cleanParagraph.isEmpty()) {
                continue;
            }
            if (cleanParagraph.length() > safeChunkSize) {
                flushChunk(chunks, prefix, current);
                splitLongParagraph(chunks, prefix, cleanParagraph, safeChunkSize, safeOverlap);
                continue;
            }
            if (current.length() > 0 && current.length() + cleanParagraph.length() + 1 > safeChunkSize) {
                flushChunk(chunks, prefix, current);
            }
            if (current.length() > 0) {
                current.append('\n');
            }
            current.append(cleanParagraph);
        }
        flushChunk(chunks, prefix, current);
        return chunks;
    }

    private void splitLongParagraph(List<String> chunks, String prefix, String paragraph, int chunkSize,
        int overlap) {
        var start = 0;
        while (start < paragraph.length()) {
            var end = Math.min(start + chunkSize, paragraph.length());
            var chunk = paragraph.substring(start, end).strip();
            if (StringUtils.hasText(chunk)) {
                chunks.add((prefix + chunk).strip());
            }
            if (end >= paragraph.length()) {
                break;
            }
            start = Math.max(end - overlap, start + 1);
        }
    }

    private void flushChunk(List<String> chunks, String prefix, StringBuilder current) {
        if (current.isEmpty()) {
            return;
        }
        chunks.add((prefix + current).strip());
        current.setLength(0);
    }

    private int clamp(int value, int min, int max) {
        return Math.min(Math.max(value, min), max);
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }
}
