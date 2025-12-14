package com.fypify.backend.modules.group.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

/**
 * Request DTO for sending a group invite.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendInviteRequest {
    
    @NotNull(message = "Invitee ID is required")
    private UUID inviteeId;
    
    @Size(max = 500, message = "Message must be at most 500 characters")
    private String message;
}
