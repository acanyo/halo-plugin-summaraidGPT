package com.handsome.summary.rag.service;

import java.util.List;

public interface RagContentService {

    String normalize(String content);

    String hash(String content);

    List<String> split(String title, String content, int chunkSize, int chunkOverlap);
}
