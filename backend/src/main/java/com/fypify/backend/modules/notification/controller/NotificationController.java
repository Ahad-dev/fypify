package com.fypify.backend.modules.notification.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.notification.dto.MarkReadRequest;
import com.fypify.backend.modules.notification.dto.NotificationDto;
import com.fypify.backend.modules.notification.service.NotificationService;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for Notification operations.
 * Provides endpoints for viewing and managing user notifications.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * Get all notifications for the current user.
     * GET /api/v1/notifications
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my notifications", description = "Get all notifications for the current user")
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getMyNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        Page<NotificationDto> notifications = notificationService.getNotificationsForUser(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * Get unread notifications for the current user.
     * GET /api/v1/notifications/unread
     */
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread notifications", description = "Get unread notifications for the current user")
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getUnreadNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        Page<NotificationDto> notifications = notificationService.getUnreadNotificationsForUser(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * Get unread notification count.
     * GET /api/v1/notifications/unread/count
     */
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        int count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    /**
     * Get recent notifications (limited).
     * GET /api/v1/notifications/recent?limit=5
     */
    @GetMapping("/recent")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get recent notifications", description = "Get recent notifications (limited)")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getRecentNotifications(
            @RequestParam(defaultValue = "5") int limit,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        List<NotificationDto> notifications = notificationService.getRecentNotifications(user.getId(), Math.min(limit, 20));
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * Get notification by ID.
     * GET /api/v1/notifications/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notification by ID", description = "Get a specific notification")
    public ResponseEntity<ApiResponse<NotificationDto>> getNotificationById(
            @PathVariable UUID id
    ) {
        NotificationDto notification = notificationService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }

    /**
     * Mark a notification as read.
     * POST /api/v1/notifications/{id}/read
     */
    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        NotificationDto notification = notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(notification));
    }

    /**
     * Mark multiple notifications as read.
     * POST /api/v1/notifications/mark-read
     */
    @PostMapping("/mark-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark multiple as read", description = "Mark multiple notifications as read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markMultipleAsRead(
            @Valid @RequestBody MarkReadRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        int count = notificationService.markAsRead(request.getNotificationIds(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("marked", count), count + " notifications marked as read"));
    }

    /**
     * Mark all notifications as read.
     * POST /api/v1/notifications/mark-all-read
     */
    @PostMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        int count = notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("marked", count), "All notifications marked as read"));
    }

    /**
     * Check if user has unread notifications.
     * GET /api/v1/notifications/has-unread
     */
    @GetMapping("/has-unread")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check for unread", description = "Check if user has any unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> hasUnread(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        boolean hasUnread = notificationService.hasUnreadNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("hasUnread", hasUnread)));
    }
}
