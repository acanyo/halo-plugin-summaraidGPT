package com.handsome.summary.podcast.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.handsome.summary.podcast.model.PodcastSettings;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.Secret;

class PodcastCredentialsServiceTest {
    @Test
    void keepsSecretsServerSideAndPreservesMaskedKeysUntilExplicitlyCleared() {
        var client = mock(ReactiveExtensionClient.class);
        var stored = new AtomicReference<Secret>();
        when(client.fetch(eq(Secret.class), any())).thenAnswer(call -> Mono.justOrEmpty(stored.get()));
        when(client.create(any(Secret.class))).thenAnswer(call -> {
            Secret secret = call.getArgument(0);
            secret.getMetadata().setVersion(1L);
            stored.set(secret);
            return Mono.just(secret);
        });
        when(client.update(any(Secret.class))).thenAnswer(call -> Mono.just(call.getArgument(0)));
        var service = new PodcastCredentialsService(client);
        service.save(Map.of("minimax", "test-secret")).block();
        assertThat(service.status().block()).containsEntry("minimax", PodcastCredentialsService.MASK)
            .doesNotContainValue("test-secret");
        service.save(Map.of("minimax", PodcastCredentialsService.MASK, "doubao", "other-secret")).block();
        var settings = service.resolve(new PodcastSettings()).block();
        assertThat(settings.getMinimax().getApiKey()).isEqualTo("test-secret");
        assertThat(settings.getDoubao().getApiKey()).isEqualTo("other-secret");
        service.save(Map.of("minimax", "")).block();
        assertThat(service.resolve(new PodcastSettings()).block().getMinimax().getApiKey()).isNull();
        assertThat(service.status().block()).containsEntry("doubao", PodcastCredentialsService.MASK);
    }

    @Test
    void migratingToTheSharedBailianChannelCopiesOnlyTheExplicitSourceAndHonorsClearing() {
        var client = mock(ReactiveExtensionClient.class);
        var secret = new Secret();
        var metadata = new run.halo.app.extension.Metadata();
        metadata.setName(PodcastCredentialsService.SECRET_NAME);
        metadata.setVersion(1L);
        secret.setMetadata(metadata);
        secret.setStringData(Map.of("cosyvoice", "cosy-secret", "bailianMinimax", "minimax-secret"));
        when(client.fetch(eq(Secret.class), any())).thenAnswer(call -> Mono.just(secret));
        when(client.update(any(Secret.class))).thenAnswer(call -> Mono.just(call.getArgument(0)));
        var service = new PodcastCredentialsService(client);
        service.save(Map.of("bailian", PodcastCredentialsService.MASK, "bailianSource", "cosyvoice")).block();
        var resolved = service.resolve(new PodcastSettings()).block();
        assertThat(resolved.getBailian().getApiKey()).isEqualTo("cosy-secret");
        assertThat(resolved.getBailianMinimax().getApiKey()).isEqualTo("minimax-secret");
        assertThat(secret.getData()).doesNotContainKey("bailianSource");
        service.save(Map.of("bailian", "", "bailianSource", "cosyvoice")).block();
        assertThat(service.resolve(new PodcastSettings()).block().getBailian().getApiKey()).isNull();
        assertThat(service.resolve(new PodcastSettings()).block().getCosyvoice().getApiKey()).isEqualTo("cosy-secret");
        assertThatThrownBy(() -> service.save(Map.of("bailianSource", "doubao")).block())
            .hasMessageContaining("密钥格式");
    }
}
