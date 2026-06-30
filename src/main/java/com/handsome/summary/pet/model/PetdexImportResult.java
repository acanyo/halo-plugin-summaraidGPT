package com.handsome.summary.pet.model;

public record PetdexImportResult(
    String petdexId,
    String displayName,
    String description,
    String installScriptUrl,
    String petJsonUrl,
    String spritesheetUrl
) {
}
