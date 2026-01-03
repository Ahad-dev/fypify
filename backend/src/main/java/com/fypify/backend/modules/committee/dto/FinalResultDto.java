package com.fypify.backend.modules.committee.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO for FinalResult response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalResultDto {
    
    private Long id;
    private UUID projectId;
    private String projectTitle;
    private BigDecimal totalScore;
    private FinalResultDetailsDto details;
    private Boolean released;
    private UUID releasedById;
    private String releasedByName;
    private Instant releasedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
