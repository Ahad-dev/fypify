package com.fypify.backend.modules.committee.repository;

import com.fypify.backend.modules.committee.entity.FinalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for FinalResult entity.
 */
@Repository
public interface FinalResultRepository extends JpaRepository<FinalResult, UUID> {

    /**
     * Find final result by project ID.
     */
    @Query("SELECT fr FROM FinalResult fr WHERE fr.project.id = :projectId")
    Optional<FinalResult> findByProjectId(@Param("projectId") UUID projectId);

    /**
     * Check if result exists for project.
     */
    boolean existsByProjectId(UUID projectId);

    /**
     * Find released result by project ID (for student view).
     */
    @Query("SELECT fr FROM FinalResult fr WHERE fr.project.id = :projectId AND fr.released = true")
    Optional<FinalResult> findReleasedByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find all released results with project details.
     */
    @Query("SELECT fr FROM FinalResult fr " +
           "LEFT JOIN FETCH fr.project p " +
           "LEFT JOIN FETCH p.supervisor " +
           "WHERE fr.released = true " +
           "ORDER BY fr.releasedAt DESC")
    java.util.List<FinalResult> findAllReleased();
}
