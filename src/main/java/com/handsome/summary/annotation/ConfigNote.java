package com.handsome.summary.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 配置项说明注解（嵌套使用）
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({})
public @interface ConfigNote {
    String key();
    String description();
    boolean required() default true;
    Class<?> type() default String.class;
}