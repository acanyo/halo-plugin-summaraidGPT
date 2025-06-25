package com.handsome.summary.util;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GlobalCacheUtil {
    // 使用 ConcurrentHashMap 存储推送缓存（Key: 唯一标识，Value: 推送信息）
    private static final Map<String, String> PUSH_CACHE = new ConcurrentHashMap<>();

    /**
     * 获取缓存中的推送信息
     * @param key 推送的唯一标识
     * @return 如果存在且未过期，返回推送信息；否则返回 null
     */
    public static String get(String key) {
        return PUSH_CACHE.get(key);
    }

    /**
     * 添加或更新缓存
     * @param key 推送的唯一标识
     * @param token 推送信息
     */
    public static void put(String key, String token) {
        PUSH_CACHE.put(key, token);
    }

    /**
     * 移除缓存
     * @param key 推送的唯一标识
     */
    public static void remove(String key) {
        PUSH_CACHE.remove(key);
    }

    /**
     * 清理所有过期缓存
     */
    public static void cleanupExpired() {
        PUSH_CACHE.entrySet().clear();
    }
}
