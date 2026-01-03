package com.fypify.backend.modules.submission.repository;

import com.fypify.backend.modules.submission.entity.SupervisorMarks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SupervisorMarks entity.
 */
@Repository
public interface SupervisorMarksRepository extends JpaRepository<SupervisorMarks, UUID> {

    /**
     * Find marks by submission ID.
     */
    Optional<SupervisorMarks> findBySubmissionId(UUID submissionId);

    /**
     * Find marks by submission ID and supervisor ID.
     */
    Optional<SupervisorMarks> findBySubmissionIdAndSupervisorId(UUID submissionId, UUID supervisorId);

    /**
     * Check if marks exist for a submission.
     */
    boolean existsBySubmissionId(UUID submissionId);

    /**
     * Check if marks exist for a submission by a specific supervisor.
     */
    boolean existsBySubmissionIdAndSupervisorId(UUID submissionId, UUID supervisorId);

    /**
     * Find marks by submission with submission details loaded.
     */
    @Query("SELECT sm FROM SupervisorMarks sm " +
           "LEFT JOIN FETCH sm.submission s " +
           "LEFT JOIN FETCH s.documentType " +
           "WHERE sm.submission.id = :submissionId")
    Optional<SupervisorMarks> findBySubmissionIdWithDetails(@Param("submissionId") UUID submissionId);
}
