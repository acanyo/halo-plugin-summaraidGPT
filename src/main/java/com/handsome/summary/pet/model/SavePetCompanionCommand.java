package com.handsome.summary.pet.model;

public record SavePetCompanionCommand(
    String name,
    String displayName,
    String description,
    String source,
    String petdexId,
    String installCommand,
    String installScriptUrl,
    String petJsonUrl,
    String spritesheetUrl,
    Boolean enabled,
    Boolean active
) {
}
