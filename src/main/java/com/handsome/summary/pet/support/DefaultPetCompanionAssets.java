package com.handsome.summary.pet.support;

import com.handsome.summary.pet.extension.PetCompanion;

public final class DefaultPetCompanionAssets {

    public static final String NAME = "pet-ikun-pet";
    public static final String DISPLAY_NAME = "鸡哥ikun";
    public static final String DESCRIPTION = "默认 Codex 宠物形象";
    public static final String SOURCE = "BUNDLED";
    public static final String PETDEX_ID = "ikun-pet";
    public static final String PET_JSON_URL =
        "/plugins/summaraidGPT/assets/static/pets/default-ikun/pet.json";
    public static final String SPRITESHEET_URL =
        "/plugins/summaraidGPT/assets/static/pets/default-ikun/spritesheet.webp";

    private DefaultPetCompanionAssets() {
    }

    public static PetCompanion.Spec newSpec(boolean active) {
        var spec = new PetCompanion.Spec();
        spec.setDisplayName(DISPLAY_NAME);
        spec.setDescription(DESCRIPTION);
        spec.setSource(SOURCE);
        spec.setPetdexId(PETDEX_ID);
        spec.setPetJsonUrl(PET_JSON_URL);
        spec.setSpritesheetUrl(SPRITESHEET_URL);
        spec.setEnabled(true);
        spec.setActive(active);
        return spec;
    }
}
