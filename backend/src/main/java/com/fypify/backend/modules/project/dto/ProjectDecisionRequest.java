package com.fypify.backend.modules.project.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

/**
 * Request DTO for approving or rejecting a project.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDecisionRequest {
    
    @NotNull(message = "Decision (approve/reject) is required")
    private Boolean approve;
    
    /**
     * Supervisor ID to assign (required if approving).
     */
    private UUID supervisorId;
    
    /**
     * Reason for rejection (required if rejecting).
     */
    @Size(max = 1000, message = "Rejection reason must be at most 1000 characters")
    private String rejectionReason;
}
