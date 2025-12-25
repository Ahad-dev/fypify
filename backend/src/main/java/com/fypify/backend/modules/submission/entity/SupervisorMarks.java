package com.fypify.backend.modules.submission.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * SupervisorMarks entity to store supervisor evaluation marks for a submission.
 * Marks are stored only for submissions that are locked for evaluation.
 * These marks are hidden from students.
 * 
 * The marks should be interpreted as a percentage (0-100).
 * The final contribution is calculated as: marks * (documentType.weightSupervisor / 100)
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private DocumentSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;

    /**
     * Marks given by supervisor (0-100 scale).
     * This will be weighted by documentType.weightSupervisor when calculating final grade.
     */
    @Column(name = "marks", nullable = false)
    private Integer marks;

    /**
     * Private comments from supervisor (not visible to students).
     */
    @Column(name = "private_comments", columnDefinition = "TEXT")
    private String privateComments;

    /**
     * When the marks were given.
     */
    @CreationTimestamp
    @Column(name = "marked_at", updatable = false)
    private Instant markedAt;

    /**
     * Validate marks are in valid range.
     */
    @PrePersist
    @PreUpdate
    public void validateMarks() {
        if (marks < 0 || marks > 100) {
            throw new IllegalStateException("Marks must be between 0 and 100");
        }
    }
}
