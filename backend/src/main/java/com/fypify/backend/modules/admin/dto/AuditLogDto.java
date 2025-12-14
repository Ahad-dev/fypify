package com.fypify.backend.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for AuditLog response data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {

    private UUID id;
    private UUID actorId;
    private String actorName;
    private String actorEmail;
    private String action;
    private Map<String, Object> details;
    private String entityType;
    private UUID entityId;
    private String ipAddress;
    private Instant createdAt;
}
