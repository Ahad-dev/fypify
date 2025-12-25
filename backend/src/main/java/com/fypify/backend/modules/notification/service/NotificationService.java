package com.fypify.backend.modules.notification.service;

import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.notification.dto.NotificationDto;
import com.fypify.backend.modules.notification.entity.Notification;
import com.fypify.backend.modules.notification.entity.NotificationType;
import com.fypify.backend.modules.notification.repository.NotificationRepository;
import com.fypify.backend.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.messaging.simp.SimpMessagingTemplate;

/**
 * Service for notification operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural)
 *    - Provides simplified interface to notification subsystem.
 *    - Hides complexity of notification creation, persistence, and delivery.
 * 
 * 2. FACTORY METHOD PATTERN (Creational) - via Notification Entity
 *    - Uses static factory methods in Notification class:
 *      Notification.groupInviteReceived(), Notification.projectRegistered()
 *    - Encapsulates notification creation with domain-specific names.
 * 
 * 3. BUILDER PATTERN (Creational) - via Lombok
 *    - NotificationDto.builder() for constructing DTOs.
 *    - Notification.builder() for creating entities.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. OBSERVER PATTERN (Behavioral) - Suggested for Event-Driven Notifications
 *    - Currently, services directly call sendNotification().
 *    - Better approach: Services publish domain events, NotificationService listens.
 *    - Example:
 *      @EventListener
 *      public void onGroupInviteSent(GroupInviteSentEvent event) {
 *          sendGroupInviteNotification(event.getInvitee(), event.getGroupId(), ...);
 *      }
 *    - Benefit: Decouples notification from business logic.
 * 
 * 2. STRATEGY PATTERN (Behavioral) - Suggested for Notification Channels
 *    - Interface: NotificationChannel { void send(Notification n); }
 *    - Implementations: InAppChannel, EmailChannel, PushChannel, SlackChannel
 *    - Benefit: Add new channels without modifying service.
 * 
 * 3. DECORATOR PATTERN (Structural) - Suggested for Notification Enhancement
 *    - Decorators: BatchNotificationDecorator, ThrottledNotificationDecorator
 *    - Add behavior like batching or rate limiting.
 * 
 * ===========================================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Get all notifications for a user.
     */
    public Page<NotificationDto> getNotificationsForUser(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    /**
     * Get unread notifications for a user.
     */
    public Page<NotificationDto> getUnreadNotificationsForUser(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    /**
     * Get unread notification count for a user.
     */
    public int getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Get notification by ID.
     */
    public NotificationDto getById(UUID id) {
        return toDto(findById(id));
    }

    /**
     * Find notification entity by ID.
     */
    public Notification findById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    /**
     * Mark a notification as read.
     */
    @Transactional
    public NotificationDto markAsRead(UUID id, UUID userId) {
        Notification notification = findById(id);
        
        // Verify the notification belongs to the user
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }
        
        notification.markAsRead();
        return toDto(notificationRepository.save(notification));
    }

    /**
     * Mark multiple notifications as read.
     */
    @Transactional
    public int markAsRead(List<UUID> notificationIds, UUID userId) {
        // In a real implementation, you'd verify ownership of all notifications
        return notificationRepository.markAsReadByIds(notificationIds);
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public int markAllAsRead(UUID userId) {
        return notificationRepository.markAllAsReadForUser(userId);
    }

    /**
     * Create and send a notification.
     */
    @Transactional
    public NotificationDto sendNotification(User recipient, NotificationType type, Map<String, Object> payload) {
        Notification notification = Notification.builder()
                .user(recipient)
                .type(type)
                .payload(payload)
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        log.info("Notification sent to user {}: type={}", recipient.getId(), type);
        
        // Push via WebSocket for real-time delivery
        NotificationDto dto = toDto(notification);
        pushToWebSocket(recipient.getId(), dto);
        
        return dto;
    }

    /**
     * Send notification asynchronously.
     */
    @Async
    @Transactional
    public void sendNotificationAsync(User recipient, NotificationType type, Map<String, Object> payload) {
        try {
            sendNotification(recipient, type, payload);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", recipient.getId(), e.getMessage(), e);
        }
    }

    /**
     * Send notifications to multiple users.
     */
    @Transactional
    public void sendNotificationToMany(List<User> recipients, NotificationType type, Map<String, Object> payload) {
        for (User recipient : recipients) {
            Notification notification = Notification.builder()
                    .user(recipient)
                    .type(type)
                    .payload(payload)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
            
            // Push via WebSocket for real-time delivery
            pushToWebSocket(recipient.getId(), toDto(notification));
        }
        log.info("Notification sent to {} users: type={}", recipients.size(), type);
    }

    /**
     * Send group invite notification.
     */
    @Transactional
    public void sendGroupInviteNotification(User invitee, UUID groupId, String groupName, User inviter) {
        Notification notification = Notification.groupInviteReceived(invitee, groupId, groupName, inviter);
        notificationRepository.save(notification);
        log.info("Group invite notification sent to user {}: group={}", invitee.getId(), groupName);
    }

    /**
     * Send project registered notification to FYP Committee.
     */
    @Transactional
    public void sendProjectRegisteredNotification(List<User> fypCommitteeMembers, UUID projectId, String projectTitle, UUID groupId) {
        for (User member : fypCommitteeMembers) {
            Notification notification = Notification.projectRegistered(member, projectId, projectTitle, groupId);
            notificationRepository.save(notification);
        }
        log.info("Project registered notification sent to {} FYP committee members: project={}", fypCommitteeMembers.size(), projectTitle);
    }

    /**
     * Send project approved notification.
     */
    @Transactional
    public void sendProjectApprovedNotification(User recipient, UUID projectId, String projectTitle, User supervisor) {
        Notification notification = Notification.projectApproved(recipient, projectId, projectTitle, supervisor);
        notificationRepository.save(notification);
        log.info("Project approved notification sent to user {}: project={}", recipient.getId(), projectTitle);
    }

    /**
     * Send project rejected notification.
     */
    @Transactional
    public void sendProjectRejectedNotification(User recipient, UUID projectId, String projectTitle, String reason) {
        Notification notification = Notification.projectRejected(recipient, projectId, projectTitle, reason);
        notificationRepository.save(notification);
        log.info("Project rejected notification sent to user {}: project={}", recipient.getId(), projectTitle);
    }

    /**
     * Delete old read notifications (cleanup job).
     */
    @Transactional
    public int cleanupOldNotifications(int daysOld) {
        Instant cutoff = Instant.now().minus(daysOld, ChronoUnit.DAYS);
        int deleted = notificationRepository.deleteOldReadNotifications(cutoff);
        log.info("Cleaned up {} old read notifications older than {} days", deleted, daysOld);
        return deleted;
    }

    /**
     * Check if user has unread notifications.
     */
    public boolean hasUnreadNotifications(UUID userId) {
        return notificationRepository.hasUnreadNotifications(userId);
    }

    /**
     * Get recent notifications for a user.
     */
    public List<NotificationDto> getRecentNotifications(UUID userId, int limit) {
        return notificationRepository.findRecentByUserId(userId, Pageable.ofSize(limit)).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO.
     */
    private NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .type(notification.getType())
                .typeDisplay(formatTypeDisplay(notification.getType()))
                .title(notification.getTitle())
                .message(notification.getMessage())
                .payload(notification.getPayload())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    /**
     * Format notification type for display.
     */
    private String formatTypeDisplay(NotificationType type) {
        String name = type.name();
        return name.replace("_", " ").toLowerCase()
                .substring(0, 1).toUpperCase() + 
                name.replace("_", " ").toLowerCase().substring(1);
    }

    /**
     * Push notification to user via WebSocket for real-time delivery.
     * Sends to user-specific queue: /user/{userId}/queue/notifications
     */
    private void pushToWebSocket(UUID userId, NotificationDto notification) {
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
            );
            log.debug("WebSocket notification pushed to user {}", userId);
        } catch (Exception e) {
            // Don't fail the notification save if WebSocket push fails
            log.warn("Failed to push notification via WebSocket to user {}: {}", userId, e.getMessage());
        }
    }
}
