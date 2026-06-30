package com.handsome.summary.pet.service;

import com.handsome.summary.pet.model.PetdexImportResult;
import reactor.core.publisher.Mono;

public interface PetdexImportService {

    Mono<PetdexImportResult> resolve(String installCommand);
}
