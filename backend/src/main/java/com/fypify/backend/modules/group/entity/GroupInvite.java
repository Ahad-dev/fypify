package com.fypify.backend.modules.group.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * GroupInvite entity representing an invitation to join a group.
 * Used to track pending invitations sent to students.
 */
@Entity
@Table(name = "group_invites", 
    uniqueConstraints = @UniqueConstraint(
        name = "uk_group_invites_group_invitee",
        columnNames = {"group_id", "invitee_id"}
    ),
    indexes = {
        @Index(name = "idx_group_invites_invitee", columnList = "invitee_id"),
        @Index(name = "idx_group_invites_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudentGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private InviteStatus status = InviteStatus.PENDING;

    @Column(name = "message", length = 500)
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    /**
     * Accept the invitation.
     */
    public void accept() {
        this.status = InviteStatus.ACCEPTED;
        this.respondedAt = Instant.now();
    }

    /**
     * Decline the invitation.
     */
    public void decline() {
        this.status = InviteStatus.DECLINED;
        this.respondedAt = Instant.now();
    }

    /**
     * Cancel the invitation (by the inviter).
     */
    public void cancel() {
        this.status = InviteStatus.CANCELLED;
        this.respondedAt = Instant.now();
    }

    /**
     * Check if the invite is still pending.
     */
    public boolean isPending() {
        return status == InviteStatus.PENDING;
    }

    /**
     * Check if the invite has expired.
     */
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    /**
     * Enum for invite status.
     */
    public enum InviteStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        CANCELLED,
        EXPIRED
    }
}
