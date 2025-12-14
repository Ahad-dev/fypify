package com.fypify.backend.modules.admin.service;

import com.fypify.backend.modules.admin.entity.AuditLog;
import com.fypify.backend.modules.admin.dto.AuditLogDto;
import com.fypify.backend.modules.admin.repository.AuditLogRepository;
import com.fypify.backend.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for audit logging operations.
 * Provides methods to log and query audit entries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log an action asynchronously.
     */
    @Async
    @Transactional
    public void logAsync(User actor, String action, String entityType, UUID entityId, Map<String, Object> details) {
        try {
            log(actor, action, entityType, entityId, details, null);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage(), e);
        }
    }

    /**
     * Log an action synchronously.
     */
    @Transactional
    public AuditLog log(User actor, String action, String entityType, UUID entityId, Map<String, Object> details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details != null ? details : new HashMap<>())
                .ipAddress(ipAddress)
                .build();

        return auditLogRepository.save(auditLog);
    }

    /**
     * Log a create action.
     */
    @Transactional
    public void logCreate(User actor, String entityType, UUID entityId, Object entity) {
        Map<String, Object> details = new HashMap<>();
        details.put("entity", entity);
        log(actor, AuditLog.ACTION_CREATE, entityType, entityId, details, null);
    }

    /**
     * Log an update action.
     */
    @Transactional
    public void logUpdate(User actor, String entityType, UUID entityId, Object oldEntity, Object newEntity) {
        Map<String, Object> details = new HashMap<>();
        details.put("before", oldEntity);
        details.put("after", newEntity);
        log(actor, AuditLog.ACTION_UPDATE, entityType, entityId, details, null);
    }

    /**
     * Log a delete action.
     */
    @Transactional
    public void logDelete(User actor, String entityType, UUID entityId, Object entity) {
        Map<String, Object> details = new HashMap<>();
        details.put("deleted", entity);
        log(actor, AuditLog.ACTION_DELETE, entityType, entityId, details, null);
    }

    /**
     * Get recent audit logs with pagination.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getRecentLogs(Pageable pageable) {
        return auditLogRepository.findRecentLogs(pageable).map(this::toDto);
    }

    /**
     * Get audit logs by actor.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getLogsByActor(UUID actorId, Pageable pageable) {
        return auditLogRepository.findByActorIdOrderByCreatedAtDesc(actorId, pageable).map(this::toDto);
    }

    /**
     * Get audit logs by action type.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable).map(this::toDto);
    }

    /**
     * Get audit logs within a date range.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDto> getLogsByDateRange(Instant startDate, Instant endDate, Pageable pageable) {
        return auditLogRepository.findByDateRange(startDate, endDate, pageable).map(this::toDto);
    }

    /**
     * Convert AuditLog entity to DTO.
     */
    private AuditLogDto toDto(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .actorId(auditLog.getActor() != null ? auditLog.getActor().getId() : null)
                .actorName(auditLog.getActor() != null ? auditLog.getActor().getFullName() : null)
                .actorEmail(auditLog.getActor() != null ? auditLog.getActor().getEmail() : null)
                .action(auditLog.getAction())
                .details(auditLog.getDetails())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
