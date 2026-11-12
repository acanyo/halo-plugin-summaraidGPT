package com.handsome.summary.search.service;

import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.service.RagAiService;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.service.SettingConfigGetter;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.search.SearchOption;
import run.halo.app.search.SearchService;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmartSearchService {
    private final SettingConfigGetter settings;
    private final SearchService haloSearch;
    private final RagSearchService ragSearch;
    private final RagAiService ai;
    private final PublicSearchSourceResolver publicSources;

    public record Hit(String id, String title, String url, String excerpt, String type) { }
    public record Result(List<Hit> hits, String mode, boolean fallback, String message) { }

    public Mono<SettingConfigGetter.SmartSearchConfig> requireEnabled() {
        return settings.getSmartSearchConfig().filter(config -> Boolean.TRUE.equals(config.getEnable()))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "智能搜索尚未启用")));
    }

    public Mono<Result> keyword(SearchOption option) {
        return haloSearch.search(option).flatMap(result -> {
            var hits = result.getHits() == null ? List.<run.halo.app.search.HaloDocument>of()
                : result.getHits().stream()
                    .filter(hit -> hit.isPublished() && hit.isExposed() && !hit.isRecycled()).toList();
            return publicSources.fromHaloHits(hits, option).map(current -> {
                var articles = new LinkedHashMap<String, RagSearchResult>();
                current.forEach(article -> articles.putIfAbsent(article.getSourceName(), article));
                var results = new java.util.ArrayList<Hit>();
                for (var hit : hits) {
                    if (PublicSearchSourceResolver.POST_TYPE.equals(hit.getType())) {
                        var article = articles.get(hit.getMetadataName());
                        if (article != null) {
                            results.add(new Hit(hit.getId(), text(article.getTitle()), article.getUrl(),
                                excerpt(article.getContent()), hit.getType()));
                        }
                    } else {
                        results.add(new Hit(hit.getId(), text(hit.getTitle()), hit.getPermalink(),
                            excerpt(hit.getDescription() == null ? hit.getContent() : hit.getDescription()), hit.getType()));
                    }
                }
                return new Result(List.copyOf(results), "keyword", false, "");
            });
        });
    }

    public Mono<Result> semantic(SearchOption option) {
        return sources(option).map(results -> new Result(results.stream().limit(12)
                .map(hit -> new Hit(hit.getSourceName(), text(hit.getTitle()), hit.getUrl(),
                    excerpt(hit.getContent()), PublicSearchSourceResolver.POST_TYPE)).toList(),
                "semantic", false, ""))
            .flatMap(result -> result.hits().isEmpty()
                ? fallback(option, "知识库未就绪或暂无匹配的公开文章，已显示关键词搜索结果。") : Mono.just(result))
            .onErrorResume(error -> {
                log.warn("Smart semantic search unavailable: {}", error.getClass().getSimpleName());
                return fallback(option, "智能搜索暂时不可用，已显示关键词搜索结果。");
            });
    }

    public Flux<RagChatStreamEvent> answer(SearchOption option) {
        return sources(option)
            .onErrorResume(error -> Mono.just(List.of()))
            .flatMap(sources -> sources.isEmpty() ? haloSearch.search(option)
                .flatMap(result -> publicSources.fromHaloHits(result.getHits(), option)) : Mono.just(sources))
            .flatMapMany(sources -> {
            if (sources.isEmpty()) {
                return Flux.just(RagChatStreamEvent.delta("在已收录的公开文章中没有找到足够依据。请换个说法，或先查看关键词搜索结果。"),
                    RagChatStreamEvent.sources(List.of()), RagChatStreamEvent.done());
            }
            return Mono.zip(settings.getAiConfigForFunction("rag"), settings.getRagConfig())
                .flatMapMany(config -> ai.streamAnswer(option.getKeyword(), sources.stream().limit(8).toList(),
                    config.getT1().getModelName(), config.getT1().getSystemPrompt(),
                    Math.clamp(config.getT2().getMaxContextCharacters() == null ? 12000
                        : config.getT2().getMaxContextCharacters(), 1000, 60000)))
                .concatWithValues(RagChatStreamEvent.done());
        }).onErrorResume(error -> {
            log.warn("Smart search answer failed: {}", error.getClass().getSimpleName());
            return Flux.just(RagChatStreamEvent.error("AI 解答暂时不可用，请稍后重试或查看搜索结果。"));
        });
    }

    private Mono<List<RagSearchResult>> sources(SearchOption option) {
        if (option.getIncludeTypes() != null && !option.getIncludeTypes().isEmpty()
            && !option.getIncludeTypes().contains(PublicSearchSourceResolver.POST_TYPE)) {
            return Mono.just(List.of());
        }
        return ragSearch.searchFiltered(null, option.getKeyword(), 30,
                candidates -> publicSources.filter(candidates, option))
            .timeout(Duration.ofSeconds(25))
            .map(results -> {
                var articles = new LinkedHashMap<String, RagSearchResult>();
                results.forEach(hit -> articles.putIfAbsent(hit.getSourceName(), hit));
                return List.copyOf(articles.values());
            });
    }

    private Mono<Result> fallback(SearchOption option, String message) {
        return keyword(option).map(result -> new Result(result.hits(), "keyword", true, message));
    }

    private String excerpt(String value) {
        var text = text(value);
        return text.length() > 220 ? text.substring(0, 220) + "…" : text;
    }

    private String text(String value) {
        return value == null ? "" : Jsoup.parseBodyFragment(value).text();
    }
}
