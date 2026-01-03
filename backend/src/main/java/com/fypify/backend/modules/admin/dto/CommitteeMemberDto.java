package com.fypify.backend.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for committee member information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeMemberDto {
    private UUID userId;
    private String fullName;
    private String email;
    private String role;
    private Instant addedAt;
}
