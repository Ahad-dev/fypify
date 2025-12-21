package com.fypify.backend.modules.committee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for approving a project.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveProjectRequest {

    @NotNull(message = "Supervisor ID is required")
    private UUID supervisorId;

    @Size(max = 500, message = "Comments must not exceed 500 characters")
    private String comments;
}
