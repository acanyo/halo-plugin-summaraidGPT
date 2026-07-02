package com.handsome.summary.pet.service;

import com.handsome.summary.pet.model.SavePetCompanionCommand;
import reactor.core.publisher.Mono;

public interface PetCompanionAssetStorageService {

    Mono<SavePetCompanionCommand> localizePetdexAssets(SavePetCompanionCommand command);
}
