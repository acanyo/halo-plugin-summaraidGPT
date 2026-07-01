package com.handsome.summary.rag.service.support;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.util.StringUtils;

public record RagSearchQuery(String original, String keyword, List<String> metadataTerms) {

    private static final Pattern TERM_SPLIT_PATTERN = Pattern.compile("[\\s,，、;；|/\\\\]+");

    public RagSearchQuery {
        metadataTerms = metadataTerms == null ? List.of() : List.copyOf(metadataTerms);
    }

    public static RagSearchQuery from(String query) {
        var original = query.strip();
        var terms = new LinkedHashSet<String>();
        collectSearchTerms(terms, original);
        return new RagSearchQuery(original, original, List.copyOf(terms));
    }

    private static void collectSearchTerms(LinkedHashSet<String> terms, String query) {
        if (!StringUtils.hasText(query)) {
            return;
        }
        if (query.strip().length() <= 32) {
            addTerm(terms, query);
        }
        for (var term : TERM_SPLIT_PATTERN.split(query)) {
            addTerm(terms, term);
        }
    }

    private static void addTerm(LinkedHashSet<String> terms, String value) {
        if (!StringUtils.hasText(value)) {
            return;
        }
        var term = value.strip();
        if (term.length() >= 2) {
            terms.add(term);
        }
    }
}
