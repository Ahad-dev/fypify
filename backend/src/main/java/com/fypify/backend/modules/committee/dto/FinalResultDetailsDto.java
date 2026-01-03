package com.fypify.backend.modules.committee.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for FinalResult details (stored as JSONB).
 * Contains per-document breakdown and metadata.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalResultDetailsDto {

    /**
     * Per-document score breakdown.
     */
    private List<DocumentScoreBreakdown> documents;
    
    /**
     * Total weighted score.
     */
    private BigDecimal totalScore;
    
    /**
     * When the result was computed.
     */
    private Instant computedAt;
    
    /**
     * Who computed the result.
     */
    private UUID computedById;
    private String computedByName;

    /**
     * Score breakdown for a single document type.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentScoreBreakdown {
        
        private UUID submissionId;
        private String docTypeCode;
        private String docTypeTitle;
        
        /**
         * Supervisor's score for this document.
         */
        private BigDecimal supervisorScore;
        
        /**
         * Weight assigned to supervisor (e.g., 20).
         */
        private Integer supervisorWeight;
        
        /**
         * Average score from all evaluation committee members.
         */
        private BigDecimal committeeAvgScore;
        
        /**
         * Weight assigned to committee (e.g., 80).
         */
        private Integer committeeWeight;
        
        /**
         * Number of committee evaluators.
         */
        private Integer committeeEvaluatorCount;
        
        /**
         * Final weighted score for this document.
         * = (supervisorScore * supervisorWeight + committeeAvgScore * committeeWeight) / 100
         */
        private BigDecimal weightedScore;
    }
}
