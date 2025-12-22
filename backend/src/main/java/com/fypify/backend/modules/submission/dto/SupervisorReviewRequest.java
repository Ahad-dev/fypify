package com.fypify.backend.modules.submission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO for supervisor review of a submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorReviewRequest {
    
    @NotNull(message = "Approval status is required")
    private Boolean approve;
    
    /**
     * Required when approve = false (revision requested).
     */
    private String feedback;
}

