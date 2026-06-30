package com.handsome.summary.pet.service;

import com.handsome.summary.pet.model.PetdexCatalogResponse;
import reactor.core.publisher.Mono;

public interface PetdexCatalogService {

    Mono<PetdexCatalogResponse> list();
}
