package com.fypify.backend.modules.admin.repository;

import com.fypify.backend.modules.admin.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for AuditLog entity.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    /**
     * Find audit logs by actor.
     */
    Page<AuditLog> findByActorIdOrderByCreatedAtDesc(UUID actorId, Pageable pageable);

    /**
     * Find audit logs by action.
     */
    Page<AuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    /**
     * Find audit logs by entity type and ID.
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);

    /**
     * Find recent audit logs.
     */
    @Query("SELECT al FROM AuditLog al ORDER BY al.createdAt DESC")
    Page<AuditLog> findRecentLogs(Pageable pageable);

    /**
     * Find audit logs within date range.
     */
    @Query("SELECT al FROM AuditLog al WHERE al.createdAt BETWEEN :startDate AND :endDate ORDER BY al.createdAt DESC")
    Page<AuditLog> findByDateRange(
            @Param("startDate") Instant startDate, 
            @Param("endDate") Instant endDate, 
            Pageable pageable
    );

    /**
     * Find audit logs by actor and action.
     */
    Page<AuditLog> findByActorIdAndActionOrderByCreatedAtDesc(UUID actorId, String action, Pageable pageable);
}
