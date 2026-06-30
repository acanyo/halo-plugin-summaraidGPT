package com.handsome.summary.pet.model;

import java.util.List;

public record PetdexCatalogResponse(
    String generatedAt,
    int total,
    List<PetdexCatalogItem> items
) {
}
