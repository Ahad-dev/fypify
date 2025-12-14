package com.fypify.backend.modules.group.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a group invite.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupInviteDto {
    private UUID id;
    private UUID groupId;
    private String groupName;
    private UUID inviterId;
    private String inviterName;
    private UUID inviteeId;
    private String inviteeName;
    private String inviteeEmail;
    private String status;
    private String message;
    private Instant createdAt;
    private Instant respondedAt;
    private Instant expiresAt;
}
