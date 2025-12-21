package com.fypify.backend.modules.committee.entity;

import com.fypify.backend.modules.admin.entity.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * ProjectDeadline entity representing a deadline for a specific document type
 * within a deadline batch.
 * Maps to the 'project_deadlines' table.
 */
@Entity
@Table(name = "project_deadlines",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"batch_id", "document_type_id"})
    },
    indexes = {
        @Index(name = "idx_project_deadlines_batch", columnList = "batch_id"),
        @Index(name = "idx_project_deadlines_document_type", columnList = "document_type_id"),
        @Index(name = "idx_project_deadlines_date", columnList = "deadline_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDeadline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private DeadlineBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id", nullable = false)
    private DocumentType documentType;

    /**
     * The deadline date for this document type submission.
     */
    @Column(name = "deadline_date", nullable = false)
    private Instant deadlineDate;

    /**
     * Sort order matching the document type's display order.
     * Used to enforce minimum 15-day gaps between consecutive deadlines.
     */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Check if the deadline has passed.
     */
    public boolean isPast() {
        return Instant.now().isAfter(deadlineDate);
    }

    /**
     * Check if the deadline is approaching (within given hours).
     */
    public boolean isApproaching(int withinHours) {
        Instant threshold = Instant.now().plusSeconds(withinHours * 3600L);
        return !isPast() && deadlineDate.isBefore(threshold);
    }
}
