package com.fypify.backend.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * User entity representing all users in the system.
 * Maps to the 'users' table.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Helper methods

    public boolean isAdmin() {
        return role != null && Role.ADMIN.equals(role.getName());
    }

    public boolean isStudent() {
        return role != null && Role.STUDENT.equals(role.getName());
    }

    public boolean isSupervisor() {
        return role != null && Role.SUPERVISOR.equals(role.getName());
    }

    public boolean isFypCommittee() {
        return role != null && Role.FYP_COMMITTEE.equals(role.getName());
    }

    public boolean isEvaluationCommittee() {
        return role != null && Role.EVALUATION_COMMITTEE.equals(role.getName());
    }
}
