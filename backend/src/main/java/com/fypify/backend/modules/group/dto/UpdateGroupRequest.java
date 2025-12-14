package com.fypify.backend.modules.group.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request DTO for updating a group.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateGroupRequest {
    
    @Size(min = 3, max = 200, message = "Group name must be between 3 and 200 characters")
    private String name;
}
