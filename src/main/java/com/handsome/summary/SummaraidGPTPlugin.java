package com.handsome.summary;

import com.handsome.summary.extension.Summary;
import com.handsome.summary.ai.extension.AiCallLog;
import com.handsome.summary.pet.extension.PetCompanion;
import com.handsome.summary.rag.extension.RagConversation;
import com.handsome.summary.rag.extension.RagDocument;
import com.handsome.summary.rag.extension.RagIndexTask;
import com.handsome.summary.rag.extension.RagKnowledgeBase;
import com.handsome.summary.service.AiRequestSecurityService;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import run.halo.app.extension.Scheme;
import run.halo.app.extension.SchemeManager;
import run.halo.app.extension.index.IndexSpecs;
import run.halo.app.plugin.BasePlugin;
import run.halo.app.plugin.PluginContext;

/**
 * <p>Plugin main class to manage the lifecycle of the plugin.</p>
 * <p>This class must be public and have a public constructor.</p>
 * <p>Only one main class extending {@link BasePlugin} is allowed per plugin.</p>
 *
 * @author guqing
 * @since 1.0.0
 */
@Component
@Slf4j
public class SummaraidGPTPlugin extends BasePlugin {
    private final SchemeManager schemeManager;
    private final AiRequestSecurityService aiRequestSecurityService;

    public SummaraidGPTPlugin(PluginContext pluginContext, SchemeManager schemeManager,
        AiRequestSecurityService aiRequestSecurityService) {
        super(pluginContext);
        this.schemeManager = schemeManager;
        this.aiRequestSecurityService = aiRequestSecurityService;
    }

    @Override
    public void start() {
        registerScheme();
    }

    @Override
    public void stop() {
        aiRequestSecurityService.dispose();
        unregisterScheme();
    }

    private void registerScheme() {
        schemeManager.register(Summary.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<Summary, String>single("summarySpec.postMetadataName", String.class)
                .indexFunc(summary -> Optional.ofNullable(summary.getSummarySpec())
                    .map(Summary.SummarySpec::getPostMetadataName)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<Summary, String>single("summarySpec.postUrl", String.class)
                .indexFunc(summary -> Optional.ofNullable(summary.getSummarySpec())
                    .map(Summary.SummarySpec::getPostUrl)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<Summary, String>single("summarySpec.postSummary", String.class)
                .indexFunc(summary -> Optional.ofNullable(summary.getSummarySpec())
                    .map(Summary.SummarySpec::getPostSummary)
                    .orElse(null)));
        });
        schemeManager.register(RagKnowledgeBase.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<RagKnowledgeBase, String>single("spec.enabled", String.class)
                .indexFunc(knowledgeBase -> Optional.ofNullable(knowledgeBase.getSpec())
                    .map(RagKnowledgeBase.Spec::getEnabled)
                    .map(String::valueOf)
                    .orElse("false")));
            indexSpecs.add(IndexSpecs.<RagKnowledgeBase, String>single("status.indexState", String.class)
                .indexFunc(knowledgeBase -> Optional.ofNullable(knowledgeBase.getStatus())
                    .map(RagKnowledgeBase.Status::getIndexState)
                    .orElse(null)));
        });
        schemeManager.register(RagDocument.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<RagDocument, String>single("spec.knowledgeBase", String.class)
                .indexFunc(document -> Optional.ofNullable(document.getSpec())
                    .map(RagDocument.Spec::getKnowledgeBase)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<RagDocument, String>single("spec.enabled", String.class)
                .indexFunc(document -> Optional.ofNullable(document.getSpec())
                    .map(RagDocument.Spec::getEnabled)
                    .map(String::valueOf)
                    .orElse("false")));
            indexSpecs.add(IndexSpecs.<RagDocument, String>single("spec.sourceType", String.class)
                .indexFunc(document -> Optional.ofNullable(document.getSpec())
                    .map(RagDocument.Spec::getSourceType)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<RagDocument, String>single("spec.sourceName", String.class)
                .indexFunc(document -> Optional.ofNullable(document.getSpec())
                    .map(RagDocument.Spec::getSourceName)
                    .orElse(null)));
        });
        schemeManager.register(RagIndexTask.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<RagIndexTask, String>single("spec.knowledgeBase", String.class)
                .indexFunc(task -> Optional.ofNullable(task.getSpec())
                    .map(RagIndexTask.Spec::getKnowledgeBase)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<RagIndexTask, String>single("status.phase", String.class)
                .indexFunc(task -> Optional.ofNullable(task.getStatus())
                    .map(RagIndexTask.Status::getPhase)
                    .orElse(null)));
        });
        schemeManager.register(RagConversation.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<RagConversation, String>single("spec.knowledgeBase", String.class)
                .indexFunc(conversation -> Optional.ofNullable(conversation.getSpec())
                    .map(RagConversation.Spec::getKnowledgeBase)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<RagConversation, String>single("spec.visitorId", String.class)
                .indexFunc(conversation -> Optional.ofNullable(conversation.getSpec())
                    .map(RagConversation.Spec::getVisitorId)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<RagConversation, Long>single("status.lastMessageAt", Long.class)
                .indexFunc(conversation -> Optional.ofNullable(conversation.getStatus())
                    .map(RagConversation.Status::getLastMessageAt)
                    .map(java.time.Instant::toEpochMilli)
                    .orElse(0L)));
        });
        schemeManager.register(AiCallLog.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<AiCallLog, String>single("spec.operation", String.class)
                .indexFunc(callLog -> Optional.ofNullable(callLog.getSpec())
                    .map(AiCallLog.Spec::getOperation)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<AiCallLog, String>single("spec.modelType", String.class)
                .indexFunc(callLog -> Optional.ofNullable(callLog.getSpec())
                    .map(AiCallLog.Spec::getModelType)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<AiCallLog, String>single("spec.modelName", String.class)
                .indexFunc(callLog -> Optional.ofNullable(callLog.getSpec())
                    .map(AiCallLog.Spec::getModelName)
                    .orElse(null)));
            indexSpecs.add(IndexSpecs.<AiCallLog, String>single("spec.success", String.class)
                .indexFunc(callLog -> Optional.ofNullable(callLog.getSpec())
                    .map(AiCallLog.Spec::getSuccess)
                    .map(String::valueOf)
                    .orElse("false")));
        });
        schemeManager.register(PetCompanion.class, indexSpecs -> {
            indexSpecs.add(IndexSpecs.<PetCompanion, String>single("spec.enabled", String.class)
                .indexFunc(pet -> Optional.ofNullable(pet.getSpec())
                    .map(PetCompanion.Spec::getEnabled)
                    .map(String::valueOf)
                    .orElse("false")));
            indexSpecs.add(IndexSpecs.<PetCompanion, String>single("spec.active", String.class)
                .indexFunc(pet -> Optional.ofNullable(pet.getSpec())
                    .map(PetCompanion.Spec::getActive)
                    .map(String::valueOf)
                    .orElse("false")));
            indexSpecs.add(IndexSpecs.<PetCompanion, String>single("spec.petdexId", String.class)
                .indexFunc(pet -> Optional.ofNullable(pet.getSpec())
                    .map(PetCompanion.Spec::getPetdexId)
                    .orElse(null)));
        });
    }

    private void unregisterScheme() {
        Scheme tokenScheme = schemeManager.get(Summary.class);
        if (tokenScheme != null) {
            schemeManager.unregister(tokenScheme);
        }
        Scheme ragKnowledgeBaseScheme = schemeManager.get(RagKnowledgeBase.class);
        if (ragKnowledgeBaseScheme != null) {
            schemeManager.unregister(ragKnowledgeBaseScheme);
        }
        Scheme ragDocumentScheme = schemeManager.get(RagDocument.class);
        if (ragDocumentScheme != null) {
            schemeManager.unregister(ragDocumentScheme);
        }
        Scheme ragIndexTaskScheme = schemeManager.get(RagIndexTask.class);
        if (ragIndexTaskScheme != null) {
            schemeManager.unregister(ragIndexTaskScheme);
        }
        Scheme ragConversationScheme = schemeManager.get(RagConversation.class);
        if (ragConversationScheme != null) {
            schemeManager.unregister(ragConversationScheme);
        }
        Scheme aiCallLogScheme = schemeManager.get(AiCallLog.class);
        if (aiCallLogScheme != null) {
            schemeManager.unregister(aiCallLogScheme);
        }
        Scheme petCompanionScheme = schemeManager.get(PetCompanion.class);
        if (petCompanionScheme != null) {
            schemeManager.unregister(petCompanionScheme);
        }
    }
}
