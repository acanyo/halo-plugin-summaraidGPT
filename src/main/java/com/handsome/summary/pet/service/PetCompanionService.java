package com.handsome.summary.pet.service;

import com.handsome.summary.pet.extension.PetCompanion;
import com.handsome.summary.pet.model.SavePetCompanionCommand;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PetCompanionService {

    Flux<PetCompanion> list();

    Mono<PetCompanion> getActive();

    Mono<PetCompanion> save(SavePetCompanionCommand command);

    Mono<PetCompanion> importFromPetdex(String installCommand, Boolean enabled, Boolean active);

    Mono<PetCompanion> setActive(String name);

    Mono<PetCompanion> updateStatus(String name, Boolean enabled);

    Mono<Void> delete(String name);
}
