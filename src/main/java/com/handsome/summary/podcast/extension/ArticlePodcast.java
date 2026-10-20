package com.handsome.summary.podcast.extension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@EqualsAndHashCode(callSuper = true)
@GVK(group = "summaraidgpt.lik.cc", version = "v1alpha1", kind = "ArticlePodcast",
    singular = "articlepodcast", plural = "articlepodcasts")
public class ArticlePodcast extends AbstractExtension {
    private Spec spec = new Spec();
    private Status status = new Status();

    @Data
    public static class Spec {
        private String postName;
        private String postTitle;
        private String contentHash;
        private Integer durationMinutes = 2;
        private String style = "casual";
        private String scriptModelName;
        private List<Turn> turns = new ArrayList<>();
        private Audio audio;
    }

    @Data
    public static class Turn {
        private String speaker;
        private String text;
        private String emotion;
        private String interjection;
        private Long startMs;
        private Long endMs;

        public Turn() { }

        public Turn(String speaker, String text) {
            this.speaker = speaker;
            this.text = text;
        }
    }

    @Data
    public static class Audio {
        private String url;
        private String attachmentName;
        private String provider;
        private String model;
        private String contentHash;
        private String scriptHash;
        private Long durationMs;
        private Instant generatedAt;
        private List<Turn> turns = new ArrayList<>();
    }

    @Data
    public static class Status {
        private String phase = "DRAFT";
        private String message;
        private Integer completedTurns = 0;
        private Instant updatedAt;
    }
}
