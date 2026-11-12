package com.handsome.summary.search.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.search.SearchOption;

/** Public article discovery without loading content or invoking AI. */
@Service
@RequiredArgsConstructor
public class SearchDiscoveryService {
    private static final int SIZE = 3;
    private static final Comparator<Article> POPULAR = Comparator.comparingLong(Article::visits)
        .reversed().thenComparing(Article::id);
    private final ReactiveExtensionClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    public record Article(String id, String title, String url, long visits) { }
    public record Result(List<Article> random, List<Article> popular) { }

    public Mono<Result> discover(SearchOption option, List<String> excludeIds) {
        // Limit exclusions to the previous visible batch. Never retain visibility decisions across requests.
        var excluded = excludeIds == null ? Set.<String>of()
            : Set.copyOf(excludeIds.stream().filter(java.util.Objects::nonNull).limit(SIZE).toList());
        var scope = option == null ? new SearchOption() : option;
        return client.listAll(Post.class, new ListOptions(), Sort.unsorted())
            .filter(PublicSearchSourceResolver::isPublic)
            .filter(post -> !Boolean.TRUE.equals(post.getStatus().getHideFromList()))
            .filter(post -> PublicSearchSourceResolver.matches(post, scope))
            .map(post -> new Article(post.getMetadata().getName(), post.getSpec().getTitle(),
                post.getStatus().getPermalink(), visits(post)))
            .collect(() -> new Selection(excluded), Selection::add)
            .map(Selection::result);
    }

    private long visits(Post post) {
        var annotations = post.getMetadata().getAnnotations();
        var json = annotations == null ? null : annotations.get(Post.STATS_ANNO);
        if (json == null || json.isBlank()) return 0;
        try {
            return Math.max(0, mapper.readTree(json).path("visit").asLong(0));
        } catch (Exception ignored) {
            return 0;
        }
    }

    /** Reservoir sampling keeps memory bounded even for large blogs. */
    private static final class Selection {
        private final Set<String> excluded;
        private final List<Article> random = new ArrayList<>(SIZE);
        private final List<Article> previous = new ArrayList<>(SIZE);
        private final List<Article> popular = new ArrayList<>(SIZE + 1);
        private long seen;

        Selection(Set<String> excluded) { this.excluded = excluded; }

        void add(Article article) {
            popular.add(article);
            popular.sort(POPULAR);
            if (popular.size() > SIZE) popular.removeLast();
            if (excluded.contains(article.id())) {
                previous.add(article);
                return;
            }
            ++seen;
            if (random.size() < SIZE) random.add(article);
            else {
                long index = ThreadLocalRandom.current().nextLong(seen);
                if (index < SIZE) random.set((int) index, article);
            }
        }

        Result result() {
            // Small sites still show all available articles when there is no full new batch.
            for (var article : previous) if (random.size() < SIZE) random.add(article);
            java.util.Collections.shuffle(random);
            return new Result(List.copyOf(random), List.copyOf(popular));
        }
    }
}
