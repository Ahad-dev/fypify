package com.fypify.backend.modules.submission.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for supervisor marks on a submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorMarksDto {
    private UUID id;
    private UUID submissionId;
    private UUID supervisorId;
    private String supervisorName;
    private BigDecimal score;
    private Instant createdAt;
}
