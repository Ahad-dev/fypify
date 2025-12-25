package com.fypify.backend.modules.submission.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
     * Also used as private comments when approving with marks.
     */
    private String feedback;

    /**
     * Supervisor marks (0-100). Required when approving after deadline.
     */
    @Min(value = 0, message = "Marks must be at least 0")
    @Max(value = 100, message = "Marks cannot exceed 100")
    private Integer marks;
}

