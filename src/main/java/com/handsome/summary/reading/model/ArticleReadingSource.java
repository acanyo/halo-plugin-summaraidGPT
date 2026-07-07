package com.handsome.summary.reading.model;

public record ArticleReadingSource(
    String postName,
    String title,
    String url,
    String content,
    String contentHash
) {
}
