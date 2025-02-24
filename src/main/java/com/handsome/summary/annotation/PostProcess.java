package com.handsome.summary.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PostProcess {
    /**
     * 执行阶段
     */
    Phase phase();

    /**
     * 执行顺序
     */
    int order() default 0;

    enum Phase {
        HANDLE,    // 处理阶段
        PROCESS    // 处理后阶段
    }
}