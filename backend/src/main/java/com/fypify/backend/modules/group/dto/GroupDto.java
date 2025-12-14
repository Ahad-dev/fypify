package com.fypify.backend.modules.group.dto;

import com.fypify.backend.modules.user.dto.UserDto;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing a student group.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDto {
    private UUID id;
    private String name;
    private UserDto leader;
    private List<GroupMemberDto> members;
    private int memberCount;
    private boolean hasProject;
    private UUID projectId;
    private Instant createdAt;
}
