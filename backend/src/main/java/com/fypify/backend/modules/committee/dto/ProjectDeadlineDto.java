package com.fypify.backend.modules.committee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for ProjectDeadline entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDeadlineDto {
    private UUID id;
    private UUID batchId;
    private UUID documentTypeId;
    private String documentTypeCode;
    private String documentTypeTitle;
    private Instant deadlineDate;
    private Integer sortOrder;
    private Boolean isPast;
    private Instant createdAt;
}
