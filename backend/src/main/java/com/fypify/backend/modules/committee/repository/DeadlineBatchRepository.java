package com.fypify.backend.modules.committee.repository;

import com.fypify.backend.modules.committee.entity.DeadlineBatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for DeadlineBatch entity.
 */
@Repository
public interface DeadlineBatchRepository extends JpaRepository<DeadlineBatch, UUID> {

    /**
     * Find all active deadline batches.
     */
    List<DeadlineBatch> findByIsActiveTrueOrderByAppliesFromDesc();

    /**
     * Find all deadline batches (paginated).
     */
    Page<DeadlineBatch> findAllByOrderByAppliesFromDesc(Pageable pageable);

    /**
     * Find a deadline batch that applies to a specific date.
     */
    @Query("""
        SELECT db FROM DeadlineBatch db
        WHERE db.isActive = true
        AND db.appliesFrom <= :approvalDate
        AND (db.appliesUntil IS NULL OR db.appliesUntil > :approvalDate)
        ORDER BY db.appliesFrom DESC
        """)
    List<DeadlineBatch> findApplicableBatches(@Param("approvalDate") Instant approvalDate);

    /**
     * Find the most recent applicable batch for a given approval date.
     */
    @Query("""
        SELECT db FROM DeadlineBatch db
        LEFT JOIN FETCH db.deadlines d
        LEFT JOIN FETCH d.documentType
        WHERE db.isActive = true
        AND db.appliesFrom <= :approvalDate
        AND (db.appliesUntil IS NULL OR db.appliesUntil > :approvalDate)
        ORDER BY db.appliesFrom DESC
        LIMIT 1
        """)
    Optional<DeadlineBatch> findApplicableBatchWithDeadlines(@Param("approvalDate") Instant approvalDate);

    /**
     * Find batch by ID with deadlines loaded.
     */
    @Query("""
        SELECT db FROM DeadlineBatch db
        LEFT JOIN FETCH db.deadlines d
        LEFT JOIN FETCH d.documentType
        WHERE db.id = :id
        """)
    Optional<DeadlineBatch> findByIdWithDeadlines(@Param("id") UUID id);

    /**
     * Check if a batch name already exists.
     */
    boolean existsByName(String name);
}
