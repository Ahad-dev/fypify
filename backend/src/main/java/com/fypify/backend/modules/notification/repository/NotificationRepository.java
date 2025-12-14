package com.fypify.backend.modules.notification.repository;

import com.fypify.backend.modules.notification.entity.Notification;
import com.fypify.backend.modules.notification.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Notification entity operations.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Find all notifications for a user.
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find unread notifications for a user.
     */
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find unread notifications for a user (list).
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

    /**
     * Find notifications by type for a user.
     */
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(UUID userId, NotificationType type, Pageable pageable);

    /**
     * Count unread notifications for a user.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    int countUnreadByUserId(@Param("userId") UUID userId);

    /**
     * Mark all notifications as read for a user.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") UUID userId);

    /**
     * Mark specific notifications as read.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id IN :ids")
    int markAsReadByIds(@Param("ids") List<UUID> ids);

    /**
     * Delete old read notifications.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.createdAt < :cutoff")
    int deleteOldReadNotifications(@Param("cutoff") Instant cutoff);

    /**
     * Delete all notifications for a user.
     */
    @Modifying
    void deleteByUserId(UUID userId);

    /**
     * Find recent notifications for a user (limited).
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Check if user has any unread notifications.
     */
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    boolean hasUnreadNotifications(@Param("userId") UUID userId);

    /**
     * Find notifications created after a certain time for a user.
     */
    List<Notification> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(UUID userId, Instant after);
}
