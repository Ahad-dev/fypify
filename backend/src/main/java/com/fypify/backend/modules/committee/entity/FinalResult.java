package com.fypify.backend.modules.committee.entity;

import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * FinalResult entity representing the computed final score for a project.
 * 
 * The details field (JSONB) stores per-document breakdown:
 * {
 *   "documents": [
 *     {
 *       "docTypeCode": "SRS",
 *       "docTypeTitle": "Software Requirements Specification",
 *       "supervisorScore": 85.0,
 *       "supervisorWeight": 20,
 *       "committeeAvgScore": 78.5,
 *       "committeeWeight": 80,
 *       "weightedScore": 79.8
 *     }
 *   ],
 *   "totalScore": 79.8,
 *   "computedAt": "2025-12-27T10:00:00Z",
 *   "computedById": "uuid",
 *   "computedByName": "Dr. Smith"
 * }
 */
@Entity
@Table(name = "final_results",
    indexes = {
        @Index(name = "idx_final_results_project", columnList = "project_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    /**
     * Total weighted score (0-100)
     */
    @Column(name = "total_score", nullable = false, precision = 7, scale = 4)
    private BigDecimal totalScore;

    /**
     * JSONB breakdown of scores per document type.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "jsonb")
    private String details;

    /**
     * Whether the result has been released to students.
     */
    @Column(name = "released", nullable = false)
    @Builder.Default
    private Boolean released = false;

    /**
     * User who released the result.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "released_by")
    private User releasedBy;

    /**
     * When the result was released.
     */
    @Column(name = "released_at")
    private Instant releasedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Release this result to students.
     */
    public void release(User releasedBy) {
        if (this.released) {
            throw new IllegalStateException("Result is already released");
        }
        this.released = true;
        this.releasedBy = releasedBy;
        this.releasedAt = Instant.now();
    }

    /**
     * Check if result can be released.
     */
    public boolean canRelease() {
        return !this.released && this.totalScore != null;
    }
}
