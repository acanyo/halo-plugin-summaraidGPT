package com.handsome.summary.podcast.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.handsome.summary.podcast.extension.ArticlePodcast.Turn;
import java.util.List;
import org.junit.jupiter.api.Test;

class PodcastScriptServiceTest {
    private final PodcastScriptService service = new PodcastScriptService(null, null);

    @Test
    void acceptsFencedJsonButRejectsBrokenOrSingleSpeakerScripts() {
        var result = service.parse("```json\n{\"turns\":[{\"speaker\":\"A\",\"text\":\" 问题 \"},{\"speaker\":\"B\",\"text\":\"解释\"},{\"speaker\":\"A\",\"text\":\"追问\"},{\"speaker\":\"B\",\"text\":\"回答\"}]}\n```");
        assertThat(result).hasSize(4);
        assertThat(result.getFirst().getText()).isEqualTo("问题");
        assertThatThrownBy(() -> service.parse("这是一篇文章摘要"))
            .hasMessageContaining("有效的双人讨论稿");
        assertThatThrownBy(() -> PodcastScriptService.validate(List.of(new Turn("A", "a"), new Turn("A", "b"), new Turn("A", "c"), new Turn("A", "d"))))
            .hasMessageContaining("两位主持人");
    }

    @Test
    void draftValidationRemovesClientSuppliedTimings() {
        var turn = new Turn("A", "问题");
        turn.setStartMs(999L);
        var result = PodcastScriptService.validate(List.of(turn, new Turn("B", "解释"), new Turn("A", "追问"), new Turn("B", "回答")));
        assertThat(result.getFirst().getStartMs()).isNull();
    }
}
