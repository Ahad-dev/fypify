package com.fypify.backend.modules.notification.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Notification entity representing a user notification.
 * Maps to the 'notifications' table.
 */
@Entity
@Table(name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_user", columnList = "user_id"),
        @Index(name = "idx_notifications_type", columnList = "type"),
        @Index(name = "idx_notifications_read", columnList = "user_id, is_read")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 80)
    private NotificationType type;

    /**
     * JSON payload containing additional notification data.
     * Can include project_id, group_id, message, etc.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // Helper methods

    /**
     * Mark the notification as read.
     */
    public void markAsRead() {
        this.isRead = true;
    }

    /**
     * Mark the notification as unread.
     */
    public void markAsUnread() {
        this.isRead = false;
    }

    /**
     * Get a value from the payload.
     */
    @SuppressWarnings("unchecked")
    public <T> T getPayloadValue(String key) {
        if (payload == null) return null;
        return (T) payload.get(key);
    }

    /**
     * Get the message from the payload.
     */
    public String getMessage() {
        return getPayloadValue("message");
    }

    /**
     * Get the title from the payload.
     */
    public String getTitle() {
        return getPayloadValue("title");
    }

    // Static factory methods for common notification types

    public static Notification groupInviteReceived(User recipient, UUID groupId, String groupName, User inviter) {
        return Notification.builder()
                .user(recipient)
                .type(NotificationType.GROUP_INVITE_RECEIVED)
                .payload(Map.of(
                    "group_id", groupId.toString(),
                    "group_name", groupName,
                    "inviter_id", inviter.getId().toString(),
                    "inviter_name", inviter.getFullName(),
                    "title", "Group Invitation",
                    "message", String.format("%s has invited you to join group '%s'", inviter.getFullName(), groupName)
                ))
                .build();
    }

    public static Notification projectRegistered(User recipient, UUID projectId, String projectTitle, UUID groupId) {
        return Notification.builder()
                .user(recipient)
                .type(NotificationType.PROJECT_REGISTERED)
                .payload(Map.of(
                    "project_id", projectId.toString(),
                    "project_title", projectTitle,
                    "group_id", groupId.toString(),
                    "title", "New Project Registration",
                    "message", String.format("Project '%s' has been registered and is pending approval", projectTitle)
                ))
                .build();
    }

    public static Notification projectApproved(User recipient, UUID projectId, String projectTitle, User supervisor) {
        return Notification.builder()
                .user(recipient)
                .type(NotificationType.PROJECT_APPROVED)
                .payload(Map.of(
                    "project_id", projectId.toString(),
                    "project_title", projectTitle,
                    "supervisor_id", supervisor != null ? supervisor.getId().toString() : "",
                    "supervisor_name", supervisor != null ? supervisor.getFullName() : "",
                    "title", "Project Approved",
                    "message", String.format("Your project '%s' has been approved", projectTitle)
                ))
                .build();
    }

    public static Notification projectRejected(User recipient, UUID projectId, String projectTitle, String reason) {
        return Notification.builder()
                .user(recipient)
                .type(NotificationType.PROJECT_REJECTED)
                .payload(Map.of(
                    "project_id", projectId.toString(),
                    "project_title", projectTitle,
                    "reason", reason != null ? reason : "",
                    "title", "Project Rejected",
                    "message", String.format("Your project '%s' has been rejected. Reason: %s", projectTitle, reason != null ? reason : "Not specified")
                ))
                .build();
    }
}
