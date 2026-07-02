package com.handsome.summary.pet.model;

public record PetdexCatalogItem(
    String slug,
    String displayName,
    String kind,
    String submittedBy,
    String installScriptUrl,
    String spritesheetUrl,
    String petJsonUrl,
    String zipUrl,
    String publicInstallScriptUrl,
    String publicSpritesheetUrl,
    String publicPetJsonUrl,
    String publicZipUrl
) {
}
