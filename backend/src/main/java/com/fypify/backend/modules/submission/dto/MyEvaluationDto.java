package com.fypify.backend.modules.submission.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for evaluations with submission details for the "My Evaluations" page.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyEvaluationDto {

    private UUID id;
    private UUID submissionId;
    private BigDecimal score;
    private String comments;
    private Boolean isFinal;
    private Instant createdAt;
    
    // Submission details
    private UUID projectId;
    private String projectTitle;
    private String documentTypeCode;
    private String documentTypeTitle;
    private Integer version;
    private String uploadedByName;
    private Instant uploadedAt;
    private String fileUrl;
}
