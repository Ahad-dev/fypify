package com.fypify.backend.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for DocumentType response data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeDto {

    private UUID id;
    private String code;
    private String title;
    private String description;
    private Integer weightSupervisor;
    private Integer weightCommittee;
    private Integer displayOrder;
    private Boolean isActive;
    private Instant createdAt;
}
