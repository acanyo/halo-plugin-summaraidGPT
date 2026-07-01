package com.handsome.summary.rag.service.impl;

import static run.halo.app.extension.index.query.Queries.equal;

import com.handsome.summary.rag.extension.RagConversation;
import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagConversationMessage;
import com.handsome.summary.rag.model.RagSourceReference;
import com.handsome.summary.rag.service.RagConversationService;
import com.handsome.summary.rag.service.RagGenerationService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultRagConversationService implements RagConversationService {

    private static final int MAX_VISITOR_ID_LENGTH = 80;
    private static final int MAX_USER_AGENT_LENGTH = 300;
    private static final int MAX_TITLE_LENGTH = 80;
    private static final String ALL_KNOWLEDGE_BASE_SCOPE = "__all__";

    private final ReactiveExtensionClient client;
    private final RagGenerationService ragGenerationService;

    @Override
    public Mono<ConversationPage> list(String knowledgeBase, String keyword, int page, int size) {
        var normalizedPage = Math.max(page, 1);
        var normalizedSize = Math.max(1, Math.min(size, 100));
        var offset = (normalizedPage - 1) * normalizedSize;
        var optionsBuilder = ListOptions.builder();
        if (StringUtils.hasText(knowledgeBase)) {
            optionsBuilder.fieldQuery(equal("spec.knowledgeBase", knowledgeBase.strip()));
        }
        var options = optionsBuilder.build();
        return client.listAll(RagConversation.class, options, Sort.unsorted())
            .filter(conversation -> matchesKeyword(conversation, keyword))
            .sort(Comparator.comparing(this::lastMessageAt).reversed())
            .collectList()
            .map(items -> new ConversationPage(
                items.stream()
                    .skip(offset)
                    .limit(normalizedSize)
                    .toList(),
                normalizedPage,
                normalizedSize,
                items.size()
            ));
    }

    @Override
    public Mono<RagConversation> get(String name) {
        var normalizedName = normalizeConversationId(name);
        if (!StringUtils.hasText(normalizedName)) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "conversation name is required"));
        }
        return client.fetch(RagConversation.class, normalizedName)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                "RAG conversation not found")));
    }

    @Override
    public Mono<RagConversation> getForVisitor(String name, String visitorId) {
        var normalizedVisitorId = normalizeVisitorId(visitorId);
        if (!StringUtils.hasText(normalizedVisitorId)) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "visitorId is required"));
        }
        return get(name)
            .flatMap(conversation -> validateVisitor(conversation, normalizedVisitorId)
                .thenReturn(conversation));
    }

    @Override
    public Mono<Void> delete(String name) {
        return get(name).flatMap(client::delete).then();
    }

    @Override
    public Mono<RagAnswer> ask(String knowledgeBase, String conversationId, String visitorId,
        String userAgent, String question, Integer limit) {
        var conversationScope = conversationScope(knowledgeBase);
        var searchScope = searchScope(knowledgeBase);
        return getOrCreate(conversationScope, conversationId, visitorId, userAgent, question)
            .flatMap(conversation -> {
                var history = toHistoryMessages(conversation);
                return appendMessage(conversation.getMetadata().getName(),
                        userMessage(question))
                    .then(ragGenerationService.askWithHistory(searchScope, question,
                        limit, history))
                    .flatMap(answer -> saveAssistantMessage(conversation.getMetadata().getName(),
                            answer.getAnswer(), answer.getSources(), false)
                        .thenReturn(answer.toBuilder()
                            .conversationId(conversation.getMetadata().getName())
                            .build()));
            });
    }

    @Override
    public Flux<RagChatStreamEvent> stream(String knowledgeBase, String conversationId,
        String visitorId, String userAgent, String question, Integer limit) {
        var conversationScope = conversationScope(knowledgeBase);
        var searchScope = searchScope(knowledgeBase);
        return getOrCreate(conversationScope, conversationId, visitorId, userAgent, question)
            .flatMapMany(conversation -> {
                var name = conversation.getMetadata().getName();
                var history = toHistoryMessages(conversation);
                var answerText = new StringBuilder();
                var sourceReferences = new ArrayList<RagSourceReference>();
                var assistantSaved = new java.util.concurrent.atomic.AtomicBoolean(false);
                return appendMessage(name, userMessage(question))
                    .thenMany(Flux.concat(
                        Flux.just(RagChatStreamEvent.conversation(name)),
                        ragGenerationService.streamWithHistory(searchScope, question,
                            limit, history)
                            .concatMap(event -> handleStreamEvent(name, event, answerText,
                                sourceReferences, assistantSaved))
                    ));
            });
    }

    @Override
    public Mono<RagConversation> recordUserMessage(String knowledgeBase, String conversationId,
        String visitorId, String userAgent, String content) {
        var conversationScope = conversationScope(knowledgeBase);
        return getOrCreate(conversationScope, conversationId, visitorId, userAgent, content)
            .flatMap(conversation -> appendMessage(conversation.getMetadata().getName(),
                userMessage(content)));
    }

    @Override
    public Mono<RagConversation> recordAssistantMessage(String conversationId, String content,
        List<RagSourceReference> sources, boolean error) {
        return saveAssistantMessage(conversationId, content, sources, error);
    }

    private Mono<RagChatStreamEvent> handleStreamEvent(String conversationName,
        RagChatStreamEvent event, StringBuilder answerText, List<RagSourceReference> sources,
        java.util.concurrent.atomic.AtomicBoolean assistantSaved) {
        if (event == null) {
            return Mono.empty();
        }
        if ("delta".equals(event.getType()) && event.getDelta() != null) {
            answerText.append(event.getDelta());
            return Mono.just(event);
        }
        if ("sources".equals(event.getType())) {
            sources.clear();
            if (event.getSources() != null) {
                sources.addAll(event.getSources());
            }
            return Mono.just(event);
        }
        if ("error".equals(event.getType())) {
            return saveAssistantOnce(conversationName, answerText.toString(), sources, true,
                    assistantSaved)
                .thenReturn(event);
        }
        if ("done".equals(event.getType())) {
            return saveAssistantOnce(conversationName, answerText.toString(), sources, false,
                    assistantSaved)
                .thenReturn(event);
        }
        return Mono.just(event);
    }

    private Mono<RagConversation> saveAssistantOnce(String conversationName, String content,
        List<RagSourceReference> sources, boolean error,
        java.util.concurrent.atomic.AtomicBoolean assistantSaved) {
        if (!assistantSaved.compareAndSet(false, true)) {
            return Mono.empty();
        }
        var assistantContent = StringUtils.hasText(content)
            ? content
            : (error ? "RAG 问答失败" : "");
        return saveAssistantMessage(conversationName, assistantContent, sources, error);
    }

    private Mono<RagConversation> saveAssistantMessage(String conversationName, String content,
        List<RagSourceReference> sources, boolean error) {
        return appendMessage(conversationName, assistantMessage(content, sources, error))
            .onErrorResume(saveError -> {
                log.warn("Failed to save RAG assistant conversation message: conversation={}",
                    conversationName, saveError);
                return Mono.empty();
            });
    }

    private Mono<RagConversation> getOrCreate(String knowledgeBase, String conversationId,
        String visitorId, String userAgent, String firstQuestion) {
        var name = normalizeConversationId(conversationId);
        var normalizedVisitorId = normalizeVisitorId(visitorId);
        if (StringUtils.hasText(name) && !StringUtils.hasText(normalizedVisitorId)) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "visitorId is required when continuing a conversation"));
        }
        if (!StringUtils.hasText(name)) {
            name = "rag-conv-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT);
        }
        var conversationName = name;
        return client.fetch(RagConversation.class, conversationName)
            .flatMap(conversation -> validateConversationScope(conversation, knowledgeBase,
                    normalizedVisitorId)
                .thenReturn(conversation))
            .switchIfEmpty(Mono.defer(() -> client.create(newConversation(conversationName,
                knowledgeBase, normalizedVisitorId, userAgent, firstQuestion))));
    }

    private RagConversation newConversation(String name, String knowledgeBase, String visitorId,
        String userAgent, String firstQuestion) {
        var conversation = new RagConversation();
        var metadata = new Metadata();
        metadata.setName(name);
        conversation.setMetadata(metadata);

        var spec = new RagConversation.Spec();
        spec.setKnowledgeBase(knowledgeBase);
        spec.setVisitorId(truncate(trimToNull(visitorId), MAX_VISITOR_ID_LENGTH));
        spec.setUserAgent(truncate(trimToNull(userAgent), MAX_USER_AGENT_LENGTH));
        spec.setTitle(titleFromQuestion(firstQuestion));
        spec.setMessages(List.of());
        conversation.setSpec(spec);

        var status = new RagConversation.Status();
        status.setCreatedAt(Instant.now());
        conversation.setStatus(status);
        return conversation;
    }

    private Mono<RagConversation> appendMessage(String conversationName,
        RagConversation.Message message) {
        return get(conversationName)
            .flatMap(conversation -> {
                var spec = conversation.getSpec() == null
                    ? new RagConversation.Spec()
                    : conversation.getSpec();
                var messages = new ArrayList<RagConversation.Message>();
                if (spec.getMessages() != null) {
                    messages.addAll(spec.getMessages());
                }
                messages.add(message);
                spec.setMessages(messages);
                if (!StringUtils.hasText(spec.getTitle())
                    && "user".equals(message.getRole())) {
                    spec.setTitle(titleFromQuestion(message.getContent()));
                }
                conversation.setSpec(spec);
                conversation.setStatus(statusFrom(messages, conversation.getStatus()));
                return client.update(conversation);
            });
    }

    private RagConversation.Status statusFrom(List<RagConversation.Message> messages,
        RagConversation.Status current) {
        var status = current == null ? new RagConversation.Status() : current;
        var safeMessages = messages == null ? List.<RagConversation.Message>of() : messages;
        status.setMessageCount(safeMessages.size());
        status.setUserMessageCount((int) safeMessages.stream()
            .filter(message -> "user".equals(message.getRole()))
            .count());
        status.setAssistantMessageCount((int) safeMessages.stream()
            .filter(message -> "assistant".equals(message.getRole()))
            .count());
        status.setTotalInputChars(safeMessages.stream()
            .filter(message -> "user".equals(message.getRole()))
            .map(RagConversation.Message::getContent)
            .mapToInt(this::safeLength)
            .sum());
        status.setTotalOutputChars(safeMessages.stream()
            .filter(message -> "assistant".equals(message.getRole()))
            .map(RagConversation.Message::getContent)
            .mapToInt(this::safeLength)
            .sum());
        safeMessages.stream()
            .map(RagConversation.Message::getCreatedAt)
            .filter(java.util.Objects::nonNull)
            .max(Comparator.naturalOrder())
            .ifPresent(status::setLastMessageAt);
        safeMessages.stream()
            .filter(message -> "user".equals(message.getRole()))
            .map(RagConversation.Message::getCreatedAt)
            .filter(java.util.Objects::nonNull)
            .max(Comparator.naturalOrder())
            .ifPresent(status::setLastUserMessageAt);
        safeMessages.stream()
            .filter(message -> "assistant".equals(message.getRole()))
            .map(RagConversation.Message::getCreatedAt)
            .filter(java.util.Objects::nonNull)
            .max(Comparator.naturalOrder())
            .ifPresent(status::setLastAssistantMessageAt);
        if (status.getCreatedAt() == null) {
            status.setCreatedAt(Instant.now());
        }
        return status;
    }

    private RagConversation.Message userMessage(String content) {
        var message = baseMessage("user", content);
        message.setSources(List.of());
        return message;
    }

    private RagConversation.Message assistantMessage(String content, List<RagSourceReference> sources,
        boolean error) {
        var message = baseMessage("assistant", content);
        message.setSources(toSourceSnapshots(sources));
        message.setError(error);
        return message;
    }

    private RagConversation.Message baseMessage(String role, String content) {
        var message = new RagConversation.Message();
        message.setId("msg-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT));
        message.setRole(role);
        message.setContent(content == null ? "" : content);
        message.setCreatedAt(Instant.now());
        message.setError(false);
        return message;
    }

    private List<RagConversation.Source> toSourceSnapshots(List<RagSourceReference> sources) {
        if (sources == null || sources.isEmpty()) {
            return List.of();
        }
        return sources.stream()
            .filter(java.util.Objects::nonNull)
            .map(this::toSourceSnapshot)
            .toList();
    }

    private RagConversation.Source toSourceSnapshot(RagSourceReference source) {
        var snapshot = new RagConversation.Source();
        snapshot.setId(source.getId());
        snapshot.setDocumentName(metadataString(source, "documentName"));
        snapshot.setSourceName(metadataString(source, "sourceName"));
        snapshot.setSourceType(source.getSourceType());
        snapshot.setTitle(source.getTitle());
        snapshot.setUrl(source.getUrl());
        snapshot.setScore(source.getScore());
        snapshot.setChunkCount(metadataInteger(source, "chunkCount"));
        snapshot.setChunkIndexes(metadataStringList(source, "chunkIndexes"));
        snapshot.setSourceIds(metadataStringList(source, "sourceIds"));
        snapshot.setContent(metadataString(source, "content"));
        return snapshot;
    }

    private String metadataString(RagSourceReference source, String key) {
        if (source == null || source.getMetadata() == null) {
            return null;
        }
        var value = source.getMetadata().get(key);
        return value == null ? null : String.valueOf(value);
    }

    private Integer metadataInteger(RagSourceReference source, String key) {
        if (source == null || source.getMetadata() == null) {
            return null;
        }
        var value = source.getMetadata().get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value != null) {
            try {
                return Integer.parseInt(String.valueOf(value));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private List<String> metadataStringList(RagSourceReference source, String key) {
        if (source == null || source.getMetadata() == null) {
            return List.of();
        }
        var value = source.getMetadata().get(key);
        if (value instanceof Iterable<?> iterable) {
            var values = new ArrayList<String>();
            for (var item : iterable) {
                if (item != null && StringUtils.hasText(String.valueOf(item))) {
                    values.add(String.valueOf(item));
                }
            }
            return List.copyOf(values);
        }
        if (value != null && StringUtils.hasText(String.valueOf(value))) {
            return List.of(String.valueOf(value));
        }
        return List.of();
    }

    private List<RagConversationMessage> toHistoryMessages(RagConversation conversation) {
        if (conversation == null || conversation.getSpec() == null
            || conversation.getSpec().getMessages() == null) {
            return List.of();
        }
        return conversation.getSpec().getMessages().stream()
            .filter(message -> message != null
                && StringUtils.hasText(message.getContent())
                && ("user".equals(message.getRole()) || "assistant".equals(message.getRole()))
                && !Boolean.TRUE.equals(message.getError()))
            .map(message -> RagConversationMessage.builder()
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build())
            .toList();
    }

    private Instant lastMessageAt(RagConversation conversation) {
        var statusTime = conversation.getStatus() == null
            ? null
            : conversation.getStatus().getLastMessageAt();
        if (statusTime != null) {
            return statusTime;
        }
        var metadata = conversation.getMetadata();
        return metadata == null || metadata.getCreationTimestamp() == null
            ? Instant.EPOCH
            : metadata.getCreationTimestamp();
    }

    private String conversationScope(String knowledgeBase) {
        return StringUtils.hasText(knowledgeBase) ? knowledgeBase.strip() : ALL_KNOWLEDGE_BASE_SCOPE;
    }

    private String searchScope(String knowledgeBase) {
        return StringUtils.hasText(knowledgeBase) ? knowledgeBase.strip() : null;
    }

    private String normalizeConversationId(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        var normalized = value.strip().toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9.-]", "-");
        return StringUtils.hasText(normalized) ? normalized : null;
    }

    private String normalizeVisitorId(String value) {
        return truncate(trimToNull(value), MAX_VISITOR_ID_LENGTH);
    }

    private Mono<Void> validateConversationScope(RagConversation conversation, String knowledgeBase,
        String visitorId) {
        var spec = conversation.getSpec();
        var conversationKnowledgeBase = spec == null ? null : spec.getKnowledgeBase();
        if (!conversationScope(conversationKnowledgeBase).equals(conversationScope(knowledgeBase))) {
            return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Conversation belongs to another knowledge base"));
        }
        if (StringUtils.hasText(visitorId)) {
            return validateVisitor(conversation, visitorId);
        }
        return Mono.empty();
    }

    private Mono<Void> validateVisitor(RagConversation conversation, String visitorId) {
        var spec = conversation.getSpec();
        var conversationVisitorId = spec == null ? null : normalizeVisitorId(spec.getVisitorId());
        if (!StringUtils.hasText(conversationVisitorId) || !conversationVisitorId.equals(visitorId)) {
            return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Conversation does not belong to this visitor"));
        }
        return Mono.empty();
    }

    private String titleFromQuestion(String question) {
        var title = StringUtils.hasText(question) ? question.strip().replaceAll("\\s+", " ")
            : "RAG 会话";
        return truncate(title, MAX_TITLE_LENGTH);
    }

    private boolean matchesKeyword(RagConversation conversation, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        var normalizedKeyword = keyword.strip().toLowerCase(Locale.ROOT);
        var haystack = new StringBuilder();
        appendSearchText(haystack, conversation == null || conversation.getMetadata() == null
            ? null : conversation.getMetadata().getName());
        var spec = conversation == null ? null : conversation.getSpec();
        if (spec != null) {
            appendSearchText(haystack, spec.getTitle());
            appendSearchText(haystack, spec.getVisitorId());
            appendSearchText(haystack, spec.getUserAgent());
            if (spec.getMessages() != null) {
                spec.getMessages().stream()
                    .map(RagConversation.Message::getContent)
                    .filter(StringUtils::hasText)
                    .forEach(content -> appendSearchText(haystack, content));
            }
        }
        return haystack.toString().toLowerCase(Locale.ROOT).contains(normalizedKeyword);
    }

    private void appendSearchText(StringBuilder haystack, String value) {
        if (StringUtils.hasText(value)) {
            haystack.append(' ').append(value);
        }
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.strip() : null;
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private int safeLength(String value) {
        return value == null ? 0 : value.length();
    }
}
