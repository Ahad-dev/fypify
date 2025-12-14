package com.fypify.backend.modules.group.repository;

import com.fypify.backend.modules.group.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for GroupMember entity operations.
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMember.GroupMemberId> {

    /**
     * Find all members of a group.
     */
    @Query("SELECT gm FROM GroupMember gm " +
           "LEFT JOIN FETCH gm.student " +
           "WHERE gm.group.id = :groupId")
    List<GroupMember> findByGroupId(@Param("groupId") UUID groupId);

    /**
     * Find membership by student ID.
     */
    @Query("SELECT gm FROM GroupMember gm " +
           "LEFT JOIN FETCH gm.group " +
           "WHERE gm.student.id = :studentId")
    Optional<GroupMember> findByStudentId(@Param("studentId") UUID studentId);

    /**
     * Check if a student is in a specific group.
     */
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm " +
           "WHERE gm.group.id = :groupId AND gm.student.id = :studentId")
    boolean existsByGroupIdAndStudentId(@Param("groupId") UUID groupId, @Param("studentId") UUID studentId);

    /**
     * Check if a student is in any group.
     */
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm WHERE gm.student.id = :studentId")
    boolean existsByStudentId(@Param("studentId") UUID studentId);

    /**
     * Delete all memberships for a group.
     */
    @Modifying
    @Query("DELETE FROM GroupMember gm WHERE gm.group.id = :groupId")
    void deleteByGroupId(@Param("groupId") UUID groupId);

    /**
     * Delete membership by student ID.
     */
    @Modifying
    @Query("DELETE FROM GroupMember gm WHERE gm.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") UUID studentId);

    /**
     * Delete specific membership.
     */
    @Modifying
    @Query("DELETE FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.student.id = :studentId")
    void deleteByGroupIdAndStudentId(@Param("groupId") UUID groupId, @Param("studentId") UUID studentId);

    /**
     * Count members in a group.
     */
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId")
    int countByGroupId(@Param("groupId") UUID groupId);

    /**
     * Find all group IDs that a student belongs to.
     */
    @Query("SELECT gm.group.id FROM GroupMember gm WHERE gm.student.id = :studentId")
    List<UUID> findGroupIdsByStudentId(@Param("studentId") UUID studentId);
}
