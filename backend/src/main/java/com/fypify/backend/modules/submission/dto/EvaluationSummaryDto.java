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
     * Total number of evaluation committee members who should evaluate.
     */
    private int totalRequiredEvaluators;
    
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
     * List of evaluators who haven't submitted yet.
     */
    private List<PendingEvaluatorDto> pendingEvaluators;
    
    /**
     * Whether all required evaluations are finalized.
     */
    private boolean allFinalized;
    
    /**
     * Whether all committee members have evaluated (regardless of finalization).
     */
    private boolean allEvaluated;
    
    /**
     * Supervisor marks for this submission (null if not marked).
     */
    private SupervisorMarksDto supervisorMarks;
    
    /**
     * Whether supervisor has submitted marks.
     */
    private boolean supervisorMarked;
}
