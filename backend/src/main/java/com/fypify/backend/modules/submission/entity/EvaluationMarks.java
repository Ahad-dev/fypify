package com.fypify.backend.modules.submission.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * EvaluationMarks entity to store evaluation committee marks for a submission.
 * Each evaluator can submit marks independently for each submission.
 * Supports draft mode (isFinal=false) before finalizing.
 * 
 * The marks should be interpreted as a percentage (0-100).
 * The final contribution is calculated as: avgScore * (documentType.weightCommittee / 100)
 */
@Entity
@Table(name = "evaluation_marks",
    indexes = {
        @Index(name = "idx_evaluation_marks_submission", columnList = "submission_id"),
        @Index(name = "idx_evaluation_marks_evaluator", columnList = "evaluator_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_evaluation_marks_submission_evaluator", 
                         columnNames = {"submission_id", "evaluator_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationMarks {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private DocumentSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;

    /**
     * Score given by evaluator (0-100 scale).
     * This will be averaged with other evaluators and weighted by documentType.weightCommittee.
     */
    @Column(name = "score", nullable = false, precision = 7, scale = 4)
    private BigDecimal score;

    /**
     * Comments from evaluator.
     */
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    /**
     * Whether this evaluation is finalized.
     * Once finalized, the evaluator cannot modify their marks.
     */
    @Column(name = "is_final", nullable = false)
    @Builder.Default
    private Boolean isFinal = false;

    /**
     * When the marks were created/last updated.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Validate score is in valid range.
     */
    @PrePersist
    @PreUpdate
    public void validateAndUpdateTimestamp() {
        if (score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalStateException("Score must be between 0 and 100");
        }
        this.updatedAt = Instant.now();
    }

    /**
     * Finalize this evaluation - no more changes allowed after this.
     */
    public void finalize() {
        if (this.isFinal) {
            throw new IllegalStateException("Evaluation is already finalized");
        }
        this.isFinal = true;
    }

    /**
     * Check if evaluation can be modified.
     */
    public boolean canModify() {
        return !this.isFinal;
    }
}
