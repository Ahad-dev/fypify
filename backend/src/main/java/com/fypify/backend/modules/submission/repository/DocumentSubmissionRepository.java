package com.fypify.backend.modules.submission.repository;

import com.fypify.backend.modules.submission.entity.DocumentSubmission;
import com.fypify.backend.modules.submission.entity.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for DocumentSubmission entity operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. REPOSITORY PATTERN (DDD/Enterprise Pattern)
 *    - Abstracts data access with Spring Data JPA.
 *    - Provides optimistic/pessimistic locking for version calculation.
 * 
 * ===========================================================================================
 */
@Repository
public interface DocumentSubmissionRepository extends JpaRepository<DocumentSubmission, UUID> {

    /**
     * Find submission by ID with relations.
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "LEFT JOIN FETCH ds.project p " +
           "LEFT JOIN FETCH ds.documentType dt " +
           "LEFT JOIN FETCH ds.file f " +
           "LEFT JOIN FETCH ds.uploadedBy u " +
           "WHERE ds.id = :id")
    Optional<DocumentSubmission> findByIdWithRelations(@Param("id") UUID id);

    /**
     * Find submissions by project ID.
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "LEFT JOIN FETCH ds.documentType dt " +
           "LEFT JOIN FETCH ds.file f " +
           "WHERE ds.project.id = :projectId " +
           "ORDER BY dt.displayOrder, ds.version DESC")
    List<DocumentSubmission> findByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find submissions by project and document type.
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "LEFT JOIN FETCH ds.file f " +
           "WHERE ds.project.id = :projectId AND ds.documentType.id = :docTypeId " +
           "ORDER BY ds.version DESC")
    List<DocumentSubmission> findByProjectIdAndDocTypeId(
            @Param("projectId") UUID projectId, 
            @Param("docTypeId") UUID docTypeId);

    /**
     * Find latest submission for a project and document type.
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "LEFT JOIN FETCH ds.file f " +
           "LEFT JOIN FETCH ds.uploadedBy u " +
           "WHERE ds.project.id = :projectId AND ds.documentType.id = :docTypeId " +
           "ORDER BY ds.version DESC " +
           "LIMIT 1")
    Optional<DocumentSubmission> findLatestByProjectAndDocType(
            @Param("projectId") UUID projectId, 
            @Param("docTypeId") UUID docTypeId);

    /**
     * Get the next version number for a project and document type.
     * Uses pessimistic locking to prevent race conditions.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT COALESCE(MAX(ds.version), 0) + 1 FROM DocumentSubmission ds " +
           "WHERE ds.project.id = :projectId AND ds.documentType.id = :docTypeId")
    Integer getNextVersionWithLock(@Param("projectId") UUID projectId, @Param("docTypeId") UUID docTypeId);

    /**
     * Get the current max version (without lock, for display purposes).
     */
    @Query("SELECT COALESCE(MAX(ds.version), 0) FROM DocumentSubmission ds " +
           "WHERE ds.project.id = :projectId AND ds.documentType.id = :docTypeId")
    Integer getCurrentMaxVersion(@Param("projectId") UUID projectId, @Param("docTypeId") UUID docTypeId);

    /**
     * Find submissions by status.
     */
    Page<DocumentSubmission> findByStatus(SubmissionStatus status, Pageable pageable);

    /**
     * Find submissions by multiple statuses with pagination.
     */
    Page<DocumentSubmission> findByStatusIn(List<SubmissionStatus> statuses, Pageable pageable);

    /**
     * Find submissions by multiple statuses (no pagination).
     */
    List<DocumentSubmission> findByStatusIn(List<SubmissionStatus> statuses);

    /**
     * Find pending submissions for a supervisor.
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "JOIN ds.project p " +
           "WHERE p.supervisor.id = :supervisorId " +
           "AND ds.status = 'PENDING_SUPERVISOR' " +
           "ORDER BY ds.uploadedAt DESC")
    Page<DocumentSubmission> findPendingForSupervisor(@Param("supervisorId") UUID supervisorId, Pageable pageable);

    /**
     * Find locked submissions for a supervisor's projects.
     * Returns submissions that are LOCKED_FOR_EVAL, EVAL_IN_PROGRESS, or EVAL_FINALIZED.
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "LEFT JOIN FETCH ds.project p " +
           "LEFT JOIN FETCH ds.documentType dt " +
           "LEFT JOIN FETCH ds.file f " +
           "WHERE p.supervisor.id = :supervisorId " +
           "AND ds.status IN ('LOCKED_FOR_EVAL', 'EVAL_IN_PROGRESS', 'EVAL_FINALIZED')")
    List<DocumentSubmission> findLockedForSupervisor(@Param("supervisorId") UUID supervisorId);

    /**
     * Find locked submissions for a supervisor's projects (paginated).
     */
    @Query("SELECT ds FROM DocumentSubmission ds " +
           "JOIN ds.project p " +
           "WHERE p.supervisor.id = :supervisorId " +
           "AND ds.status IN ('LOCKED_FOR_EVAL', 'EVAL_IN_PROGRESS', 'EVAL_FINALIZED') " +
           "ORDER BY ds.uploadedAt DESC")
    Page<DocumentSubmission> findLockedForSupervisorPaged(@Param("supervisorId") UUID supervisorId, Pageable pageable);

    /**
     * Check if a final submission exists for project and document type.
     */
    @Query("SELECT COUNT(ds) > 0 FROM DocumentSubmission ds " +
           "WHERE ds.project.id = :projectId AND ds.documentType.id = :docTypeId AND ds.isFinal = true")
    boolean existsFinalSubmission(@Param("projectId") UUID projectId, @Param("docTypeId") UUID docTypeId);

    /**
     * Count submissions by project.
     */
    long countByProjectId(UUID projectId);

    /**
     * Count submissions by status.
     */
    long countByStatus(SubmissionStatus status);
}

