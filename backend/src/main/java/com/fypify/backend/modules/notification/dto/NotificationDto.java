package com.fypify.backend.modules.notification.dto;

import com.fypify.backend.modules.notification.entity.NotificationType;
import lombok.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * DTO representing a notification.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String typeDisplay;
    private String title;
    private String message;
    private Map<String, Object> payload;
    private boolean isRead;
    private Instant createdAt;
}
