package com.fypify.backend.modules.admin.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.admin.dto.AuditLogDto;
import com.fypify.backend.modules.admin.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Controller for Audit Log viewing.
 * Admin-only endpoints for viewing system audit logs.
 */
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Audit log viewing (Admin only)")
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get recent audit logs with pagination.
     * GET /api/v1/admin/audit-logs
     */
    @GetMapping
    @Operation(summary = "Get recent audit logs", description = "Get paginated list of recent audit logs")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getRecentLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AuditLogDto> logs = auditLogService.getRecentLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * Get audit logs by actor (user).
     * GET /api/v1/admin/audit-logs/actor/{actorId}
     */
    @GetMapping("/actor/{actorId}")
    @Operation(summary = "Get logs by actor", description = "Get audit logs filtered by user who performed the action")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getLogsByActor(
            @PathVariable UUID actorId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AuditLogDto> logs = auditLogService.getLogsByActor(actorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * Get audit logs by action type.
     * GET /api/v1/admin/audit-logs/action/{action}
     */
    @GetMapping("/action/{action}")
    @Operation(summary = "Get logs by action", description = "Get audit logs filtered by action type (CREATE, UPDATE, DELETE, etc.)")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getLogsByAction(
            @PathVariable String action,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AuditLogDto> logs = auditLogService.getLogsByAction(action.toUpperCase(), pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * Get audit logs within a date range.
     * GET /api/v1/admin/audit-logs/range
     */
    @GetMapping("/range")
    @Operation(summary = "Get logs by date range", description = "Get audit logs within specified date range")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Instant startInstant = startDate.toInstant(ZoneOffset.UTC);
        Instant endInstant = endDate.toInstant(ZoneOffset.UTC);
        Page<AuditLogDto> logs = auditLogService.getLogsByDateRange(startInstant, endInstant, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
