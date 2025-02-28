/*
package com.handsome.summary.extension;

import com.handsome.summary.service.ChatService;
import lombok.AllArgsConstructor;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.content.ExcerptGenerator;

*/
/**
 * Implementing an Article Summary Interface Generator
 * @author: webjing
 * @date: 2025年02月22日 22:16
 *//*

@Component
@AllArgsConstructor
public class PostExcerptAiGenerator implements ExcerptGenerator {

    private final ChatService chatService;

    @Override
    public Mono<String> generate(Context context) {
        return chatService.getSummary(Jsoup.parse(context.getContent()).text());
    }
}
*/
