package com.handsome.summary.rag.endpoint;

import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;
import static org.springdoc.core.fn.builders.parameter.Builder.parameterBuilder;
import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.rag.extension.RagIndexTask;
import com.handsome.summary.rag.extension.RagConversation;
import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagIndexSummary;
import com.handsome.summary.rag.model.RagSearchResult;
import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.rag.service.DocsmeDocumentSourceService;
import com.handsome.summary.rag.service.RagContentService;
import com.handsome.summary.rag.service.RagConversationService;
import com.handsome.summary.rag.service.RagDocumentImportService;
import com.handsome.summary.rag.service.RagIndexService;
import com.handsome.summary.rag.service.RagIndexTaskService;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.rag.store.RagVectorStore;
import com.handsome.summary.service.AiRequestSecurityService;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Sort;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class RagEndpoint implements CustomEndpoint {

    private final AiRequestSecurityService aiRequestSecurityService;
    private final ReactiveExtensionClient client;
    private final DocsmeDocumentSourceService docsmeDocumentSourceService;
    private final RagContentService ragContentService;
    private final RagConversationService ragConversationService;
    private final RagDocumentImportService ragDocumentImportService;
    private final RagIndexService ragIndexService;
    private final RagIndexTaskService ragIndexTaskService;
    private final RagSearchService ragSearchService;
    private final RagVectorStore ragVectorStore;

    public record ImportPostsRequest(String knowledgeBase, List<String> postNames,
                                     Boolean rebuildAfterImport) {
    }

    public record ImportDocsmeDocumentsRequest(String knowledgeBase, List<String> docNames,
                                               Boolean rebuildAfterImport) {
    }

    public record ImportPostsResponse(String knowledgeBase, int imported,
                                      RagIndexSummary summary, RagIndexTask task) {
    }

    public record ImportDocsmeDocumentsResponse(String knowledgeBase, int imported,
                                                RagIndexSummary summary, RagIndexTask task) {
    }

    public record RebuildRequest(String knowledgeBase) {
    }

    public record IndexDocumentsRequest(String knowledgeBase, List<String> documentNames) {
    }

    public record RebuildResponse(String knowledgeBase, RagIndexSummary summary) {
    }

    public record RebuildTaskResponse(String knowledgeBase, RagIndexTask task) {
    }

    public record SearchRequest(String knowledgeBase, String query, Integer limit) {
    }

    public record SearchResponse(List<RagSearchResult> results) {
    }

    public record AskRequest(String knowledgeBase, String question, Integer limit,
                             String conversationId, String visitorId) {
    }

    public record AskResponse(String answer, List<?> sources, String conversationId) {
        static AskResponse from(RagAnswer answer) {
            return new AskResponse(answer.getAnswer(), answer.getSources(),
                answer.getConversationId());
        }
    }

    public record SaveKnowledgeBaseRequest(
        String name,
        String displayName,
        String description,
        Boolean enabled,
        List<String> sourceTypes
    ) {
    }

    public record KnowledgeBaseResponse(List<RagKnowledgeBase> items) {
    }

    public record SaveDocumentRequest(
        String name,
        String knowledgeBase,
        String sourceType,
        String sourceName,
        String title,
        String url,
        String content,
        Boolean enabled,
        List<String> tags,
        List<String> categories
    ) {
    }

    public record DocumentResponse(List<RagDocument> items) {
    }

    public record IndexTaskResponse(List<RagIndexTask> items) {
    }

    public record ConversationResponse(List<RagConversation> items, int page, int size, int total) {
        static ConversationResponse from(RagConversationService.ConversationPage page) {
            return new ConversationResponse(page.items(), page.page(), page.size(), page.total());
        }
    }

    public record ImportablePostResponse(List<ImportablePost> items) {
    }

    public record ImportableDocsmeDocumentResponse(List<ImportableDocsmeDocument> items,
                                                   boolean docsmeAvailable) {
    }

    public record ImportablePost(
        String postName,
        String title,
        String url,
        boolean imported,
        String documentName,
        Instant lastImportedAt,
        Integer chunkCount
    ) {
    }

    public record ImportableDocsmeDocument(
        String docName,
        String docTreeName,
        String title,
        String url,
        String projectName,
        String projectDisplayName,
        String versionName,
        String versionSlug,
        boolean imported,
        String documentName,
        Instant lastImportedAt,
        Integer chunkCount
    ) {
    }

    public record RagStatsResponse(
        String knowledgeBase,
        int totalDocuments,
        int enabledDocuments,
        int disabledDocuments,
        int postDocuments,
        int manualDocuments,
        int docsmeDocuments,
        int chunkCount,
        int staleDocuments,
        boolean needsRebuild
    ) {
    }

    public record BatchDocumentsRequest(List<String> names, Boolean rebuildAfterMutation) {
    }

    public record UpdateDocumentStatusRequest(Boolean enabled, Boolean rebuildAfterMutation) {
    }

    public record BatchDocumentsResponse(int affected, RagIndexSummary summary) {
    }

    public record DocumentMutationResponse(RagDocument document, RagIndexSummary summary) {
    }

    public record MutationResponse(boolean success, String message) {
    }

    public record ErrorResponse(boolean success, String message) {
    }

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        final var tag = "api.summary.summaraidgpt.lik.cc/v1alpha1/RAG";

        return SpringdocRouteBuilder.route()
            .GET("ragKnowledgeBases", this::listKnowledgeBases,
                builder -> builder.operationId("ListRagKnowledgeBases")
                    .tag(tag)
                    .description("List RAG knowledge bases.")
                    .response(responseBuilder().implementation(KnowledgeBaseResponse.class))
            )
            .POST("ragKnowledgeBases", this::saveKnowledgeBase,
                builder -> builder.operationId("SaveRagKnowledgeBase")
                    .tag(tag)
                    .description("Create or update a RAG knowledge base.")
                    .response(responseBuilder().implementation(RagKnowledgeBase.class))
            )
            .DELETE("ragKnowledgeBases/{name}", this::deleteKnowledgeBase,
                builder -> builder.operationId("DeleteRagKnowledgeBase")
                    .tag(tag)
                    .description("Delete a RAG knowledge base and its documents.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(MutationResponse.class))
            )
            .GET("ragDocuments", this::listDocuments,
                builder -> builder.operationId("ListRagDocuments")
                    .tag(tag)
                    .description("List RAG documents.")
                    .response(responseBuilder().implementation(DocumentResponse.class))
            )
            .GET("ragStats", this::stats,
                builder -> builder.operationId("RagStats")
                    .tag(tag)
                    .description("Get RAG knowledge base statistics.")
                    .response(responseBuilder().implementation(RagStatsResponse.class))
            )
            .GET("ragImportablePosts", this::listImportablePosts,
                builder -> builder.operationId("ListRagImportablePosts")
                    .tag(tag)
                    .description("List published public posts that can be imported into RAG.")
                    .response(responseBuilder().implementation(ImportablePostResponse.class))
            )
            .GET("ragImportableDocsmeDocuments", this::listImportableDocsmeDocuments,
                builder -> builder.operationId("ListRagImportableDocsmeDocuments")
                    .tag(tag)
                    .description("List published Docsme documents that can be imported into RAG.")
                    .response(responseBuilder().implementation(ImportableDocsmeDocumentResponse.class))
            )
            .POST("ragDocuments", this::saveDocument,
                builder -> builder.operationId("SaveRagDocument")
                    .tag(tag)
                    .description("Create or update a manual RAG document.")
                    .response(responseBuilder().implementation(RagDocument.class))
            )
            .POST("ragDocumentsBatchDelete", this::batchDeleteDocuments,
                builder -> builder.operationId("BatchDeleteRagDocuments")
                    .tag(tag)
                    .description("Batch delete RAG documents.")
                    .response(responseBuilder().implementation(BatchDocumentsResponse.class))
            )
            .POST("ragDocuments/{name}/status", this::updateDocumentStatus,
                builder -> builder.operationId("UpdateRagDocumentStatus")
                    .tag(tag)
                    .description("Enable or disable a RAG document.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(DocumentMutationResponse.class))
            )
            .DELETE("ragDocuments/{name}", this::deleteDocument,
                builder -> builder.operationId("DeleteRagDocument")
                    .tag(tag)
                    .description("Delete a RAG document.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(MutationResponse.class))
            )
            .POST("ragImportPosts", this::importPosts,
                builder -> builder.operationId("RagImportPosts")
                    .tag(tag)
                    .description("Import published public posts into the RAG document store.")
                    .response(responseBuilder().implementation(ImportPostsResponse.class))
            )
            .POST("ragImportDocsmeDocuments", this::importDocsmeDocuments,
                builder -> builder.operationId("RagImportDocsmeDocuments")
                    .tag(tag)
                    .description("Import published Docsme documents into the RAG document store.")
                    .response(responseBuilder().implementation(ImportDocsmeDocumentsResponse.class))
            )
            .POST("ragRebuild", this::rebuild,
                builder -> builder.operationId("RagRebuild")
                    .tag(tag)
                    .description("Start a RAG index rebuild task.")
                    .response(responseBuilder().implementation(RebuildTaskResponse.class))
            )
            .POST("ragForceRebuild", this::forceRebuild,
                builder -> builder.operationId("RagForceRebuild")
                    .tag(tag)
                    .description("Force stop the current RAG index task and start a full rebuild.")
                    .response(responseBuilder().implementation(RebuildTaskResponse.class))
            )
            .POST("ragStopIndexTask", this::stopIndexTask,
                builder -> builder.operationId("RagStopIndexTask")
                    .tag(tag)
                    .description("Force stop the current RAG index task.")
                    .response(responseBuilder().implementation(RebuildTaskResponse.class))
            )
            .POST("ragIndexDocuments", this::indexDocuments,
                builder -> builder.operationId("RagIndexDocuments")
                    .tag(tag)
                    .description("Start an incremental RAG document index task.")
                    .response(responseBuilder().implementation(RebuildTaskResponse.class))
            )
            .POST("ragRebuildNow", this::rebuildNow,
                builder -> builder.operationId("RagRebuildNow")
                    .tag(tag)
                    .description("Synchronously rebuild the local Lucene RAG index.")
                    .response(responseBuilder().implementation(RebuildResponse.class))
            )
            .GET("ragIndexTasks", this::listIndexTasks,
                builder -> builder.operationId("ListRagIndexTasks")
                    .tag(tag)
                    .description("List RAG index tasks.")
                    .response(responseBuilder().implementation(IndexTaskResponse.class))
            )
            .GET("ragIndexTasks/latest", this::latestIndexTask,
                builder -> builder.operationId("LatestRagIndexTask")
                    .tag(tag)
                    .description("Get latest RAG index task.")
                    .response(responseBuilder().implementation(RagIndexTask.class))
            )
            .GET("ragIndexTasks/{name}/subscribe", this::subscribeIndexTask,
                builder -> builder.operationId("SubscribeRagIndexTask")
                    .tag(tag)
                    .description("Subscribe RAG index task progress.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(RagIndexTask.class))
            )
            .GET("ragConversations", this::listConversations,
                builder -> builder.operationId("ListRagConversations")
                    .tag(tag)
                    .description("List RAG conversations.")
                    .response(responseBuilder().implementation(ConversationResponse.class))
            )
            .GET("ragConversations/{name}", this::getConversation,
                builder -> builder.operationId("GetRagConversation")
                    .tag(tag)
                    .description("Get a RAG conversation.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(RagConversation.class))
            )
            .DELETE("ragConversations/{name}", this::deleteConversation,
                builder -> builder.operationId("DeleteRagConversation")
                    .tag(tag)
                    .description("Delete a RAG conversation.")
                    .parameter(parameterBuilder().name("name").in(ParameterIn.PATH).required(true)
                        .implementation(String.class))
                    .response(responseBuilder().implementation(MutationResponse.class))
            )
            .POST("ragSearch", this::search,
                builder -> builder.operationId("RagSearch")
                    .tag(tag)
                    .description("Search the RAG knowledge base.")
                    .response(responseBuilder().implementation(SearchResponse.class))
            )
            .POST("ragAsk", this::ask,
                builder -> builder.operationId("RagAsk")
                    .tag(tag)
                    .description("Ask a question using RAG.")
                    .response(responseBuilder().implementation(AskResponse.class))
            )
            .POST("ragAskStream", this::askStream,
                builder -> builder.operationId("RagAskStream")
                    .tag(tag)
                    .description("Ask a question using RAG and stream answer deltas.")
                    .response(responseBuilder().implementation(RagChatStreamEvent.class))
            )
            .build();
    }

    private Mono<ServerResponse> listKnowledgeBases(ServerRequest request) {
        return ragIndexService.ensureKnowledgeBase(RagIndexService.DEFAULT_KNOWLEDGE_BASE)
            .thenMany(client.listAll(RagKnowledgeBase.class, ListOptions.builder().build(), Sort.unsorted()))
            .sort(Comparator.comparing(kb -> defaultString(kb.getMetadata().getName())))
            .collectList()
            .map(KnowledgeBaseResponse::new)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> saveKnowledgeBase(ServerRequest request) {
        return request.bodyToMono(SaveKnowledgeBaseRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Knowledge base request body is required")))
            .flatMap(this::upsertKnowledgeBase)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> deleteKnowledgeBase(ServerRequest request) {
        var name = request.pathVariable("name");
        return client.fetch(RagKnowledgeBase.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Knowledge base not found")))
            .flatMap(kb -> listDocumentsByKnowledgeBase(name)
                .flatMap(client::delete)
                .then(ragVectorStore.clear(name))
                .then(client.delete(kb)))
            .then(ok(new MutationResponse(true, "知识库已删除")))
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> listDocuments(ServerRequest request) {
        var knowledgeBase = request.queryParam("knowledgeBase").orElse(null);
        var keyword = request.queryParam("keyword").orElse(null);
        var sourceType = request.queryParam("sourceType").orElse(null);
        return listDocumentsByKnowledgeBase(normalizeKnowledgeBase(knowledgeBase))
            .filter(document -> matchesDocument(document, keyword, sourceType))
            .sort(Comparator.comparing(document -> defaultString(document.getSpec() == null
                ? null : document.getSpec().getTitle())))
            .collectList()
            .map(DocumentResponse::new)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> stats(ServerRequest request) {
        var knowledgeBase = normalizeKnowledgeBase(request.queryParam("knowledgeBase").orElse(null));
        return listDocumentsByKnowledgeBase(knowledgeBase)
            .collectList()
            .map(documents -> {
                var enabledDocuments = (int) documents.stream().filter(this::documentEnabled).count();
                var postDocuments = (int) documents.stream()
                    .filter(document -> hasSourceType(document, "POST"))
                    .count();
                var manualDocuments = (int) documents.stream()
                    .filter(document -> hasSourceType(document, "MANUAL"))
                    .count();
                var docsmeDocuments = (int) documents.stream()
                    .filter(document -> hasSourceType(document, "DOCSME"))
                    .count();
                var chunkCount = documents.stream()
                    .map(RagDocument::getStatus)
                    .map(status -> status == null || status.getChunkCount() == null
                        ? 0 : status.getChunkCount())
                    .reduce(0, Integer::sum);
                var staleDocuments = (int) documents.stream()
                    .filter(this::needsIndex)
                    .count();
                return new RagStatsResponse(knowledgeBase, documents.size(), enabledDocuments,
                    documents.size() - enabledDocuments, postDocuments, manualDocuments,
                    docsmeDocuments, chunkCount, staleDocuments, staleDocuments > 0);
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> listImportablePosts(ServerRequest request) {
        var knowledgeBase = normalizeKnowledgeBase(request.queryParam("knowledgeBase").orElse(null));
        var keyword = request.queryParam("keyword").orElse(null);
        return Mono.zip(
                listPublishedPublicPosts(keyword).collectList(),
                listDocumentsByKnowledgeBase(knowledgeBase)
                    .filter(document -> hasSourceType(document, "POST"))
                    .collectMap(document -> document.getSpec().getSourceName())
            )
            .map(tuple -> {
                var documentsByPostName = tuple.getT2();
                var items = tuple.getT1().stream()
                    .map(post -> toImportablePost(knowledgeBase, post, documentsByPostName))
                    .toList();
                return new ImportablePostResponse(items);
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> listImportableDocsmeDocuments(ServerRequest request) {
        var knowledgeBase = normalizeKnowledgeBase(request.queryParam("knowledgeBase").orElse(null));
        var keyword = request.queryParam("keyword").orElse(null);
        return Mono.zip(
                docsmeDocumentSourceService.isAvailable(),
                docsmeDocumentSourceService.listPublished(keyword).collectList(),
                listDocumentsByKnowledgeBase(knowledgeBase)
                    .filter(document -> hasSourceType(document, "DOCSME"))
                    .collectMap(document -> document.getSpec().getSourceName())
            )
            .map(tuple -> {
                var documentsByDocName = tuple.getT3();
                var items = tuple.getT2().stream()
                    .map(document -> toImportableDocsmeDocument(knowledgeBase, document,
                        documentsByDocName))
                    .toList();
                return new ImportableDocsmeDocumentResponse(items, tuple.getT1());
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> saveDocument(ServerRequest request) {
        return request.bodyToMono(SaveDocumentRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Document request body is required")))
            .flatMap(this::upsertDocument)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> deleteDocument(ServerRequest request) {
        var name = request.pathVariable("name");
        return client.fetch(RagDocument.class, name)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Document not found")))
            .flatMap(client::delete)
            .then(ok(new MutationResponse(true, "文档已删除，请重建索引以同步生效")))
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> batchDeleteDocuments(ServerRequest request) {
        return request.bodyToMono(BatchDocumentsRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Batch delete request body is required")))
            .flatMap(body -> {
                var names = normalizedNames(body.names());
                if (names.isEmpty()) {
                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "names must not be empty"));
                }
                return Flux.fromIterable(names)
                    .flatMap(name -> client.fetch(RagDocument.class, name))
                    .collectList()
                    .flatMap(documents -> {
                        if (documents.isEmpty()) {
                            return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "No documents found"));
                        }
                        var knowledgeBase = documents.stream()
                            .map(RagDocument::getSpec)
                            .filter(spec -> spec != null && StringUtils.hasText(spec.getKnowledgeBase()))
                            .map(RagDocument.Spec::getKnowledgeBase)
                            .findFirst()
                            .orElse(RagIndexService.DEFAULT_KNOWLEDGE_BASE);
                        return Flux.fromIterable(documents)
                            .flatMap(client::delete)
                            .count()
                            .flatMap(affected -> rebuildIfRequested(request, knowledgeBase,
                                body.rebuildAfterMutation())
                                .map(summary -> new BatchDocumentsResponse(affected.intValue(),
                                    summary))
                                .defaultIfEmpty(new BatchDocumentsResponse(affected.intValue(),
                                    null)));
                    });
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> updateDocumentStatus(ServerRequest request) {
        var name = request.pathVariable("name");
        return request.bodyToMono(UpdateDocumentStatusRequest.class)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Document status request body is required")))
            .flatMap(body -> client.fetch(RagDocument.class, name)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Document not found")))
                .flatMap(document -> {
                    if (document.getSpec() == null) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Document spec is empty"));
                    }
                    document.getSpec().setEnabled(enabled(body.enabled(), true));
                    var knowledgeBase = normalizeKnowledgeBase(document.getSpec().getKnowledgeBase());
                    return client.update(document)
                        .flatMap(updated -> rebuildIfRequested(request, knowledgeBase,
                            body.rebuildAfterMutation())
                            .map(summary -> new DocumentMutationResponse(updated, summary))
                            .defaultIfEmpty(new DocumentMutationResponse(updated, null)));
                }))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> importPosts(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(ImportPostsRequest.class)
                .defaultIfEmpty(new ImportPostsRequest(null, List.of(), false)))
            .flatMap(body -> {
                var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
                return ragDocumentImportService.importPublishedPosts(knowledgeBase, body.postNames())
                    .flatMap(importResult -> {
                        if (enabled(body.rebuildAfterImport(), false)) {
                            return ragIndexTaskService.startDocumentRebuild(knowledgeBase,
                                    importResult.documentNames())
                                .map(task -> new ImportPostsResponse(knowledgeBase,
                                    importResult.imported(), null, task));
                        }
                        return Mono.just(new ImportPostsResponse(knowledgeBase,
                            importResult.imported(), null, null));
                    });
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> importDocsmeDocuments(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(ImportDocsmeDocumentsRequest.class)
                .defaultIfEmpty(new ImportDocsmeDocumentsRequest(null, List.of(), false)))
            .flatMap(body -> {
                var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
                return ragDocumentImportService.importPublishedDocsmeDocuments(knowledgeBase,
                        body.docNames())
                    .flatMap(importResult -> {
                        if (enabled(body.rebuildAfterImport(), false)) {
                            return ragIndexTaskService.startDocumentRebuild(knowledgeBase,
                                    importResult.documentNames())
                                .map(task -> new ImportDocsmeDocumentsResponse(knowledgeBase,
                                    importResult.imported(), null, task));
                        }
                        return Mono.just(new ImportDocsmeDocumentsResponse(knowledgeBase,
                            importResult.imported(), null, null));
                    });
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> rebuild(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(RebuildRequest.class)
                .defaultIfEmpty(new RebuildRequest(null)))
            .flatMap(body -> {
                var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
                return ragIndexTaskService.startFullRebuild(knowledgeBase)
                    .map(task -> new RebuildTaskResponse(knowledgeBase, task));
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> forceRebuild(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(RebuildRequest.class)
                .defaultIfEmpty(new RebuildRequest(null)))
            .flatMap(body -> {
                var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
                return ragIndexTaskService.forceFullRebuild(knowledgeBase)
                    .map(task -> new RebuildTaskResponse(knowledgeBase, task));
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> stopIndexTask(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(RebuildRequest.class)
                .defaultIfEmpty(new RebuildRequest(null)))
            .flatMap(body -> {
                var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
                return ragIndexTaskService.forceStop(knowledgeBase)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No running RAG index task")))
                    .map(task -> new RebuildTaskResponse(knowledgeBase, task));
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> indexDocuments(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(IndexDocumentsRequest.class)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Index documents request body is required"))))
            .flatMap(body -> {
                var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
                var documentNames = normalizedNames(body.documentNames());
                if (documentNames.isEmpty()) {
                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "documentNames must not be empty"));
                }
                return ragIndexTaskService.startDocumentRebuild(knowledgeBase, documentNames)
                    .map(task -> new RebuildTaskResponse(knowledgeBase, task));
            })
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> rebuildNow(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(RebuildRequest.class)
                .defaultIfEmpty(new RebuildRequest(null)))
            .flatMap(body -> ragIndexService.rebuild(normalizeKnowledgeBase(body.knowledgeBase()))
                .map(summary -> new RebuildResponse(normalizeKnowledgeBase(body.knowledgeBase()),
                    summary)))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> listIndexTasks(ServerRequest request) {
        var knowledgeBase = normalizeKnowledgeBase(request.queryParam("knowledgeBase").orElse(null));
        var limit = request.queryParam("limit")
            .map(this::parseLimit)
            .orElse(20);
        return ragIndexTaskService.list(knowledgeBase, limit)
            .collectList()
            .map(IndexTaskResponse::new)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> latestIndexTask(ServerRequest request) {
        var knowledgeBase = normalizeKnowledgeBase(request.queryParam("knowledgeBase").orElse(null));
        return ragIndexTaskService.latest(knowledgeBase)
            .flatMap(this::ok)
            .switchIfEmpty(ServerResponse.noContent().build())
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> subscribeIndexTask(ServerRequest request) {
        var name = request.pathVariable("name");
        var taskEvents = Flux.interval(Duration.ZERO, Duration.ofSeconds(1))
            .flatMap(tick -> ragIndexTaskService.get(name))
            .takeUntil(this::taskFinished)
            .map(task -> ServerSentEvent.builder(task)
                .event("task")
                .id(task.getMetadata().getName())
                .build());
        return ServerResponse.ok()
            .contentType(MediaType.TEXT_EVENT_STREAM)
            .body(taskEvents, ServerSentEvent.class);
    }

    private Mono<ServerResponse> listConversations(ServerRequest request) {
        var knowledgeBase = request.queryParam("knowledgeBase").orElse(null);
        var keyword = request.queryParam("keyword").orElse(null);
        var page = request.queryParam("page")
            .map(this::parsePage)
            .orElse(1);
        var size = request.queryParam("size")
            .or(() -> request.queryParam("limit"))
            .map(this::parseLimit)
            .orElse(20);
        return ragConversationService.list(knowledgeBase, keyword, page, size)
            .map(ConversationResponse::from)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> getConversation(ServerRequest request) {
        var visitorId = request.queryParam("visitorId").orElse(null);
        return aiRequestSecurityService.secure(request)
            .then(ragConversationService.getForVisitor(request.pathVariable("name"), visitorId))
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> deleteConversation(ServerRequest request) {
        return ragConversationService.delete(request.pathVariable("name"))
            .then(ok(new MutationResponse(true, "会话记录已删除")))
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> search(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(SearchRequest.class))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Search request body is required")))
            .flatMap(body -> {
                if (!StringUtils.hasText(body.query())) {
                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "query must not be empty"));
                }
                return ragSearchService.search(body.knowledgeBase(), body.query(), body.limit());
            })
            .map(SearchResponse::new)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> ask(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(AskRequest.class))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Ask request body is required")))
            .flatMap(body -> {
                if (!StringUtils.hasText(body.question())) {
                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "question must not be empty"));
                }
                return ragConversationService.ask(body.knowledgeBase(), body.conversationId(),
                    body.visitorId(), userAgent(request), body.question(), body.limit());
            })
            .map(AskResponse::from)
            .flatMap(this::ok)
            .onErrorResume(this::errorResponse);
    }

    private Mono<ServerResponse> askStream(ServerRequest request) {
        return aiRequestSecurityService.secure(request)
            .then(request.bodyToMono(AskRequest.class))
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Ask request body is required")))
            .flatMap(body -> {
                if (!StringUtils.hasText(body.question())) {
                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "question must not be empty"));
                }
                var stream = ragConversationService.stream(body.knowledgeBase(),
                        body.conversationId(), body.visitorId(), userAgent(request),
                        body.question(), body.limit())
                    .map(event -> ServerSentEvent.builder(event)
                        .event(event.getType())
                        .build());
                return ServerResponse.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(stream, ServerSentEvent.class);
            })
            .onErrorResume(this::errorResponse);
    }

    private Mono<RagKnowledgeBase> upsertKnowledgeBase(SaveKnowledgeBaseRequest body) {
        var name = normalizeResourceName(body.name());
        if (!StringUtils.hasText(name)) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "name must not be empty"));
        }
        return client.fetch(RagKnowledgeBase.class, name)
            .flatMap(existing -> {
                existing.setSpec(toKnowledgeBaseSpec(body));
                return client.update(existing);
            })
            .switchIfEmpty(Mono.defer(() -> {
                var kb = new RagKnowledgeBase();
                var metadata = new Metadata();
                metadata.setName(name);
                kb.setMetadata(metadata);
                kb.setSpec(toKnowledgeBaseSpec(body));
                kb.setStatus(new RagKnowledgeBase.Status());
                return client.create(kb);
            }));
    }

    private RagKnowledgeBase.Spec toKnowledgeBaseSpec(SaveKnowledgeBaseRequest body) {
        var spec = new RagKnowledgeBase.Spec();
        spec.setDisplayName(StringUtils.hasText(body.displayName()) ? body.displayName().strip()
            : body.name());
        spec.setDescription(body.description());
        spec.setEnabled(body.enabled() == null || body.enabled());
        spec.setSourceTypes(body.sourceTypes() == null || body.sourceTypes().isEmpty()
            ? List.of("POST", "MANUAL", "DOCSME")
            : body.sourceTypes());
        return spec;
    }

    private Mono<RagDocument> upsertDocument(SaveDocumentRequest body) {
        var knowledgeBase = normalizeKnowledgeBase(body.knowledgeBase());
        if (!StringUtils.hasText(body.title()) || !StringUtils.hasText(body.content())) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "title and content must not be empty"));
        }
        return ragIndexService.ensureKnowledgeBase(knowledgeBase)
            .then(Mono.defer(() -> {
                var name = StringUtils.hasText(body.name()) ? body.name().strip()
                    : documentName(knowledgeBase, defaultString(body.sourceType()), body.title());
                return client.fetch(RagDocument.class, name)
                    .flatMap(existing -> {
                        existing.setSpec(toDocumentSpec(body, knowledgeBase));
                        var status = existing.getStatus() == null ? new RagDocument.Status()
                            : existing.getStatus();
                        status.setLastImportedAt(Instant.now());
                        status.setErrorMessage(null);
                        existing.setStatus(status);
                        return client.update(existing);
                    })
                    .switchIfEmpty(Mono.defer(() -> {
                        var document = new RagDocument();
                        var metadata = new Metadata();
                        metadata.setName(name);
                        document.setMetadata(metadata);
                        document.setSpec(toDocumentSpec(body, knowledgeBase));
                        var status = new RagDocument.Status();
                        status.setLastImportedAt(Instant.now());
                        document.setStatus(status);
                        return client.create(document);
                    }));
            }));
    }

    private RagDocument.Spec toDocumentSpec(SaveDocumentRequest body, String knowledgeBase) {
        var normalizedContent = ragContentService.normalize(body.content());
        var spec = new RagDocument.Spec();
        spec.setKnowledgeBase(knowledgeBase);
        spec.setSourceType(StringUtils.hasText(body.sourceType()) ? body.sourceType().strip() : "MANUAL");
        spec.setSourceName(StringUtils.hasText(body.sourceName()) ? body.sourceName().strip()
            : documentName(knowledgeBase, spec.getSourceType(), body.title()));
        spec.setTitle(body.title().strip());
        spec.setUrl(body.url());
        spec.setContent(normalizedContent);
        spec.setContentHash(ragContentService.hash(normalizedContent));
        spec.setEnabled(body.enabled() == null || body.enabled());
        spec.setTags(body.tags() == null ? List.of() : body.tags());
        spec.setCategories(body.categories() == null ? List.of() : body.categories());
        return spec;
    }

    private Flux<RagDocument> listDocumentsByKnowledgeBase(String knowledgeBase) {
        var options = ListOptions.builder()
            .fieldQuery(equal("spec.knowledgeBase", normalizeKnowledgeBase(knowledgeBase)))
            .build();
        return client.listAll(RagDocument.class, options, Sort.unsorted());
    }

    private Flux<Post> listPublishedPublicPosts(String keyword) {
        return client.listAll(Post.class, ListOptions.builder().build(), Sort.unsorted())
            .filter(this::canImportPost)
            .filter(post -> matchesPost(post, keyword))
            .sort(Comparator.comparing(post -> defaultString(post.getSpec() == null
                ? null : post.getSpec().getTitle())));
    }

    private boolean canImportPost(Post post) {
        return post != null
            && post.getSpec() != null
            && post.isPublished()
            && !post.isDeleted()
            && Post.isPublic(post.getSpec());
    }

    private boolean matchesPost(Post post, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        var lowerKeyword = keyword.toLowerCase(Locale.ROOT);
        return defaultString(post.getMetadata().getName()).toLowerCase(Locale.ROOT)
            .contains(lowerKeyword)
            || defaultString(post.getSpec().getTitle()).toLowerCase(Locale.ROOT)
                .contains(lowerKeyword);
    }

    private ImportablePost toImportablePost(String knowledgeBase, Post post,
        Map<String, RagDocument> documentsByPostName) {
        var postName = post.getMetadata().getName();
        var document = documentsByPostName.get(postName);
        var status = document == null ? null : document.getStatus();
        return new ImportablePost(
            postName,
            post.getSpec().getTitle(),
            post.getStatus() == null ? null : post.getStatus().getPermalink(),
            document != null,
            document == null ? documentName(knowledgeBase, "POST", postName)
                : document.getMetadata().getName(),
            status == null ? null : status.getLastImportedAt(),
            status == null ? null : status.getChunkCount()
        );
    }

    private ImportableDocsmeDocument toImportableDocsmeDocument(String knowledgeBase,
        DocsmeDocumentSourceService.DocsmeDocument source,
        Map<String, RagDocument> documentsByDocName) {
        var document = documentsByDocName.get(source.docName());
        var status = document == null ? null : document.getStatus();
        return new ImportableDocsmeDocument(
            source.docName(),
            source.docTreeName(),
            source.title(),
            source.url(),
            source.projectName(),
            source.projectDisplayName(),
            source.versionName(),
            source.versionSlug(),
            document != null,
            document == null ? documentName(knowledgeBase, "DOCSME", source.docName())
                : document.getMetadata().getName(),
            status == null ? null : status.getLastImportedAt(),
            status == null ? null : status.getChunkCount()
        );
    }

    private boolean matchesDocument(RagDocument document, String keyword, String sourceType) {
        if (document == null || document.getSpec() == null) {
            return false;
        }
        var spec = document.getSpec();
        if (StringUtils.hasText(sourceType)
            && !sourceType.equalsIgnoreCase(defaultString(spec.getSourceType()))) {
            return false;
        }
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        var lowerKeyword = keyword.toLowerCase(Locale.ROOT);
        return defaultString(spec.getTitle()).toLowerCase(Locale.ROOT).contains(lowerKeyword)
            || defaultString(spec.getContent()).toLowerCase(Locale.ROOT).contains(lowerKeyword)
            || defaultString(spec.getSourceName()).toLowerCase(Locale.ROOT).contains(lowerKeyword);
    }

    private boolean documentEnabled(RagDocument document) {
        return document != null
            && document.getSpec() != null
            && enabled(document.getSpec().getEnabled(), true);
    }

    private boolean hasSourceType(RagDocument document, String sourceType) {
        return document != null
            && document.getSpec() != null
            && sourceType.equalsIgnoreCase(defaultString(document.getSpec().getSourceType()));
    }

    private boolean needsIndex(RagDocument document) {
        if (!documentEnabled(document) || document.getStatus() == null
            || !StringUtils.hasText(document.getSpec().getContent())) {
            return false;
        }
        var status = document.getStatus();
        if (status.getLastIndexedAt() == null) {
            return true;
        }
        return status.getLastImportedAt() != null
            && status.getLastIndexedAt().isBefore(status.getLastImportedAt());
    }

    private List<String> normalizedNames(List<String> names) {
        if (names == null) {
            return List.of();
        }
        return names.stream()
            .filter(StringUtils::hasText)
            .map(String::strip)
            .distinct()
            .toList();
    }

    private Mono<RagIndexSummary> rebuildIfRequested(ServerRequest request, String knowledgeBase,
        Boolean rebuildAfterMutation) {
        if (!enabled(rebuildAfterMutation, false)) {
            return Mono.empty();
        }
        return aiRequestSecurityService.secure(request)
            .then(ragIndexService.rebuild(normalizeKnowledgeBase(knowledgeBase)));
    }

    private String documentName(String knowledgeBase, String sourceType, String sourceName) {
        var hash = ragContentService.hash(knowledgeBase + ":" + sourceType + ":" + sourceName);
        return "ragdoc-" + hash.substring(0, 24);
    }

    private boolean taskFinished(RagIndexTask task) {
        var phase = task.getStatus() == null ? null : task.getStatus().getPhase();
        return RagIndexTask.Phase.SUCCEEDED.name().equals(phase)
            || RagIndexTask.Phase.FAILED.name().equals(phase)
            || RagIndexTask.Phase.CANCELED.name().equals(phase);
    }

    private int parseLimit(String value) {
        try {
            return Math.max(1, Math.min(Integer.parseInt(value), 100));
        } catch (Exception e) {
            return 20;
        }
    }

    private int parsePage(String value) {
        try {
            return Math.max(1, Integer.parseInt(value));
        } catch (Exception e) {
            return 1;
        }
    }

    private Mono<ServerResponse> ok(Object body) {
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body);
    }

    private Mono<ServerResponse> errorResponse(Throwable error) {
        if (error instanceof ResponseStatusException responseStatusException) {
            return ServerResponse.status(responseStatusException.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new ErrorResponse(false, responseStatusException.getReason()));
        }
        log.error("RAG endpoint failed", error);
        return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new ErrorResponse(false, error.getMessage()));
    }

    private String normalizeKnowledgeBase(String knowledgeBase) {
        return StringUtils.hasText(knowledgeBase) ? knowledgeBase.strip()
            : RagIndexService.DEFAULT_KNOWLEDGE_BASE;
    }

    private String normalizeResourceName(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.strip().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9.-]", "-");
    }

    private boolean enabled(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String userAgent(ServerRequest request) {
        return request.headers().firstHeader("User-Agent");
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.summary.summaraidgpt.lik.cc/v1alpha1");
    }
}
