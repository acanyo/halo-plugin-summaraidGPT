package com.handsome.summary.rag.service.impl;

import com.handsome.summary.rag.model.RagAnswer;
import com.handsome.summary.rag.model.RagChatStreamEvent;
import com.handsome.summary.rag.model.RagConversationMessage;
import com.handsome.summary.rag.service.RagAiService;
import com.handsome.summary.rag.service.RagGenerationService;
import com.handsome.summary.rag.service.RagSearchService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class DefaultRagGenerationService implements RagGenerationService {

    private final SettingConfigGetter settingConfigGetter;
    private final RagSearchService ragSearchService;
    private final RagAiService ragAiService;

    @Override
    public Mono<RagAnswer> ask(String knowledgeBase, String question, Integer limit) {
        return askWithHistory(knowledgeBase, question, limit, List.of());
    }

    @Override
    public Mono<RagAnswer> askWithHistory(String knowledgeBase, String question, Integer limit,
        List<RagConversationMessage> history) {
        return ragSearchService.search(knowledgeBase, question, limit)
            .flatMap(results -> Mono.zip(settingConfigGetter.getAiConfigForFunction("rag"),
                    settingConfigGetter.getRagConfig())
                .flatMap(tuple -> ragAiService.generateAnswer(
                    composeQuestion(question, history, tuple.getT2()), results,
                    tuple.getT1().getModelName(), tuple.getT1().getSystemPrompt(),
                    normalizedMaxContextCharacters(tuple.getT2().getMaxContextCharacters()))));
    }

    @Override
    public Flux<RagChatStreamEvent> stream(String knowledgeBase, String question, Integer limit) {
        return streamWithHistory(knowledgeBase, question, limit, List.of());
    }

    @Override
    public Flux<RagChatStreamEvent> streamWithHistory(String knowledgeBase, String question,
        Integer limit, List<RagConversationMessage> history) {
        return ragSearchService.search(knowledgeBase, question, limit)
            .flatMapMany(results -> Mono.zip(settingConfigGetter.getAiConfigForFunction("rag"),
                    settingConfigGetter.getRagConfig())
                .flatMapMany(tuple -> Flux.concat(
                    ragAiService.streamAnswer(composeQuestion(question, history, tuple.getT2()),
                        results,
                        tuple.getT1().getModelName(), tuple.getT1().getSystemPrompt(),
                        normalizedMaxContextCharacters(tuple.getT2().getMaxContextCharacters())),
                    Flux.just(RagChatStreamEvent.done())
                )))
            .onErrorResume(error -> {
                log.error("RAG generation stream failed: knowledgeBase={}, limit={}",
                    knowledgeBase, limit, error);
                return Flux.just(RagChatStreamEvent.error(error.getMessage()));
            });
    }

    private int normalizedMaxContextCharacters(Integer value) {
        if (value == null) {
            return 12000;
        }
        return Math.min(Math.max(value, 1000), 60000);
    }

    private String composeQuestion(String question, List<RagConversationMessage> history,
        SettingConfigGetter.RagConfig config) {
        var clippedHistory = clipHistory(history, config);
        if (clippedHistory.isEmpty()) {
            return question;
        }
        var builder = new StringBuilder();
        builder.append("历史对话（仅用于理解用户追问和上下文，不作为知识库引用依据）：\n");
        for (var message : clippedHistory) {
            builder.append(roleText(message.getRole())).append("：")
                .append(message.getContent().strip())
                .append("\n");
        }
        builder.append("\n当前问题：\n").append(question);
        return builder.toString();
    }

    private List<RagConversationMessage> clipHistory(List<RagConversationMessage> history,
        SettingConfigGetter.RagConfig config) {
        if (history == null || history.isEmpty()) {
            return List.of();
        }
        var maxMessages = normalizedConversationMaxMessages(config.getConversationMaxMessages());
        var maxChars = normalizedConversationMaxContextCharacters(
            config.getConversationMaxContextCharacters());
        if (maxMessages <= 0 || maxChars <= 0) {
            return List.of();
        }
        var selected = new ArrayList<RagConversationMessage>();
        var usedChars = 0;
        for (var i = history.size() - 1; i >= 0 && selected.size() < maxMessages; i--) {
            var message = history.get(i);
            if (message == null || !StringUtils.hasText(message.getContent())) {
                continue;
            }
            var content = message.getContent().strip();
            var entryChars = content.length() + 16;
            if (!selected.isEmpty() && usedChars + entryChars > maxChars) {
                break;
            }
            selected.add(0, message);
            usedChars += entryChars;
        }
        return List.copyOf(selected);
    }

    private int normalizedConversationMaxMessages(Integer value) {
        if (value == null) {
            return 12;
        }
        return Math.min(Math.max(value, 0), 40);
    }

    private int normalizedConversationMaxContextCharacters(Integer value) {
        if (value == null) {
            return 4000;
        }
        return Math.min(Math.max(value, 0), 30000);
    }

    private String roleText(String role) {
        return "assistant".equalsIgnoreCase(role) ? "助手" : "用户";
    }
}
