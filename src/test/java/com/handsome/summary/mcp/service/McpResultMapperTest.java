package com.handsome.summary.mcp.service;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.spec.McpSchema;
import org.junit.jupiter.api.Test;

class McpResultMapperTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void preservesStructuredResultsAndImagesWhileDroppingUnsafeLinksMetadataAndOversizedData() throws Exception {
        var result = mapper.readValue("""
            {"content":[
              {"type":"text","text":"来源资料"},
              {"type":"resource_link","uri":"https://example.com/doc","name":"文档"},
              {"type":"resource_link","uri":"javascript:alert(1)","name":"无效"},
              {"type":"resource_link","uri":"/relative","name":"无效"},
              {"type":"image","data":"aGVsbG8=","mimeType":"image/png"},
              {"type":"image","data":"aGVsbG8=","mimeType":"image/svg+xml"}],
             "structuredContent":{"results":[{"title":"文章","url":"https://example.com/doc"}]},
             "_meta":{"secret":"do-not-expose"},"isError":false}
            """, McpSchema.CallToolResult.class);
        var output = new McpResultMapper().map("搜索", "web_search", result);
        assertThat(output.get("ok")).isEqualTo(true);
        assertThat(output.get("content")).asList().hasSize(3);
        assertThat(output.get("structuredContent").toString()).contains("文章");
        assertThat(output).doesNotContainKey("_meta");
        assertThat(output.toString()).doesNotContain("javascript:", "do-not-expose", "svg+xml");
        assertThat(output.get("truncated")).isEqualTo(true);
    }

    @Test
    void keepsSourceRowsUsableWhenStructuredDocumentResultsExceedTheDisplayBudget() {
        var documents = java.util.stream.IntStream.range(0, 40).mapToObj(i -> java.util.Map.of(
            "title", "文档 " + i, "url", "https://example.com/docs/" + i, "text", "正文".repeat(3000))).toList();
        var result = McpSchema.CallToolResult.builder().structuredContent(java.util.Map.of("results", documents)).build();
        var output = new McpResultMapper().map("文档", "search", result);
        var structured = mapper.valueToTree(output.get("structuredContent"));
        assertThat(structured.toString().length()).isLessThan(12000);
        assertThat(structured.path("results").size()).isBetween(1, 12);
        assertThat(structured.path("results").get(0).path("url").asText()).isEqualTo("https://example.com/docs/0");
        assertThat(output.get("truncated")).isEqualTo(true);
        assertThat(output).doesNotContainKey("structuredPreview");
    }

    @Test
    void limitsTotalTextAndRetainsToolErrors() {
        var result = McpSchema.CallToolResult.builder().isError(true)
            .addTextContent("x".repeat(20000)).addTextContent("not-displayed").build();
        var output = new McpResultMapper().map("Docs", "read", result);
        assertThat(output.get("truncated")).isEqualTo(true);
        assertThat(output.get("ok")).isEqualTo(false);
        assertThat(output.toString()).doesNotContain("not-displayed");
    }
}
