package com.handsome.summary.pet.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.handsome.summary.pet.model.SavePetCompanionCommand;
import com.handsome.summary.pet.support.PetdexProxyUrlResolver;
import com.handsome.summary.service.SettingConfigGetter;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.service.AttachmentService;

class DefaultPetCompanionAssetStorageServiceTest {

    private final SettingConfigGetter settingConfigGetter =
        org.mockito.Mockito.mock(SettingConfigGetter.class);
    private final PetdexProxyUrlResolver petdexProxyUrlResolver =
        org.mockito.Mockito.mock(PetdexProxyUrlResolver.class);
    private final AttachmentService attachmentService =
        org.mockito.Mockito.mock(AttachmentService.class);
    private final DefaultPetCompanionAssetStorageService service =
        new DefaultPetCompanionAssetStorageService(settingConfigGetter, petdexProxyUrlResolver,
            attachmentService);

    @Test
    void leavesCommandUnchangedWhenStorageDisabled() {
        var command = command();
        when(settingConfigGetter.getAssistantConfig()).thenReturn(Mono.just(assistantConfig(false,
            "")));

        var result = service.localizePetdexAssets(command).block();

        assertThat(result).isSameAs(command);
        verifyNoInteractions(attachmentService);
    }

    @Test
    void requiresStoragePolicyWhenStorageEnabled() {
        when(settingConfigGetter.getAssistantConfig()).thenReturn(Mono.just(assistantConfig(true,
            "")));

        assertThatThrownBy(() -> service.localizePetdexAssets(command()).block())
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("存储策略");
        verifyNoInteractions(attachmentService);
    }

    private SettingConfigGetter.AssistantConfig assistantConfig(boolean enabled, String policyName) {
        var storage = new SettingConfigGetter.PetdexAttachmentStorageConfig();
        storage.setEnabled(enabled);
        storage.setPolicyName(policyName);
        var assistant = new SettingConfigGetter.AssistantConfig();
        assistant.setPetdexAttachmentStorage(storage);
        return assistant;
    }

    private SavePetCompanionCommand command() {
        return new SavePetCompanionCommand(
            "pet-iikun",
            "iikun",
            null,
            "PETDEX",
            "iikun",
            null,
            "https://petdex.dev/install/iikun",
            "https://assets.petdex.dev/pets/iikun/petjson.json",
            "https://assets.petdex.dev/pets/iikun/sprite.webp",
            true,
            true
        );
    }
}
