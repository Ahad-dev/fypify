package com.fypify.backend.modules.submission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

/**
 * DTO for creating a new document submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSubmissionRequest {
    
    @NotNull(message = "Document type ID is required")
    private UUID documentTypeId;
    
    @NotNull(message = "File ID is required")
    private UUID fileId;
    
    private String comments;
}

