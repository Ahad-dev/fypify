package com.fypify.backend.modules.group.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * StudentGroup entity representing a student project group.
 * Maps to the 'student_groups' table.
 */
@Entity
@Table(name = "student_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private User leader;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<GroupMember> members = new HashSet<>();

    // Helper methods

    /**
     * Add a member to the group.
     */
    public void addMember(User student) {
        GroupMember member = GroupMember.builder()
                .group(this)
                .student(student)
                .build();
        members.add(member);
    }

    /**
     * Remove a member from the group.
     */
    public void removeMember(User student) {
        members.removeIf(m -> m.getStudent().getId().equals(student.getId()));
    }

    /**
     * Check if a user is a member of this group.
     */
    public boolean hasMember(UUID userId) {
        return members.stream()
                .anyMatch(m -> m.getStudent().getId().equals(userId));
    }

    /**
     * Check if a user is the leader of this group.
     */
    public boolean isLeader(UUID userId) {
        return leader != null && leader.getId().equals(userId);
    }

    /**
     * Get the number of members in this group.
     */
    public int getMemberCount() {
        return members.size();
    }
}
