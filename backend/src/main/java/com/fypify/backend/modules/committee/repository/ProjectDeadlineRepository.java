package com.fypify.backend.modules.committee.repository;

import com.fypify.backend.modules.committee.entity.ProjectDeadline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for ProjectDeadline entity.
 */
@Repository
public interface ProjectDeadlineRepository extends JpaRepository<ProjectDeadline, UUID> {

    /**
     * Find all deadlines for a batch ordered by sort order.
     */
    List<ProjectDeadline> findByBatchIdOrderBySortOrderAsc(UUID batchId);

    /**
     * Find deadlines by batch ID with document type loaded.
     */
    @Query("""
        SELECT pd FROM ProjectDeadline pd
        JOIN FETCH pd.documentType
        WHERE pd.batch.id = :batchId
        ORDER BY pd.sortOrder ASC
        """)
    List<ProjectDeadline> findByBatchIdWithDocumentType(@Param("batchId") UUID batchId);

    /**
     * Find upcoming deadlines (within given hours from now).
     */
    @Query("""
        SELECT pd FROM ProjectDeadline pd
        JOIN FETCH pd.documentType
        JOIN FETCH pd.batch
        WHERE pd.deadlineDate > :now
        AND pd.deadlineDate <= :threshold
        AND pd.batch.isActive = true
        ORDER BY pd.deadlineDate ASC
        """)
    List<ProjectDeadline> findUpcomingDeadlines(
            @Param("now") Instant now,
            @Param("threshold") Instant threshold
    );

    /**
     * Find deadlines that have just passed (within last hours).
     */
    @Query("""
        SELECT pd FROM ProjectDeadline pd
        JOIN FETCH pd.documentType
        JOIN FETCH pd.batch
        WHERE pd.deadlineDate <= :now
        AND pd.deadlineDate > :threshold
        AND pd.batch.isActive = true
        ORDER BY pd.deadlineDate DESC
        """)
    List<ProjectDeadline> findRecentlyPassedDeadlines(
            @Param("now") Instant now,
            @Param("threshold") Instant threshold
    );

    /**
     * Delete all deadlines for a batch.
     */
    void deleteByBatchId(UUID batchId);
}
