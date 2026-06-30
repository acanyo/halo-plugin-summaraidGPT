package com.handsome.summary.pet.extension;

import static com.handsome.summary.pet.extension.PetCompanion.KIND;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import run.halo.app.core.extension.content.Constant;
import run.halo.app.extension.AbstractExtension;
import run.halo.app.extension.GVK;

@Data
@ToString(callSuper = true)
@GVK(kind = KIND, group = "summaraidgpt.lik.cc",
    version = Constant.VERSION, singular = "petcompanion", plural = "petcompanions")
@EqualsAndHashCode(callSuper = true)
public class PetCompanion extends AbstractExtension {

    public static final String KIND = "PetCompanion";

    private Spec spec;

    private Status status;

    @Data
    public static class Spec {
        @Schema(description = "Display name")
        private String displayName;

        @Schema(description = "Description")
        private String description;

        @Schema(description = "Pet source type")
        private String source = "PETDEX";

        @Schema(description = "PetDex id")
        private String petdexId;

        @Schema(description = "Original install command pasted by the user")
        private String installCommand;

        @Schema(description = "PetDex install script URL")
        private String installScriptUrl;

        @Schema(description = "Remote pet.json URL")
        private String petJsonUrl;

        @Schema(description = "Remote spritesheet URL")
        private String spritesheetUrl;

        @Schema(description = "Whether this pet can be used on the theme side")
        private Boolean enabled = true;

        @Schema(description = "Whether this pet is the active floating assistant pet")
        private Boolean active = false;
    }

    @Data
    public static class Status {
        private Instant importedAt;
        private Instant updatedAt;
        private String errorMessage;
    }
}
