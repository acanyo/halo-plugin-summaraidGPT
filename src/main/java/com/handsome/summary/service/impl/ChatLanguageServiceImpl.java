package com.handsome.summary.service.impl;

import com.handsome.summary.service.AiService;
import com.handsome.summary.service.ChatLanguageService;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.Objects;

@Component
@Slf4j
public class ChatLanguageServiceImpl implements ChatLanguageService {
    private AiService aiSvc;
    @Override
    public ChatLanguageModel model(String role, String content) {
        UserMessage userMessage = UserMessage.from(
            TextContent.from(role),
            TextContent.from(content)
        );
        return null;
    }
}
