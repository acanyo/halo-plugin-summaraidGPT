package com.handsome.summary.service;

import dev.langchain4j.model.chat.ChatLanguageModel;

public interface ChatLanguageService {
    ChatLanguageModel model(String role, String content);

}
