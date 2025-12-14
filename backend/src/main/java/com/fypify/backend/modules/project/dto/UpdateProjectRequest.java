package com.fypify.backend.modules.project.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for updating a project.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProjectRequest {
    
    @Size(min = 5, max = 400, message = "Title must be between 5 and 400 characters")
    private String title;
    
    @Size(max = 5000, message = "Abstract must be at most 5000 characters")
    private String projectAbstract;
    
    @Size(max = 200, message = "Domain must be at most 200 characters")
    private String domain;
    
    /**
     * List of proposed supervisor IDs.
     */
    private List<UUID> proposedSupervisors;
}
