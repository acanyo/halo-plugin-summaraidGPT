package com.handsome.summary.ai.service.impl;

import com.handsome.summary.ai.extension.AiCallLog;
import com.handsome.summary.ai.model.AiCallLogRecord;
import com.handsome.summary.ai.service.AiCallLogService;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import run.halo.app.extension.Metadata;
import run.halo.app.extension.ReactiveExtensionClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultAiCallLogService implements AiCallLogService {

    private static final int MAX_ERROR_MESSAGE_LENGTH = 1000;
    private static final int MAX_METADATA_VALUE_LENGTH = 500;

    private final ReactiveExtensionClient client;

    @Override
    public void record(AiCallLogRecord record) {
        if (record == null) {
            return;
        }
        client.create(toExtension(record))
            .doOnError(error -> log.warn("Failed to persist AI call log: {}", error.getMessage()))
            .onErrorResume(error -> reactor.core.publisher.Mono.empty())
            .subscribe();
    }

    private AiCallLog toExtension(AiCallLogRecord record) {
        var callLog = new AiCallLog();
        var metadata = new Metadata();
        metadata.setName("ai-call-" + UUID.randomUUID().toString().toLowerCase(Locale.ROOT));
        callLog.setMetadata(metadata);

        var spec = new AiCallLog.Spec();
        spec.setOperation(blankToDefault(record.getOperation(), "unknown"));
        spec.setModelType(blankToDefault(record.getModelType(), "unknown"));
        spec.setModelName(blankToDefault(record.getModelName(), "<default>"));
        spec.setSuccess(Boolean.TRUE.equals(record.getSuccess()));
        spec.setStartedAt(record.getStartedAt() == null ? Instant.now() : record.getStartedAt());
        spec.setDurationMillis(nonNegative(record.getDurationMillis()));
        spec.setInputCount(nonNegative(record.getInputCount()));
        spec.setInputChars(nonNegative(record.getInputChars()));
        spec.setMaxInputChars(nonNegative(record.getMaxInputChars()));
        spec.setOutputCount(nonNegative(record.getOutputCount()));
        spec.setOutputChars(nonNegative(record.getOutputChars()));
        spec.setMaxOutputChars(nonNegative(record.getMaxOutputChars()));
        spec.setCandidateCount(nonNegative(record.getCandidateCount()));
        spec.setSourceCount(nonNegative(record.getSourceCount()));
        spec.setErrorType(trimToNull(record.getErrorType()));
        spec.setErrorMessage(truncate(trimToNull(record.getErrorMessage()), MAX_ERROR_MESSAGE_LENGTH));
        spec.setMetadata(sanitizeMetadata(record.getMetadata()));
        callLog.setSpec(spec);
        return callLog;
    }

    private Map<String, String> sanitizeMetadata(Map<String, String> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return Map.of();
        }
        return metadata.entrySet().stream()
            .filter(entry -> StringUtils.hasText(entry.getKey()) && entry.getValue() != null)
            .collect(java.util.stream.Collectors.toMap(
                entry -> truncate(entry.getKey().strip(), 80),
                entry -> truncate(entry.getValue(), MAX_METADATA_VALUE_LENGTH),
                (left, right) -> left
            ));
    }

    private String blankToDefault(String value, String defaultValue) {
        return StringUtils.hasText(value) ? value.strip() : defaultValue;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.strip() : null;
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private Integer nonNegative(Integer value) {
        return value == null ? null : Math.max(0, value);
    }

    private Long nonNegative(Long value) {
        return value == null ? null : Math.max(0, value);
    }
}
