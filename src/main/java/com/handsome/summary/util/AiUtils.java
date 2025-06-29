package com.handsome.summary.util;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

/**
 * AI工具类
 * 展示JDK21的各种新特性
 *
 * @author handsome
 */
@Slf4j
public class AiUtils {

    /**
     * 使用虚拟线程执行异步任务
     */
    public static CompletableFuture<String> executeWithVirtualThread(Runnable task) {
        return CompletableFuture.runAsync(task, Executors.newVirtualThreadPerTaskExecutor())
            .thenApply(v -> "任务执行完成");
    }

    /**
     * 使用序列化集合进行批量处理
     */
    public static List<String> batchProcess(List<String> items) {
        return items.parallelStream()
            .map(item -> "处理: " + item)
            .toList();
    }

    /**
     * 使用模式匹配进行类型检查
     */
    public static String processObject(Object obj) {
        return switch (obj) {
            case String s -> "字符串: " + s;
            case Integer i -> "整数: " + i;
            case List<?> list -> "列表，大小: " + list.size();
            case null -> "空值";
            default -> "未知类型: " + obj.getClass().getSimpleName();
        };
    }

    /**
     * 使用增强的switch表达式进行字符串处理
     */
    public static String processAiModel(String modelType) {
        return switch (modelType.toLowerCase()) {
            case "openai", "gpt" -> "OpenAI模型";
            case "zhipu", "glm" -> "智谱AI模型";
            case "qwen", "dashscope" -> "通义千问模型";
            case String s when s.contains("custom") -> "自定义模型: " + s;
            default -> "未知模型类型: " + modelType;
        };
    }
} 