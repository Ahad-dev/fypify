package com.fypify.backend.modules.admin.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * EvalCommitteeMember entity representing membership in the Evaluation Committee.
 * Maps to the 'eval_committee_members' table.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. IDENTITY MAP PATTERN (Enterprise Pattern via JPA)
 *    - JPA EntityManager maintains identity map for EvalCommitteeMember entities.
 *    - Prevents duplicate loads of the same committee member in a transaction.
 * 
 * 2. FOREIGN KEY MAPPING (Enterprise Pattern)
 *    - Uses @MapsId to share primary key with User entity.
 *    - Establishes one-to-one relationship with users table.
 * 
 * ===========================================================================================
 */
@Entity
@Table(name = "eval_committee_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvalCommitteeMember {

    /**
     * User ID serves as primary key (shared with User entity).
     */
    @Id
    @Column(name = "user_id")
    private UUID userId;

    /**
     * The user who is a member of the Evaluation Committee.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * When the member was added to the committee.
     */
    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private Instant addedAt;
}
