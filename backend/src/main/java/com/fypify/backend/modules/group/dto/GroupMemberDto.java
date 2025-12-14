package com.fypify.backend.modules.group.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a group member.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberDto {
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private boolean isLeader;
    private Instant joinedAt;
}
