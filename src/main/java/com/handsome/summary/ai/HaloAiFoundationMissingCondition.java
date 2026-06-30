package com.handsome.summary.ai;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

class HaloAiFoundationMissingCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return !HaloAiFoundationAvailability.isClassPresent(context.getClassLoader());
    }
}
