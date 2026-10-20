package com.handsome.summary.podcast.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.handsome.summary.podcast.model.PodcastSettings;
import com.handsome.summary.reading.model.ArticleReadingSource;
import com.handsome.summary.service.AiFoundationAiService;
import com.handsome.summary.service.SettingConfigGetter;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class PodcastFixedLinesTest {
    private final AiFoundationAiService ai = mock(AiFoundationAiService.class);
    private final SettingConfigGetter config = mock(SettingConfigGetter.class);
    private final PodcastScriptService service = new PodcastScriptService(ai, config);
    private final PodcastSettings podcast = new PodcastSettings();
    private final ArticleReadingSource source = new ArticleReadingSource("post", "文章", "/post", "文章正文", "hash");

    @BeforeEach
    void setup() throws Exception {
        when(config.getAiConfigForFunction("podcast")).thenReturn(Mono.just(new SettingConfigGetter.AiConfigResult()));
        modelReturnsBody(4, "正文");
    }

    @Test
    void fixedLinesAreInsertedVerbatimAsEditableHostATurns() {
        podcast.setIntroText("  欢迎收听《我的播客》，今天一起读文章。  ");
        podcast.setOutroText("感谢收听，我们下期再见！");
        var turns = service.generate(source, 2, "casual", podcast).block();
        assertThat(turns).hasSize(6);
        assertThat(turns.getFirst().getSpeaker()).isEqualTo("A");
        assertThat(turns.getFirst().getText()).isEqualTo("欢迎收听《我的播客》，今天一起读文章。");
        assertThat(turns.getLast().getSpeaker()).isEqualTo("A");
        assertThat(turns.getLast().getText()).isEqualTo(podcast.getOutroText());
        assertThat(turns.subList(1, 5)).allSatisfy(turn -> assertThat(turn.getText()).isEqualTo("正文"));
        assertThat(turns).allSatisfy(turn -> assertThat(turn.getStartMs()).isNull());
    }

    @Test
    void emptySettingsPreserveExistingBehaviorAndEachLineCanBeEnabledIndependently() {
        podcast.setIntroText(null);
        podcast.setOutroText(" \n ");
        assertThat(service.generate(source, 1, "casual", podcast).block()).hasSize(4);
        podcast.setOutroText("下期再见");
        var outroOnly = service.generate(source, 1, "casual", podcast).block();
        assertThat(outroOnly).hasSize(5);
        assertThat(outroOnly.getFirst().getText()).isEqualTo("正文");
        assertThat(outroOnly.getLast().getText()).isEqualTo("下期再见");
        podcast.setIntroText("欢迎收听");
        podcast.setOutroText("");
        var introOnly = service.generate(source, 1, "casual", podcast).block();
        assertThat(introOnly).hasSize(5);
        assertThat(introOnly.getFirst().getText()).isEqualTo("欢迎收听");
        assertThat(introOnly.getLast().getText()).isEqualTo("正文");
    }

    @Test
    void invalidFixedLinesAreRejectedBeforeCallingTheLanguageModel() {
        podcast.setIntroText("字".repeat(301));
        assertThatThrownBy(() -> service.generate(source, 2, "casual", podcast).block())
            .hasMessageContaining("固定开场白不能超过 300 字");
        podcast.setIntroText("");
        podcast.setOutroText("字".repeat(301));
        assertThatThrownBy(() -> service.generate(source, 2, "casual", podcast).block())
            .hasMessageContaining("固定结束语不能超过 300 字");
        verifyNoInteractions(ai);
    }

    @Test
    void fixedLinesCountTowardTheFinalCharacterAndTurnLimits() throws Exception {
        podcast.setIntroText("欢迎");
        modelReturnsBody(40, "正文");
        assertThatThrownBy(() -> service.generate(source, 2, "casual", podcast).block())
            .hasMessageContaining("合计超过 40 轮或 1800 字");
        modelReturnsBody(6, "字".repeat(300));
        assertThatThrownBy(() -> service.generate(source, 2, "casual", podcast).block())
            .hasMessageContaining("合计超过 40 轮或 1800 字");
        modelReturnsBody(6, "字".repeat(250));
        podcast.setIntroText("字".repeat(300));
        assertThat(service.generate(source, 2, "casual", podcast).block()).hasSize(7);
    }

    private void modelReturnsBody(int count, String text) throws Exception {
        List<Map<String, String>> turns = IntStream.range(0, count)
            .mapToObj(index -> Map.of("speaker", index % 2 == 0 ? "A" : "B", "text", text)).toList();
        var response = new ObjectMapper().writeValueAsString(Map.of("turns", turns));
        when(ai.generateText(anyString(), any())).thenReturn(Mono.just(response));
    }
}
