package com.fypify.backend.modules.submission.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * SupervisorMarks entity to store supervisor evaluation marks for a submission.
 * Marks are stored only for submissions that are locked for evaluation.
 * These marks are hidden from students.
 * 
 * The score should be interpreted as a percentage (0-100).
 * The final contribution is calculated as: score * (documentType.weightSupervisor / 100)
 */
@Entity
@Table(name = "supervisor_marks",
    indexes = {
        @Index(name = "idx_supervisor_marks_submission", columnList = "submission_id"),
        @Index(name = "idx_supervisor_marks_supervisor", columnList = "supervisor_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorMarks {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private DocumentSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;

    /**
     * Score given by supervisor (0-100 scale).
     * This will be weighted by documentType.weightSupervisor when calculating final grade.
     */
    @Column(name = "score", nullable = false, precision = 5, scale = 2)
    private BigDecimal score;

    /**
     * When the marks were given.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    /**
     * Validate score is in valid range.
     */
    @PrePersist
    @PreUpdate
    public void validateScore() {
        if (score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalStateException("Score must be between 0 and 100");
        }
    }
}
