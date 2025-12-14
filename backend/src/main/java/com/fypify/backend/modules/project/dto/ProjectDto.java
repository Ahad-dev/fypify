package com.fypify.backend.modules.project.dto;

import com.fypify.backend.modules.group.dto.GroupDto;
import com.fypify.backend.modules.project.entity.ProjectStatus;
import com.fypify.backend.modules.user.dto.UserDto;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO representing a project.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private UUID id;
    private String title;
    private String projectAbstract;
    private String domain;
    private List<UUID> proposedSupervisors;
    private List<UserDto> proposedSupervisorDetails;
    private UserDto supervisor;
    private ProjectStatus status;
    private String statusDisplay;
    private UserDto approvedBy;
    private Instant approvedAt;
    private String rejectionReason;
    private UUID groupId;
    private String groupName;
    private GroupDto group;
    private Instant createdAt;
    private Instant updatedAt;
}
