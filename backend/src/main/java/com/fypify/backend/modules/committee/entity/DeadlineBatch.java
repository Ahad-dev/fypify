package com.fypify.backend.modules.committee.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DeadlineBatch entity representing a set of deadlines that apply to 
 * projects approved within a specific date range.
 * Maps to the 'deadline_batches' table.
 */
@Entity
@Table(name = "deadline_batches",
    indexes = {
        @Index(name = "idx_deadline_batches_applies", columnList = "applies_from, applies_until"),
        @Index(name = "idx_deadline_batches_active", columnList = "is_active")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeadlineBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Projects approved on or after this date will use this batch's deadlines.
     */
    @Column(name = "applies_from", nullable = false)
    private Instant appliesFrom;

    /**
     * Projects approved before this date will use this batch's deadlines.
     * If null, this batch applies to all projects approved from appliesFrom onwards.
     */
    @Column(name = "applies_until")
    private Instant appliesUntil;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ProjectDeadline> deadlines = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Check if this batch applies to a project approved at the given time.
     */
    public boolean appliesTo(Instant approvalTime) {
        if (approvalTime == null) return false;
        if (!isActive) return false;
        
        boolean afterStart = !approvalTime.isBefore(appliesFrom);
        boolean beforeEnd = appliesUntil == null || approvalTime.isBefore(appliesUntil);
        
        return afterStart && beforeEnd;
    }

    /**
     * Add a deadline to this batch.
     */
    public void addDeadline(ProjectDeadline deadline) {
        deadlines.add(deadline);
        deadline.setBatch(this);
    }

    /**
     * Remove a deadline from this batch.
     */
    public void removeDeadline(ProjectDeadline deadline) {
        deadlines.remove(deadline);
        deadline.setBatch(null);
    }
}
