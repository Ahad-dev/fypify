package com.fypify.backend.modules.submission.repository;

import com.fypify.backend.modules.submission.entity.EvaluationMarks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EvaluationMarks entity.
 */
@Repository
public interface EvaluationMarksRepository extends JpaRepository<EvaluationMarks, UUID> {

    /**
     * Find all evaluation marks for a submission.
     */
    List<EvaluationMarks> findBySubmissionId(UUID submissionId);

    /**
     * Find evaluation marks by submission and evaluator.
     */
    Optional<EvaluationMarks> findBySubmissionIdAndEvaluatorId(UUID submissionId, UUID evaluatorId);

    /**
     * Check if evaluation exists for submission and evaluator.
     */
    boolean existsBySubmissionIdAndEvaluatorId(UUID submissionId, UUID evaluatorId);

    /**
     * Count finalized evaluations for a submission.
     */
    @Query("SELECT COUNT(em) FROM EvaluationMarks em WHERE em.submission.id = :submissionId AND em.isFinal = true")
    long countFinalizedBySubmissionId(@Param("submissionId") UUID submissionId);

    /**
     * Count total evaluations for a submission.
     */
    long countBySubmissionId(UUID submissionId);

    /**
     * Get all finalized marks for a submission.
     */
    @Query("SELECT em FROM EvaluationMarks em WHERE em.submission.id = :submissionId AND em.isFinal = true")
    List<EvaluationMarks> findFinalizedBySubmissionId(@Param("submissionId") UUID submissionId);

    /**
     * Calculate average score for finalized evaluations of a submission.
     */
    @Query("SELECT AVG(em.score) FROM EvaluationMarks em WHERE em.submission.id = :submissionId AND em.isFinal = true")
    Optional<Double> calculateAverageScoreBySubmissionId(@Param("submissionId") UUID submissionId);

    /**
     * Find all evaluations by an evaluator.
     */
    List<EvaluationMarks> findByEvaluatorId(UUID evaluatorId);
}
