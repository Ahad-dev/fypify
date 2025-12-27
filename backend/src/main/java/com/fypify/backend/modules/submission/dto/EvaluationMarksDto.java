package com.fypify.backend.modules.submission.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing evaluation marks given by a committee member.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationMarksDto {

    private UUID id;
    private UUID submissionId;
    private UUID evaluatorId;
    private String evaluatorName;
    private BigDecimal score;
    private String comments;
    private Boolean isFinal;
    private Instant createdAt;
    private Instant updatedAt;
}
