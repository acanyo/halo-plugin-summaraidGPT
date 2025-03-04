package com.handsome.summary.annotation;

import java.lang.annotation.Documented;
import org.springframework.stereotype.Component;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * AI服务提供商标识注解
 * 使用说明：
 * 1. 必须标注在AIHandler实现类上
 * 2. value值对应配置中的syName字段
 * 3. 系统启动时自动注册处理器
 * 示例：
 * @AIProvider(value = "OpenAI",
 *     configNotes = {
 *         @ConfigNote(key = "apiKey", description = "OpenAI API密钥"),
 *         @ConfigNote(key = "organization", description = "组织ID", required = false)
 *     })
 */

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface AIProvider {
    /**
     * 系统唯一标识（必须与配置中的SystemName完全匹配）
     */
    String value();

    /**
     * 配置要求说明
     */
    ConfigNote[] configNotes() default {};
}
