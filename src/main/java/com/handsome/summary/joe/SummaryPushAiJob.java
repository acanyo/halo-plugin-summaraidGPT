package com.handsome.summary.joe;

import com.handsome.summary.entity.TokenSub;
import com.handsome.summary.service.ChatService;
import com.handsome.summary.service.InitSummaryService;
import com.handsome.summary.service.impl.InitSummaryServiceImpl;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.content.PostContentService;
import run.halo.app.core.extension.content.Post;
import run.halo.app.extension.ListOptions;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.index.query.Query;
import run.halo.app.extension.index.query.QueryFactory;

import java.time.Duration;

import static run.halo.app.extension.index.query.QueryFactory.and;
import static run.halo.app.extension.index.query.QueryFactory.equal;
import static run.halo.app.extension.index.query.QueryFactory.notEqual;

@Component
@EnableScheduling
@AllArgsConstructor
@Slf4j
public class SummaryPushAiJob {
    private final InitSummaryService initSvc;
    /**
     * 每30分钟更新一次摘要
     * Handsome
     */
    @Scheduled(cron = "0 0/30 * * * ?")
    public void updateSummary() {
        initSvc.initSummary();
    }
}
