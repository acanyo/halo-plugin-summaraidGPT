package com.handsome.summary.entity;

import static io.swagger.v3.oas.annotations.media.Schema.RequiredMode.REQUIRED;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@EqualsAndHashCode(callSuper = true)
@GVK(kind = "TokenSub", group = "handsome.lik.cc", version = "v1alpha1", singular = "tokensub", plural = "tokensub")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TokenSub extends AbstractExtension {

    @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
    private Spec spec;

    @Data
    @Schema(name = "TokenSubSpec")
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Spec {
        @Schema(requiredMode = REQUIRED)
        private String accessToken;
        @Schema(requiredMode = REQUIRED)
        private Long expiresIn;
        @Schema(requiredMode = REQUIRED)
        private String clientId;
        @Schema(requiredMode = REQUIRED)
        private String clientSecret;
    }
}
