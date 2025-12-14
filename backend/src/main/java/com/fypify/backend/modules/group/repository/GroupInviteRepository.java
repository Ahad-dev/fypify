package com.fypify.backend.modules.group.repository;

import com.fypify.backend.modules.group.entity.GroupInvite;
import com.fypify.backend.modules.group.entity.GroupInvite.InviteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for GroupInvite entity operations.
 */
@Repository
public interface GroupInviteRepository extends JpaRepository<GroupInvite, UUID> {

    /**
     * Find all pending invites for a user.
     */
    @Query("SELECT gi FROM GroupInvite gi " +
           "LEFT JOIN FETCH gi.group " +
           "LEFT JOIN FETCH gi.inviter " +
           "WHERE gi.invitee.id = :inviteeId AND gi.status = :status")
    List<GroupInvite> findByInviteeIdAndStatus(@Param("inviteeId") UUID inviteeId, @Param("status") InviteStatus status);

    /**
     * Find all pending invites for a user (paginated).
     */
    Page<GroupInvite> findByInviteeIdAndStatus(UUID inviteeId, InviteStatus status, Pageable pageable);

    /**
     * Find all invites sent from a group.
     */
    @Query("SELECT gi FROM GroupInvite gi " +
           "LEFT JOIN FETCH gi.invitee " +
           "LEFT JOIN FETCH gi.inviter " +
           "WHERE gi.group.id = :groupId")
    List<GroupInvite> findByGroupId(@Param("groupId") UUID groupId);

    /**
     * Find pending invites for a group.
     */
    List<GroupInvite> findByGroupIdAndStatus(UUID groupId, InviteStatus status);

    /**
     * Find a specific invite.
     */
    @Query("SELECT gi FROM GroupInvite gi " +
           "LEFT JOIN FETCH gi.group " +
           "LEFT JOIN FETCH gi.inviter " +
           "LEFT JOIN FETCH gi.invitee " +
           "WHERE gi.group.id = :groupId AND gi.invitee.id = :inviteeId AND gi.status = :status")
    Optional<GroupInvite> findByGroupIdAndInviteeIdAndStatus(
            @Param("groupId") UUID groupId,
            @Param("inviteeId") UUID inviteeId,
            @Param("status") InviteStatus status);

    /**
     * Check if a pending invite exists.
     */
    boolean existsByGroupIdAndInviteeIdAndStatus(UUID groupId, UUID inviteeId, InviteStatus status);

    /**
     * Find invite by ID with all relations loaded.
     */
    @Query("SELECT gi FROM GroupInvite gi " +
           "LEFT JOIN FETCH gi.group " +
           "LEFT JOIN FETCH gi.inviter " +
           "LEFT JOIN FETCH gi.invitee " +
           "WHERE gi.id = :id")
    Optional<GroupInvite> findByIdWithRelations(@Param("id") UUID id);

    /**
     * Cancel all pending invites for a group.
     */
    @Modifying
    @Query("UPDATE GroupInvite gi SET gi.status = 'CANCELLED', gi.respondedAt = :now " +
           "WHERE gi.group.id = :groupId AND gi.status = 'PENDING'")
    void cancelAllPendingInvitesForGroup(@Param("groupId") UUID groupId, @Param("now") Instant now);

    /**
     * Mark expired invites as expired.
     */
    @Modifying
    @Query("UPDATE GroupInvite gi SET gi.status = 'EXPIRED' " +
           "WHERE gi.status = 'PENDING' AND gi.expiresAt IS NOT NULL AND gi.expiresAt < :now")
    int expireOldInvites(@Param("now") Instant now);

    /**
     * Count pending invites for a user.
     */
    @Query("SELECT COUNT(gi) FROM GroupInvite gi WHERE gi.invitee.id = :inviteeId AND gi.status = 'PENDING'")
    int countPendingInvitesForUser(@Param("inviteeId") UUID inviteeId);

    /**
     * Count pending invites sent by a group.
     */
    @Query("SELECT COUNT(gi) FROM GroupInvite gi WHERE gi.group.id = :groupId AND gi.status = 'PENDING'")
    int countPendingInvitesByGroup(@Param("groupId") UUID groupId);
}
