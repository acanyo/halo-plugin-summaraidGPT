package com.handsome.summary.glossary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.handsome.summary.service.AiFoundationAiService;
import org.junit.jupiter.api.Test;

class GlossaryGeneratorTest {
    private final GlossaryGenerator generator = new GlossaryGenerator(mock(AiFoundationAiService.class));

    @Test
    void keepsOnlyRealTermsWithUsefulPlainTextExplanations() {
        var terms = generator.parse("""
            ```json
            {"terms":[
              {"term":"RAG","explanation":"<b>检索增强生成</b>，本文用它结合站点知识回答。<script>alert(1)</script>"},
              {"term":"RAG","explanation":"重复解释"},
              {"term":"不存在的词","explanation":"模型臆造"},
              {"term":"向量索引","explanation":""},
              {"term":"Halo","explanation":{"error":"非文本"}},
              {"term":"检索","explanation":"在本文中查找相关信息。"}
            ]}
            ```
            """, "Halo 使用 RAG 与向量索引进行检索。", 8);
        assertThat(terms).hasSize(2);
        assertThat(terms.getFirst().term()).isEqualTo("RAG");
        assertThat(terms.getFirst().explanation()).doesNotContain("<", "alert").contains("本文");
        assertThat(terms.getLast().term()).isEqualTo("检索");
    }

    @Test
    void acceptsNoTermsWithoutInventingAFallback() {
        assertThat(generator.parse("{\"terms\":[]}", "今天去了公园", 8)).isEmpty();
    }

    @Test
    void limitsOutputAndRejectsMalformedModelResponses() {
        assertThat(generator.parse("""
            {"terms":[{"term":"RAG","explanation":"检索增强生成。"},
            {"term":"向量","explanation":"一组表示语义的数值。"}]}
            """, "RAG 使用向量", 1)).hasSize(1);
        assertThatThrownBy(() -> generator.parse("{\"something\":[]}", "RAG", 8))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
