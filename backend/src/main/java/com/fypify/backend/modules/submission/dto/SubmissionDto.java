package com.fypify.backend.modules.submission.dto;

import com.fypify.backend.modules.file.dto.FileUploadResponse;
import com.fypify.backend.modules.submission.entity.SubmissionStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a document submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDto {
    
    private UUID id;
    private UUID projectId;
    private String projectTitle;
    private UUID documentTypeId;
    private String documentTypeCode;
    private String documentTypeTitle;
    private Integer version;
    private FileUploadResponse file;
    private UUID uploadedById;
    private String uploadedByName;
    private Instant uploadedAt;
    private SubmissionStatus status;
    private String statusDisplay;
    private Boolean isFinal;
    private Instant supervisorReviewedAt;
    private String comments;
    
    // Computed fields
    private Boolean canEdit;
    private Boolean canMarkFinal;
    private Boolean isLocked;
}

