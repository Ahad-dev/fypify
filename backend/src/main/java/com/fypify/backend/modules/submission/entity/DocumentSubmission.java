package com.fypify.backend.modules.submission.entity;

import com.fypify.backend.modules.admin.entity.DocumentType;
import com.fypify.backend.modules.file.entity.CloudinaryFile;
import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * DocumentSubmission entity representing a versioned document submission.
 * Maps to the 'document_submissions' table.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. BUILDER PATTERN (Creational) - via Lombok @Builder
 *    - Fluent construction of submission objects with many fields.
 * 
 * 2. STATE PATTERN (Behavioral) - Implicit via SubmissionStatus
 *    - Submission behavior changes based on status (e.g., can't edit when LOCKED_FOR_EVAL).
 *    - Status transitions are enforced by business logic.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. STATE PATTERN (Behavioral) - Enhanced Implementation
 *    - Create SubmissionState interface with state-specific behavior.
 *    - Each status becomes a concrete state class.
 *    - Example:
 *      interface SubmissionState {
 *          boolean canEdit();
 *          boolean canMarkFinal();
 *          SubmissionState onSupervisorApprove();
 *      }
 * 
 * ===========================================================================================
 */
@Entity
@Table(name = "document_submissions",
    indexes = {
        @Index(name = "idx_submissions_project_doc", columnList = "project_id, doc_type_id"),
        @Index(name = "idx_submissions_status", columnList = "status"),
        @Index(name = "idx_submissions_project_doc_version", columnList = "project_id, doc_type_id, version")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_submissions_project_doc_version", 
                         columnNames = {"project_id", "doc_type_id", "version"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_type_id", nullable = false)
    private DocumentType documentType;

    @Column(name = "version", nullable = false)
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private CloudinaryFile file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING_SUPERVISOR;

    @Column(name = "is_final", nullable = false)
    @Builder.Default
    private Boolean isFinal = false;

    @Column(name = "supervisor_reviewed_at")
    private Instant supervisorReviewedAt;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    // ==================== State Transition Methods ====================

    /**
     * Check if submission can be edited.
     */
    public boolean canEdit() {
        return status == SubmissionStatus.PENDING_SUPERVISOR || 
               status == SubmissionStatus.REVISION_REQUESTED;
    }

    /**
     * Check if submission can be marked as final.
     */
    public boolean canMarkFinal() {
        return !isFinal && (status == SubmissionStatus.PENDING_SUPERVISOR || 
                           status == SubmissionStatus.REVISION_REQUESTED ||
                           status == SubmissionStatus.APPROVED_BY_SUPERVISOR);
    }

    /**
     * Check if submission is locked for evaluation.
     */
    public boolean isLocked() {
        return status == SubmissionStatus.LOCKED_FOR_EVAL ||
               status == SubmissionStatus.EVAL_IN_PROGRESS ||
               status == SubmissionStatus.EVAL_FINALIZED;
    }

    /**
     * Mark submission as final (no more revisions allowed).
     */
    public void markFinal() {
        if (!canMarkFinal()) {
            throw new IllegalStateException("Cannot mark submission as final in current state: " + status);
        }
        this.isFinal = true;
    }

    /**
     * Supervisor approves the submission.
     */
    public void approveBySupervsor() {
        if (isLocked()) {
            throw new IllegalStateException("Cannot approve a locked submission");
        }
        this.status = SubmissionStatus.APPROVED_BY_SUPERVISOR;
        this.supervisorReviewedAt = Instant.now();
    }

    /**
     * Supervisor requests revision.
     */
    public void requestRevision(String feedback) {
        if (isLocked()) {
            throw new IllegalStateException("Cannot request revision for a locked submission");
        }
        this.status = SubmissionStatus.REVISION_REQUESTED;
        this.comments = feedback;
        this.supervisorReviewedAt = Instant.now();
    }

    /**
     * Lock submission for evaluation.
     */
    public void lockForEvaluation() {
        if (status == SubmissionStatus.EVAL_FINALIZED) {
            throw new IllegalStateException("Submission is already finalized");
        }
        this.status = SubmissionStatus.LOCKED_FOR_EVAL;
    }

    /**
     * Start evaluation.
     */
    public void startEvaluation() {
        if (status != SubmissionStatus.LOCKED_FOR_EVAL && status != SubmissionStatus.APPROVED_BY_SUPERVISOR) {
            throw new IllegalStateException("Submission must be locked or approved before evaluation");
        }
        this.status = SubmissionStatus.EVAL_IN_PROGRESS;
    }

    /**
     * Finalize evaluation.
     */
    public void finalizeEvaluation() {
        if (status != SubmissionStatus.EVAL_IN_PROGRESS) {
            throw new IllegalStateException("Evaluation must be in progress before finalizing");
        }
        this.status = SubmissionStatus.EVAL_FINALIZED;
    }
}

