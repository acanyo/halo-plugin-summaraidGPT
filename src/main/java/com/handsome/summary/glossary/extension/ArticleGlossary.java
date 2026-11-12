package com.handsome.summary.glossary.extension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@EqualsAndHashCode(callSuper = true)
@GVK(group = "summaraidgpt.lik.cc", version = "v1alpha1", kind = "ArticleGlossary",
    singular = "articleglossary", plural = "articleglossaries")
public class ArticleGlossary extends AbstractExtension {
    private Spec spec;

    @Data
    public static class Spec {
        private String postName;
        private String postTitle;
        private String contentHash;
        private String modelName;
        private Integer maxTerms;
        private Instant generatedAt;
        private List<Term> terms = new ArrayList<>();
    }

    public record Term(String term, String explanation) {
    }
}
