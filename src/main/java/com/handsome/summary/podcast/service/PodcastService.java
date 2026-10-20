package com.handsome.summary.podcast.service;

import com.handsome.summary.podcast.audio.PcmAudio;
import com.handsome.summary.podcast.audio.PodcastSpeechProvider;
import com.handsome.summary.podcast.audio.TurnSpeechProvider;
import com.handsome.summary.podcast.extension.ArticlePodcast;
import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import com.handsome.summary.podcast.model.PodcastSettings;
import com.handsome.summary.podcast.model.SpeechExpressionCapabilities;
import com.handsome.summary.reading.service.ArticleReadingContentLoader;
import com.handsome.summary.reading.support.ArticleReadingHash;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.Disposable;
import reactor.core.Disposables;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;
import org.springframework.data.domain.Sort;

@Slf4j
@Service
@RequiredArgsConstructor
public class PodcastService {
    private final PodcastRepository repository;
    private final PodcastConfigService config;
    private final PodcastScriptService scripts;
    private final ArticleReadingContentLoader contentLoader;
    private final PodcastAudioStorage storage;
    private final List<PodcastSpeechProvider> providers;
    private final ReactiveExtensionClient client;
    private final ConcurrentHashMap<String, Disposable.Swap> jobs = new ConcurrentHashMap<>();

    public record EpisodeView(ArticlePodcast episode, boolean stale, boolean audioOutdated) { }
    public record PublicPodcast(String title, ArticlePodcast.Audio audio) { }
    public record Capabilities(boolean enabled, boolean ready, String message, String provider, int durationMinutes,
        String style, SpeechExpressionCapabilities.Controls speech) { }

    public Mono<Capabilities> capabilities() {
        return config.get().map(settings -> {
            String message = "";
            try { validateVoiceSettings(settings); }
            catch (IllegalArgumentException error) { message = error.getMessage(); }
            return new Capabilities(Boolean.TRUE.equals(settings.getEnabled()), message.isBlank(), message,
                settings.getProvider(), settings.getDurationMinutes() == null ? 2 : settings.getDurationMinutes(), settings.getStyle(),
                SpeechExpressionCapabilities.from(settings));
        });
    }

    public Mono<EpisodeView> get(String postName) {
        return contentLoader.load(postName).flatMap(source -> repository.find(postName)
            .map(episode -> new EpisodeView(episode, !source.contentHash().equals(episode.getSpec().getContentHash()),
                episode.getSpec().getAudio() != null && (!source.contentHash().equals(episode.getSpec().getAudio().getContentHash())
                    || !scriptHash(episode.getSpec().getTurns()).equals(episode.getSpec().getAudio().getScriptHash())))))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "这篇文章还没有播客")));
    }

    public Mono<PublicPodcast> published(String postName) {
        return config.get().filter(c -> Boolean.TRUE.equals(c.getEnabled()))
            .flatMap(c -> client.fetch(Post.class, postName))
            .filter(this::publicPost)
            .flatMap(post -> repository.find(postName).filter(episode -> episode.getSpec().getAudio() != null)
                .map(episode -> new PublicPodcast(post.getSpec().getTitle(), episode.getSpec().getAudio())))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "播客尚未发布")));
    }

    public Mono<ArticlePodcast> generateScript(String postName, int minutes, String style) {
        if (minutes < 1 || minutes > 3) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "请选择 1～3 分钟的目标时长"));
        }
        final String normalizedStyle;
        try {
            normalizedStyle = PodcastScriptService.normalizeStyle(style);
        } catch (IllegalArgumentException error) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, error.getMessage()));
        }
        return config.get().flatMap(settings -> {
                if (!Boolean.TRUE.equals(settings.getEnabled())) {
                    return Mono.error(new IllegalArgumentException("请先在设置中启用播客听读"));
                }
                return start(postName, "SCRIPTING", "正在编写双人讨论稿", episode -> contentLoader.load(postName)
                .flatMap(source -> {
                    if (!StringUtils.hasText(source.content())) return Mono.error(new IllegalArgumentException("文章正文为空"));
                    return scripts.generate(source, minutes, normalizedStyle, settings)
                        .flatMap(turns -> repository.update(postName, saved -> {
                            saved.getSpec().setPostTitle(source.title());
                            saved.getSpec().setContentHash(source.contentHash());
                            saved.getSpec().setDurationMinutes(minutes);
                            saved.getSpec().setStyle(normalizedStyle);
                            saved.getSpec().setScriptModelName(settings.getScriptModelName());
                            saved.getSpec().setTurns(turns);
                            phase(saved, "DRAFT", "讨论稿已生成，可编辑后合成音频");
                        }));
                }));
            });
    }

    public Mono<ArticlePodcast> saveScript(String postName, List<Turn> turns) {
        var validated = PodcastScriptService.validate(turns);
        return mutate(postName, () -> repository.find(postName)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "请先生成讨论稿")))
            .flatMap(found -> repository.update(postName, episode -> {
                episode.getSpec().setTurns(validated);
                phase(episode, "DRAFT", "讨论稿已保存");
            })));
    }

    public Mono<ArticlePodcast> render(String postName) {
        return config.get().flatMap(settings -> {
            validateVoiceSettings(settings);
            var provider = providers.stream().filter(p -> p.supports(settings.getProvider())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("不支持的语音服务"));
            return repository.find(postName)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "请先生成并保存讨论稿")))
                .flatMap(existing -> {
                    PodcastScriptService.validate(existing.getSpec().getTurns());
                    TurnSpeechProvider.validate(settings.getProvider(), settings.voiceService(), existing.getSpec().getTurns());
                    return start(postName, "GENERATING", "正在合成两位主持人的声音", episode -> {
                        var turns = PodcastScriptService.validate(episode.getSpec().getTurns());
                        return provider
                        .synthesize(settings.getProvider(), settings.voiceService(), turns, count -> { })
                        .flatMap(result -> storage.save(result.pcm(), settings).flatMap(stored -> repository.update(postName, saved -> {
                            var audio = new ArticlePodcast.Audio();
                            audio.setUrl(stored.url());
                            audio.setAttachmentName(stored.attachmentName());
                            audio.setProvider(settings.getProvider());
                            audio.setModel(settings.voiceService().getModel());
                            audio.setContentHash(episode.getSpec().getContentHash());
                            audio.setScriptHash(scriptHash(turns));
                            audio.setDurationMs(PcmAudio.durationMs(result.pcm().length));
                            audio.setGeneratedAt(Instant.now());
                            audio.setTurns(result.turns());
                            saved.getSpec().setAudio(audio);
                            phase(saved, "READY", "播客已生成，文章页可以收听");
                        })));
                    });
                });
        });
    }

    public Mono<Void> delete(String postName) {
        return mutate(postName, () -> repository.delete(postName).thenReturn(true)).then();
    }

    private Mono<ArticlePodcast> start(String postName, String phase, String message,
        Function<ArticlePodcast, Mono<ArticlePodcast>> work) {
        return Mono.deferContextual(context -> {
            var slot = Disposables.swap();
            if (jobs.putIfAbsent(postName, slot) != null) return busy();
            return repository.update(postName, episode -> phase(episode, phase, message))
                .doOnNext(episode -> slot.update(Mono.defer(() -> work.apply(episode))
                    .timeout(Duration.ofMinutes(8))
                    .doOnError(error -> log.warn("Podcast job failed: post={}, type={}, frames={}", postName,
                        error.getClass().getName(), java.util.Arrays.stream(error.getStackTrace()).limit(8).toList()))
                    .onErrorResume(error -> repository.update(postName, failed -> phase(failed, "FAILED", failureMessage(error))))
                    .doFinally(signal -> jobs.remove(postName, slot))
                    .subscribeOn(Schedulers.boundedElastic())
                    // The independent background subscription still uploads as the requesting user.
                    .contextWrite(context)
                    .subscribe(done -> { }, error -> log.warn("播客任务状态保存失败，文章：{}", postName))))
                .doOnError(error -> { jobs.remove(postName, slot); slot.dispose(); });
        });
    }

    private <T> Mono<T> mutate(String postName, java.util.function.Supplier<Mono<T>> action) {
        return Mono.defer(() -> {
            var slot = Disposables.swap();
            if (jobs.putIfAbsent(postName, slot) != null) return busy();
            return Mono.defer(action).doFinally(signal -> jobs.remove(postName, slot));
        });
    }

    private <T> Mono<T> busy() {
        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "这篇文章有任务正在执行，请稍后重试"));
    }

    public void recoverInterrupted() {
        client.listAll(ArticlePodcast.class, new ListOptions(), Sort.unsorted())
            .filter(episode -> episode.getStatus() != null && Set.of("SCRIPTING", "GENERATING").contains(episode.getStatus().getPhase()))
            .concatMap(episode -> {
                phase(episode, "FAILED", "上次生成因服务重启中断，请手动重试");
                return client.update(episode);
            }).subscribe(done -> { }, error -> log.warn("播客中断任务恢复失败"));
    }

    @PreDestroy
    public void dispose() {
        jobs.values().forEach(Disposable::dispose);
        jobs.clear();
    }

    private boolean publicPost(Post post) {
        return post.getMetadata().getDeletionTimestamp() == null && post.getSpec() != null
            && post.isPublished() && !post.isDeleted() && Post.isPublic(post.getSpec());
    }

    static String scriptHash(List<Turn> turns) {
        return ArticleReadingHash.sha256(turns.stream().map(t -> t.getSpeaker() + ":" + t.getText()
                + (StringUtils.hasText(t.getEmotion()) || StringUtils.hasText(t.getInterjection())
                    ? "|expression:" + (t.getEmotion() == null ? "" : t.getEmotion()) + ":" + (t.getInterjection() == null ? "" : t.getInterjection()) : ""))
            .collect(java.util.stream.Collectors.joining("\n")));
    }

    private void phase(ArticlePodcast episode, String phase, String message) {
        if (episode.getStatus() == null) episode.setStatus(new ArticlePodcast.Status());
        episode.getStatus().setPhase(phase);
        episode.getStatus().setMessage(message);
        episode.getStatus().setUpdatedAt(Instant.now());
    }

    static void validateVoiceSettings(PodcastSettings settings) {
        if (!Boolean.TRUE.equals(settings.getEnabled())) throw new IllegalArgumentException("请先在设置中启用播客听读");
        if (!StringUtils.hasText(settings.getPolicyName())) throw new IllegalArgumentException("请先选择播客音频的附件存储策略");
        var voice = settings.voiceService();
        if (voice == null || !StringUtils.hasText(voice.getApiKey())) throw new IllegalArgumentException("请配置所选语音服务的 API Key");
        if (("bailian".equals(settings.getProvider()) || "bailian-cosyvoice".equals(settings.getProvider()))
            && !StringUtils.hasText(voice.getWorkspaceId())) {
            throw new IllegalArgumentException("请填写百炼北京地域的业务空间 ID");
        }
        if (!StringUtils.hasText(voice.getModel()) || !StringUtils.hasText(voice.getVoiceA()) || !StringUtils.hasText(voice.getVoiceB())
            || voice.getVoiceA().equals(voice.getVoiceB())) throw new IllegalArgumentException("请选择模型与两个不同的音色");
        TurnSpeechProvider.validate(settings.getProvider(), voice, List.of());
    }

    private String failureMessage(Throwable error) {
        if (error instanceof java.util.concurrent.TimeoutException) return "生成超时，讨论稿和原有音频已保留，请重试";
        // Provider responses and credentials never enter the persisted/public job status.
        if (error instanceof IllegalArgumentException || error instanceof IllegalStateException) {
            var message = error.getMessage();
            if (message != null && message.length() < 180 && !message.contains("http") && !message.contains("sk-")) return message;
        }
        return "生成失败，讨论稿和原有音频已保留，请检查模型、语音服务和附件存储配置";
    }
}
