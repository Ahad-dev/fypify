package com.fypify.backend.modules.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for creating a new group.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGroupRequest {
    
    @NotBlank(message = "Group name is required")
    @Size(min = 3, max = 200, message = "Group name must be between 3 and 200 characters")
    private String name;
    
    /**
     * Optional list of student IDs to invite immediately.
     */
    private List<UUID> inviteMemberIds;
}
