package com.handsome.summary.reading.model;

public record ArticleReadingInteractionCommand(
    String postName,
    String nodeId,
    String interactionType,
    String value,
    String visitorId
) {
}
