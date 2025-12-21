package com.fypify.backend.modules.committee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for DeadlineBatch entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeadlineBatchDto {
    private UUID id;
    private String name;
    private String description;
    private Instant appliesFrom;
    private Instant appliesUntil;
    private Boolean isActive;
    private UUID createdById;
    private String createdByName;
    private List<ProjectDeadlineDto> deadlines;
    private Instant createdAt;
    private Instant updatedAt;
}
