package com.handsome.summary.pet.support;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PetdexProxyUrlResolverTest {

    private final PetdexProxyUrlResolver resolver = new PetdexProxyUrlResolver(null);

    @Test
    void rewritesDomainOnlyProxyToSamePath() {
        var url = resolver.publicUrl(
            "https://assets.petdex.dev/pets/iikun/sprite.webp",
            "petdex-proxy.example.com"
        );

        assertThat(url).isEqualTo("https://petdex-proxy.example.com/pets/iikun/sprite.webp");
    }

    @Test
    void supportsPrefixProxyTemplate() {
        var url = resolver.publicUrl(
            "https://assets.petdex.dev/pets/iikun/sprite.webp",
            "https://proxy.example.com/{url}"
        );

        assertThat(url).isEqualTo(
            "https://proxy.example.com/https://assets.petdex.dev/pets/iikun/sprite.webp"
        );
    }

    @Test
    void leavesNonPetdexUrlsUnchanged() {
        var url = resolver.publicUrl(
            "/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp",
            "https://petdex-proxy.example.com"
        );

        assertThat(url).isEqualTo(
            "/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp"
        );
    }
}
