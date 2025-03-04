package com.handsome.summary.factory;

import com.handsome.summary.annotation.AIProvider;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AI处理器自动注册工厂
 *
 * <p>功能特性：
 * 1. 自动发现所有带@AIProvider注解的Bean
 * 2. 维护系统名称与处理器的映射关系
 * 3. 提供处理器查找服务
 *
 * @see AIProvider 处理器标识注解
 */
@Component
public class AIHandlerFactory implements ApplicationContextAware {
    // 处理器缓存: <系统名称, 处理器实例>
    private final Map<String, Object> handlers = new ConcurrentHashMap<>();

    @Override
    public void setApplicationContext(ApplicationContext context) throws BeansException {
        context.getBeansWithAnnotation(AIProvider.class).forEach((beanName, bean) -> {
            AIProvider annotation = bean.getClass().getAnnotation(AIProvider.class);
            String systemName = annotation.value();

            if (handlers.containsKey(systemName)) {
                throw new IllegalStateException("重复的AI系统名称: " + systemName);
            }

            handlers.put(systemName, bean);
        });
    }

    /**
     * 获取处理器实例
     *
     * @param systemName 系统名称（必须与@AIProvider的value值完全匹配）
     * @return 对应的处理器实例
     * @throws IllegalArgumentException 找不到处理器时抛出
     */
    @SuppressWarnings("unchecked")
    public <T> T getHandler(String systemName) {
        if (!handlers.containsKey(systemName)) {
            throw new IllegalArgumentException("未注册的AI系统: " + systemName);
        }
        return (T) handlers.get(systemName);
    }
}
