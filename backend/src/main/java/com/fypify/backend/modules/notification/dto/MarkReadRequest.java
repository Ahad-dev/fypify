package com.fypify.backend.modules.notification.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for marking notifications as read.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkReadRequest {
    
    @NotEmpty(message = "At least one notification ID is required")
    private List<UUID> notificationIds;
}
