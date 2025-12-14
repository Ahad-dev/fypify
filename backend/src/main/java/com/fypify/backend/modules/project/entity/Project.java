package com.fypify.backend.modules.project.entity;

import com.fypify.backend.modules.group.entity.StudentGroup;
import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Project entity representing a Final Year Project.
 * Maps to the 'projects' table.
 */
@Entity
@Table(name = "projects",
    indexes = {
        @Index(name = "idx_projects_status", columnList = "status"),
        @Index(name = "idx_projects_supervisor", columnList = "supervisor_id"),
        @Index(name = "idx_projects_group", columnList = "group_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", unique = true)
    private StudentGroup group;

    @Column(name = "title", nullable = false, length = 400)
    private String title;

    @Column(name = "abstract", columnDefinition = "TEXT")
    private String projectAbstract;

    @Column(name = "domain", length = 200)
    private String domain;

    /**
     * Array of proposed supervisor UUIDs.
     * Students can propose multiple supervisors during registration.
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "proposed_supervisors", columnDefinition = "UUID[]")
    private List<UUID> proposedSupervisors;

    /**
     * The assigned supervisor (set by FYP Committee upon approval).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PENDING_APPROVAL;

    /**
     * The FYP Committee member who approved the project.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    /**
     * Rejection reason if the project was rejected.
     */
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Helper methods

    /**
     * Check if the project is pending approval.
     */
    public boolean isPendingApproval() {
        return status == ProjectStatus.PENDING_APPROVAL;
    }

    /**
     * Check if the project has been approved.
     */
    public boolean isApproved() {
        return status == ProjectStatus.APPROVED || status == ProjectStatus.IN_PROGRESS || status == ProjectStatus.COMPLETED;
    }

    /**
     * Check if the project has been rejected.
     */
    public boolean isRejected() {
        return status == ProjectStatus.REJECTED;
    }

    /**
     * Approve the project.
     */
    public void approve(User approver, User assignedSupervisor) {
        this.status = ProjectStatus.APPROVED;
        this.approvedBy = approver;
        this.approvedAt = Instant.now();
        this.supervisor = assignedSupervisor;
    }

    /**
     * Reject the project.
     */
    public void reject(User rejector, String reason) {
        this.status = ProjectStatus.REJECTED;
        this.approvedBy = rejector;
        this.approvedAt = Instant.now();
        this.rejectionReason = reason;
    }

    /**
     * Start the project (move to IN_PROGRESS).
     */
    public void startProject() {
        if (this.status == ProjectStatus.APPROVED) {
            this.status = ProjectStatus.IN_PROGRESS;
        }
    }

    /**
     * Complete the project.
     */
    public void complete() {
        if (this.status == ProjectStatus.IN_PROGRESS) {
            this.status = ProjectStatus.COMPLETED;
        }
    }

    /**
     * Archive the project.
     */
    public void archive() {
        this.status = ProjectStatus.ARCHIVED;
    }

    /**
     * Check if the project belongs to a specific group.
     */
    public boolean belongsToGroup(UUID groupId) {
        return group != null && group.getId().equals(groupId);
    }

    /**
     * Check if a user is the supervisor of this project.
     */
    public boolean isSupervisor(UUID userId) {
        return supervisor != null && supervisor.getId().equals(userId);
    }
}
