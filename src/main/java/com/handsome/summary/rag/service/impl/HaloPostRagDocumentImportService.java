package com.handsome.summary.rag.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.service.RagContentService;
import com.handsome.summary.rag.service.RagDocumentImportService;
import com.handsome.summary.rag.service.RagIndexService;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.content.ContentWrapper;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class HaloPostRagDocumentImportService implements RagDocumentImportService {

    private static final String SOURCE_TYPE_POST = "POST";

    private final ReactiveExtensionClient client;
    private final PostContentService postContentService;
    private final RagContentService ragContentService;
    private final RagIndexService ragIndexService;

    @Override
    public Mono<Integer> importPublishedPosts(String knowledgeBase, List<String> postNames) {
        var kbName = normalizeKnowledgeBase(knowledgeBase);
        var posts = postNames == null || postNames.isEmpty()
            ? listAllPublishedPosts()
            : Flux.fromIterable(postNames)
                .flatMap(name -> client.fetch(Post.class, name))
                .filter(this::canImport);
        return ragIndexService.ensureKnowledgeBase(kbName)
            .thenMany(posts)
            .flatMap(post -> toRagDocument(kbName, post))
            .flatMap(this::upsert)
            .count()
            .map(Long::intValue);
    }

    private Flux<Post> listAllPublishedPosts() {
        return client.listAll(Post.class, ListOptions.builder().build(), Sort.unsorted())
            .filter(this::canImport);
    }

    private boolean canImport(Post post) {
        return post != null
            && post.getSpec() != null
            && post.isPublished()
            && !post.isDeleted()
            && Post.isPublic(post.getSpec());
    }

    private Mono<RagDocument> toRagDocument(String knowledgeBase, Post post) {
        var postName = post.getMetadata().getName();
        return postContentService.getReleaseContent(postName)
            .map(this::contentText)
            .defaultIfEmpty("")
            .map(content -> {
                var normalizedContent = ragContentService.normalize(content);
                var document = new RagDocument();
                var metadata = new Metadata();
                metadata.setName(documentName(knowledgeBase, SOURCE_TYPE_POST, postName));
                document.setMetadata(metadata);

                var spec = new RagDocument.Spec();
                spec.setKnowledgeBase(knowledgeBase);
                spec.setSourceType(SOURCE_TYPE_POST);
                spec.setSourceName(postName);
                spec.setTitle(post.getSpec().getTitle());
                spec.setUrl(post.getStatus() == null ? null : post.getStatus().getPermalink());
                spec.setContent(normalizedContent);
                spec.setContentHash(ragContentService.hash(normalizedContent));
                spec.setEnabled(StringUtils.hasText(normalizedContent));
                spec.setTags(post.getSpec().getTags());
                spec.setCategories(post.getSpec().getCategories());
                document.setSpec(spec);

                var status = new RagDocument.Status();
                status.setLastImportedAt(Instant.now());
                document.setStatus(status);
                return document;
            });
    }

    private String contentText(ContentWrapper wrapper) {
        if (wrapper == null) {
            return "";
        }
        if (StringUtils.hasText(wrapper.getContent())) {
            return wrapper.getContent();
        }
        return wrapper.getRaw();
    }

    private Mono<RagDocument> upsert(RagDocument document) {
        var name = document.getMetadata().getName();
        return client.fetch(RagDocument.class, name)
            .flatMap(existing -> {
                existing.setSpec(document.getSpec());
                var status = existing.getStatus() == null ? new RagDocument.Status()
                    : existing.getStatus();
                status.setLastImportedAt(Instant.now());
                status.setErrorMessage(null);
                existing.setStatus(status);
                return client.update(existing);
            })
            .switchIfEmpty(Mono.defer(() -> client.create(document)));
    }

    private String documentName(String knowledgeBase, String sourceType, String sourceName) {
        var hash = ragContentService.hash(knowledgeBase + ":" + sourceType + ":" + sourceName);
        return "ragdoc-" + hash.substring(0, 24);
    }

    private String normalizeKnowledgeBase(String knowledgeBase) {
        return StringUtils.hasText(knowledgeBase) ? knowledgeBase.strip()
            : RagIndexService.DEFAULT_KNOWLEDGE_BASE;
    }
}
