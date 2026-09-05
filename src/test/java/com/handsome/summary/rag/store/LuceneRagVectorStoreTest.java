package com.handsome.summary.rag.store;

import static org.assertj.core.api.Assertions.assertThat;

import com.handsome.summary.rag.model.RagIndexedChunk;
import com.handsome.summary.rag.model.RagSearchResult;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class LuceneRagVectorStoreTest {

    private static final String KNOWLEDGE_BASE = "test-kb";
    private static final String INDEX_VERSION = "v1";
    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    @TempDir
    Path tempDirectory;

    private LuceneRagVectorStore store;

    @BeforeEach
    void setUp() {
        store = new LuceneRagVectorStore(() -> tempDirectory.resolve("plugins"));
    }

    @ParameterizedTest
    @ValueSource(ints = {1536, 3072, 4096})
    void rebuildPersistsSearchableTextAndHighDimensionalVectors(int dimensions) {
        var matching = chunk("matching", "first-document", "rebuilding", dimensions, 0);
        var other = chunk("other", "second-document", "unrelated", dimensions, 1);

        store.rebuild(KNOWLEDGE_BASE, INDEX_VERSION, List.of(matching, other)).block(TIMEOUT);

        assertThat(store.keywordSearch(KNOWLEDGE_BASE, INDEX_VERSION, "rebuilding", 10)
            .block(TIMEOUT))
            .extracting(RagSearchResult::getId)
            .containsExactly("matching");
        assertThat(store.vectorSearch(KNOWLEDGE_BASE, INDEX_VERSION, matching.getVector(), 1)
            .block(TIMEOUT))
            .extracting(RagSearchResult::getId)
            .containsExactly("matching");
    }

    @ParameterizedTest
    @ValueSource(ints = {1536, 3072, 4096})
    void replaceDocumentsCreatesAndUpdatesSearchableIndex(int dimensions) {
        var original = chunk("original", "first-document", "obsolete", dimensions, 0);
        var retained = chunk("retained", "second-document", "retained", dimensions, 1);
        store.replaceDocuments(KNOWLEDGE_BASE, INDEX_VERSION,
            List.of("first-document", "second-document"), List.of(original, retained))
            .block(TIMEOUT);

        var replacement = chunk("replacement", "first-document", "updated", dimensions, 2);
        store.replaceDocuments(KNOWLEDGE_BASE, INDEX_VERSION,
            List.of("first-document"), List.of(replacement)).block(TIMEOUT);

        assertThat(store.keywordSearch(KNOWLEDGE_BASE, INDEX_VERSION, "obsolete", 10)
            .block(TIMEOUT)).isEmpty();
        assertThat(store.keywordSearch(KNOWLEDGE_BASE, INDEX_VERSION, "updated", 10)
            .block(TIMEOUT))
            .extracting(RagSearchResult::getId)
            .containsExactly("replacement");
        assertThat(store.keywordSearch(KNOWLEDGE_BASE, INDEX_VERSION, "retained", 10)
            .block(TIMEOUT))
            .extracting(RagSearchResult::getId)
            .containsExactly("retained");
        assertThat(store.vectorSearch(KNOWLEDGE_BASE, INDEX_VERSION, replacement.getVector(), 1)
            .block(TIMEOUT))
            .extracting(RagSearchResult::getId)
            .containsExactly("replacement");
        assertThat(store.vectorSearch(KNOWLEDGE_BASE, INDEX_VERSION, original.getVector(), 10)
            .block(TIMEOUT))
            .extracting(RagSearchResult::getId)
            .containsExactlyInAnyOrder("replacement", "retained");
    }

    private RagIndexedChunk chunk(String id, String documentName, String content,
        int dimensions, int component) {
        var vector = new float[dimensions];
        vector[component] = 1.0f;
        return RagIndexedChunk.builder()
            .id(id)
            .knowledgeBase(KNOWLEDGE_BASE)
            .documentName(documentName)
            .title(documentName)
            .content(content)
            .chunkIndex(0)
            .vector(vector)
            .build();
    }
}
