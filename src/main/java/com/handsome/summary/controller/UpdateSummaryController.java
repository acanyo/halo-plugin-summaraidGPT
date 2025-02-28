package com.handsome.summary.controller;

import com.handsome.summary.service.InitSummaryService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.content.Post;
import run.halo.app.plugin.ApiVersion;

@ApiVersion("v1alpha1")
@RestController
@RequestMapping("/summary")
@AllArgsConstructor
public class UpdateSummaryController {
    private final InitSummaryService initSvc;
    @PutMapping("/update")
    public Mono<Void> updateSummary(@RequestBody Post post) {
        return initSvc.initSummary(post).then();
    }
}
