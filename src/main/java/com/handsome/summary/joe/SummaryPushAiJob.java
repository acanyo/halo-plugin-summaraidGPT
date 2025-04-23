package com.handsome.summary.joe;

import com.handsome.summary.service.InitSummaryService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

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
    // @Scheduled(cron = "0 0/30 * * * ?")
    // public void updateSummary() {
    //     initSvc.initSummary();
    // }
}
