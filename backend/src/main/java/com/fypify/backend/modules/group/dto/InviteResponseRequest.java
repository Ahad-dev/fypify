package com.fypify.backend.modules.group.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO for responding to a group invite.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteResponseRequest {
    
    @NotNull(message = "Accept/decline decision is required")
    private Boolean accept;
}
