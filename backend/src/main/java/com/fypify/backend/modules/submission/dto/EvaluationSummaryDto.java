package com.fypify.backend.modules.submission.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for evaluation summary of a submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationSummaryDto {

    private UUID submissionId;
    private String submissionStatus;
    
    /**
     * Total number of evaluators who have submitted marks.
     */
    private int totalEvaluations;
    
    /**
     * Number of evaluators who have finalized their marks.
     */
    private int finalizedEvaluations;
    
    /**
     * Average score of finalized evaluations (null if none finalized).
     */
    private BigDecimal averageScore;
    
    /**
     * List of all evaluation marks.
     */
    private List<EvaluationMarksDto> evaluations;
    
    /**
     * Whether all evaluations are finalized.
     */
    private boolean allFinalized;
}
