package com.handsome.summary.pet.model;

public record PetdexCatalogItem(
    String slug,
    String displayName,
    String kind,
    String submittedBy,
    String installScriptUrl,
    String spritesheetUrl,
    String petJsonUrl,
    String zipUrl
) {
}
