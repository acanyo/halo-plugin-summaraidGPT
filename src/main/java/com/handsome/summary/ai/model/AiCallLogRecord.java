package com.handsome.summary.ai.model;

import java.time.Instant;
import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class AiCallLogRecord {
    String operation;
    String modelType;
    String modelName;
    Boolean success;
    Instant startedAt;
    Long durationMillis;
    Integer inputCount;
    Long inputChars;
    Integer maxInputChars;
    Integer outputCount;
    Long outputChars;
    Integer maxOutputChars;
    Integer candidateCount;
    Integer sourceCount;
    String errorType;
    String errorMessage;
    Map<String, String> metadata;
}
