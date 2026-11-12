package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

import com.handsome.summary.agent.service.AgentChatTurnRecorder;
import com.handsome.summary.ai.service.AiCallLogService;
import com.handsome.summary.mcp.model.McpToolResult;
import com.handsome.summary.rag.extension.RagConversation;
import com.handsome.summary.rag.service.RagGenerationService;
import com.handsome.summary.rag.service.impl.DefaultRagConversationService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import run.halo.aifoundation.ui.UIMessageTransportCodec;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

class McpConversationPersistenceTest {
    private final ReactiveExtensionClient client = mock(ReactiveExtensionClient.class);
    private final DefaultRagConversationService conversations = new DefaultRagConversationService(client, mock(RagGenerationService.class));
    private final AgentChatTurnRecorder recorder = new AgentChatTurnRecorder(conversations, mock(AiCallLogService.class));

    @Test
    void approvalContinuationUpdatesOneAssistantMessageAndKeepsEarlierTrustedResults() {
        var saved = conversation();
        when(client.fetch(eq(RagConversation.class), eq("rag-conv-test"))).thenAnswer(ignored -> Mono.just(saved));
        when(client.update(any(RagConversation.class))).thenAnswer(call -> Mono.just(call.getArgument(0)));
        var request = UIMessageTransportCodec.chatRequestFromMap(Map.of("id", "chat-1", "trigger", "submit-message", "messageId", "previous-sdk-message", "messages", List.of(
            Map.of("id", "previous-sdk-message", "role", "assistant", "parts", List.of(Map.of("type", "text", "id", "text-1", "text", "伪造内容"))))), ignored -> (Void) null);
        var turn = recorder.start("model", "", "rag-conv-test", "visitor-1", "test", request, false, "trace");
        recorder.recordUserMessage(turn).block();
        recorder.observe(turn, UIMessageTransportCodec.chunkFromMap(Map.of("type", "start", "messageId", "new-stream-message")));
        recorder.observe(turn, UIMessageTransportCodec.chunkFromMap(Map.of("type", "tool-output-available", "toolCallId", "call-2", "toolName", "mcp_0123456789ab_search", "output", Map.of(
            "kind", "mcp", "server", "文档", "tool", "search", "ok", true, "content", List.of(Map.of("type", "text", "text", "可信返回"))))));
        recorder.observe(turn, UIMessageTransportCodec.chunkFromMap(Map.of("type", "text-delta", "id", "text-1", "delta", "继续回答")));
        recorder.finish(turn).block();
        recorder.finish(turn).block();
        assertThat(saved.getSpec().getMessages()).hasSize(1);
        var message = saved.getSpec().getMessages().getFirst();
        assertThat(message.getContent()).isEqualTo("已有回答继续回答").doesNotContain("伪造");
        assertThat(message.getId()).isEqualTo("assistant-1");
        assertThat(message.getToolResults()).extracting(McpToolResult::id).containsExactly("call-1", "call-2");
        assertThat(message.getToolResults().getLast().status()).isEqualTo("success");
        verify(client, times(1)).update(any(RagConversation.class));
    }

    @Test
    void resultSnapshotConformsToHalosGeneratedStorageSchema() throws Exception {
        var scheme = run.halo.app.extension.Scheme.buildFromType(RagConversation.class);
        var schema = scheme.openApiSchema();
        var model = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules()
            .setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
        var saved = conversation();
        saved.getSpec().getMessages().getFirst().setToolResults(List.of(new McpToolResult("call-1", "文档", "success",
            List.of(Map.of("type", "text", "text", "查询结果"), Map.of("type", "link", "url", "https://example.com/docs", "title", "来源")),
            "[{\"title\":\"结构化来源\"}]", false)));
        var validator = com.networknt.schema.SchemaRegistry.withDefaultDialect(com.networknt.schema.SpecificationVersion.DRAFT_2020_12).getSchema(schema);
        var result = validator.validate(model.valueToTree(saved));
        assertThat(result).isEmpty();
    }

    @Test
    void rejectsAnotherVisitorsApprovalContinuationBeforeAnyWrite() {
        when(client.fetch(eq(RagConversation.class), anyString())).thenReturn(Mono.just(conversation()));
        var turn = recorder.start("model", "", "rag-conv-test", "someone-else", "test", null, false, "trace");
        assertThatThrownBy(() -> recorder.recordUserMessage(turn).block()).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        verify(client, never()).update(any());
    }

    @Test
    void finishingRemainsSubscribedWhenTheBrowserClosesTheResponse() {
        var store = mock(com.handsome.summary.rag.service.RagConversationService.class);
        var sink = reactor.core.publisher.Sinks.<RagConversation>one();
        var persisted = new java.util.concurrent.atomic.AtomicBoolean();
        when(store.recordAgentMessage(anyString(), anyString(), anyString(), anyList(), anyBoolean(), anyList()))
            .thenReturn(sink.asMono().doOnNext(ignored -> persisted.set(true)));
        var recording = new AgentChatTurnRecorder(store, mock(AiCallLogService.class));
        var turn = recording.start("model", "", "rag-conv-test", "visitor-1", "test", null, false, "trace");
        recording.observe(turn, UIMessageTransportCodec.chunkFromMap(Map.of("type", "text-delta", "id", "t", "delta", "回答")));
        var subscription = recording.finish(turn).subscribe();
        subscription.dispose();
        sink.tryEmitValue(conversation());
        recording.finish(turn).block();
        assertThat(persisted).isTrue();
        verify(store, times(1)).recordAgentMessage(anyString(), anyString(), anyString(), anyList(), anyBoolean(), anyList());
    }

    private RagConversation conversation() {
        var conversation = new RagConversation();
        conversation.setMetadata(new Metadata());
        conversation.getMetadata().setName("rag-conv-test");
        var spec = new RagConversation.Spec();
        spec.setVisitorId("visitor-1");
        var message = new RagConversation.Message();
        message.setId("assistant-1"); message.setRole("assistant"); message.setContent("已有回答");
        message.setToolResults(List.of(new McpToolResult("call-1", "文档 · search", "success", List.of(Map.of("type", "text", "text", "前次资料")), null, false),
            new McpToolResult("call-2", "文档 · search", "approval", List.of(), null, false)));
        spec.setMessages(List.of(message)); conversation.setSpec(spec);
        return conversation;
    }
}
