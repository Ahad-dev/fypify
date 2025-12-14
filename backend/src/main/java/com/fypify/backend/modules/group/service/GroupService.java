package com.fypify.backend.modules.group.service;

import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.entity.SystemSetting;
import com.fypify.backend.modules.admin.repository.SystemSettingRepository;
import com.fypify.backend.modules.admin.service.AuditLogService;
import com.fypify.backend.modules.group.dto.*;
import com.fypify.backend.modules.group.entity.GroupInvite;
import com.fypify.backend.modules.group.entity.GroupInvite.InviteStatus;
import com.fypify.backend.modules.group.entity.GroupMember;
import com.fypify.backend.modules.group.entity.StudentGroup;
import com.fypify.backend.modules.group.repository.GroupInviteRepository;
import com.fypify.backend.modules.group.repository.GroupMemberRepository;
import com.fypify.backend.modules.group.repository.StudentGroupRepository;
import com.fypify.backend.modules.notification.service.NotificationService;
import com.fypify.backend.modules.project.repository.ProjectRepository;
import com.fypify.backend.modules.user.dto.UserDto;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for student group operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupService {

    private final StudentGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final GroupInviteRepository inviteRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SystemSettingRepository settingRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // Default group size limits
    private static final int DEFAULT_MIN_GROUP_SIZE = 1;
    private static final int DEFAULT_MAX_GROUP_SIZE = 4;

    // ==================== Group CRUD Operations ====================

    /**
     * Get all groups (paginated).
     */
    public Page<GroupDto> getAllGroups(Pageable pageable) {
        return groupRepository.findAllWithMembers(pageable).map(this::toDto);
    }

    /**
     * Search groups by name.
     */
    public Page<GroupDto> searchGroups(String search, Pageable pageable) {
        return groupRepository.searchByName(search, pageable).map(this::toDto);
    }

    /**
     * Get group by ID.
     */
    public GroupDto getGroupById(UUID groupId) {
        return toDto(findGroupById(groupId));
    }

    /**
     * Get group by ID with full details.
     */
    public GroupDto getGroupWithDetails(UUID groupId) {
        StudentGroup group = groupRepository.findByIdWithMembers(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
        return toDto(group);
    }

    /**
     * Get the group that a student belongs to.
     */
    public Optional<GroupDto> getStudentGroup(UUID studentId) {
        return groupRepository.findByMemberStudentId(studentId).map(this::toDto);
    }

    /**
     * Find group entity by ID.
     */
    public StudentGroup findGroupById(UUID groupId) {
        return groupRepository.findByIdWithMembers(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
    }

    /**
     * Create a new group.
     * The creating student automatically becomes the leader and first member.
     */
    @Transactional
    public GroupDto createGroup(CreateGroupRequest request, User creator) {
        // Validate creator is a student
        if (!creator.isStudent()) {
            throw new BusinessRuleException("NOT_STUDENT", "Only students can create groups");
        }

        // Check if student is already in a group
        if (memberRepository.existsByStudentId(creator.getId())) {
            throw new ConflictException("You are already a member of a group");
        }

        // Check name uniqueness
        if (groupRepository.existsByName(request.getName())) {
            throw new ConflictException("Group name '" + request.getName() + "' already exists");
        }

        // Create the group
        StudentGroup group = StudentGroup.builder()
                .name(request.getName())
                .leader(creator)
                .members(new HashSet<>())
                .build();

        group = groupRepository.save(group);

        // Add creator as first member
        GroupMember leaderMember = GroupMember.builder()
                .group(group)
                .student(creator)
                .build();
        memberRepository.save(leaderMember);
        group.getMembers().add(leaderMember);

        // Send invites to initial members if provided
        if (request.getInviteMemberIds() != null && !request.getInviteMemberIds().isEmpty()) {
            for (UUID inviteeId : request.getInviteMemberIds()) {
                if (!inviteeId.equals(creator.getId())) {
                    try {
                        sendInviteInternal(group, creator, inviteeId, null);
                    } catch (Exception e) {
                        log.warn("Failed to send invite to {}: {}", inviteeId, e.getMessage());
                    }
                }
            }
        }

        // Log the action
        auditLogService.logCreate(creator, "StudentGroup", group.getId(),
                Map.of("name", group.getName(), "leaderId", creator.getId().toString()));

        log.info("Group '{}' created by user {}", group.getName(), creator.getId());

        return toDto(group);
    }

    /**
     * Update group details.
     */
    @Transactional
    public GroupDto updateGroup(UUID groupId, UpdateGroupRequest request, User actor) {
        StudentGroup group = findGroupById(groupId);

        // Only leader or admin can update
        if (!group.isLeader(actor.getId()) && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the group leader can update group details");
        }

        String oldName = group.getName();

        if (request.getName() != null && !request.getName().equals(group.getName())) {
            if (groupRepository.existsByName(request.getName())) {
                throw new ConflictException("Group name '" + request.getName() + "' already exists");
            }
            group.setName(request.getName());
        }

        StudentGroup oldGroup = StudentGroup.builder().name(oldName).build();
        group = groupRepository.save(group);

        if (!oldName.equals(group.getName())) {
            auditLogService.logUpdate(actor, "StudentGroup", group.getId(), oldGroup, group);
        }

        return toDto(group);
    }

    /**
     * Delete a group.
     */
    @Transactional
    public void deleteGroup(UUID groupId, User actor) {
        StudentGroup group = findGroupById(groupId);

        // Only leader or admin can delete
        if (!group.isLeader(actor.getId()) && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the group leader can delete the group");
        }

        // Check if group has a project
        if (projectRepository.existsByGroupId(groupId)) {
            throw new BusinessRuleException("GROUP_HAS_PROJECT", "Cannot delete group that has a registered project");
        }

        // Cancel all pending invites
        inviteRepository.cancelAllPendingInvitesForGroup(groupId, Instant.now());

        // Delete the group (cascades to members)
        groupRepository.delete(group);

        auditLogService.logDelete(actor, "StudentGroup", groupId,
                Map.of("name", group.getName()));

        log.info("Group '{}' deleted by user {}", group.getName(), actor.getId());
    }

    // ==================== Member Management ====================

    /**
     * Remove a member from the group.
     */
    @Transactional
    public GroupDto removeMember(UUID groupId, UUID memberId, User actor) {
        StudentGroup group = findGroupById(groupId);

        // Only leader or admin can remove members
        if (!group.isLeader(actor.getId()) && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the group leader can remove members");
        }

        // Can't remove the leader
        if (group.isLeader(memberId)) {
            throw new BusinessRuleException("CANNOT_REMOVE_LEADER", "Cannot remove the group leader. Transfer leadership first.");
        }

        // Check member exists
        if (!group.hasMember(memberId)) {
            throw new ResourceNotFoundException("GroupMember", "studentId", memberId);
        }

        int oldCount = group.getMemberCount();
        memberRepository.deleteByGroupIdAndStudentId(groupId, memberId);

        auditLogService.logUpdate(actor, "StudentGroup", groupId,
                Map.of("memberCount", oldCount), Map.of("memberCount", oldCount - 1, "removedMember", memberId.toString()));

        log.info("Member {} removed from group {} by {}", memberId, groupId, actor.getId());

        return getGroupWithDetails(groupId);
    }

    /**
     * Leave a group (self-removal).
     */
    @Transactional
    public void leaveGroup(UUID groupId, User student) {
        StudentGroup group = findGroupById(groupId);

        if (!group.hasMember(student.getId())) {
            throw new BusinessRuleException("NOT_GROUP_MEMBER", "You are not a member of this group");
        }

        // Leader can't leave unless they're the only member
        if (group.isLeader(student.getId())) {
            if (group.getMemberCount() > 1) {
                throw new BusinessRuleException("LEADER_CANNOT_LEAVE", "Group leader cannot leave. Transfer leadership first or delete the group.");
            }
            // If leader is only member, delete the group
            deleteGroup(groupId, student);
            return;
        }

        int oldCount = group.getMemberCount();
        memberRepository.deleteByGroupIdAndStudentId(groupId, student.getId());

        auditLogService.logUpdate(student, "StudentGroup", groupId,
                Map.of("memberCount", oldCount), Map.of("memberCount", oldCount - 1, "leftMember", student.getId().toString()));

        log.info("Student {} left group {}", student.getId(), groupId);
    }

    /**
     * Transfer leadership to another member.
     */
    @Transactional
    public GroupDto transferLeadership(UUID groupId, UUID newLeaderId, User currentLeader) {
        StudentGroup group = findGroupById(groupId);

        // Only current leader can transfer
        if (!group.isLeader(currentLeader.getId())) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the current group leader can transfer leadership");
        }

        // New leader must be a member
        if (!group.hasMember(newLeaderId)) {
            throw new BusinessRuleException("NOT_GROUP_MEMBER", "The new leader must be a member of the group");
        }

        User newLeader = userRepository.findById(newLeaderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", newLeaderId));

        UUID oldLeaderId = group.getLeader().getId();
        group.setLeader(newLeader);
        group = groupRepository.save(group);

        auditLogService.logUpdate(currentLeader, "StudentGroup", groupId,
                Map.of("leaderId", oldLeaderId.toString()),
                Map.of("leaderId", newLeaderId.toString()));

        log.info("Leadership of group {} transferred from {} to {}", groupId, currentLeader.getId(), newLeaderId);

        return toDto(group);
    }

    // ==================== Invite Operations ====================

    /**
     * Send an invitation to join the group.
     */
    @Transactional
    public GroupInviteDto sendInvite(UUID groupId, SendInviteRequest request, User inviter) {
        StudentGroup group = findGroupById(groupId);

        // Only leader or members can send invites (business rule)
        if (!group.isLeader(inviter.getId()) && !group.hasMember(inviter.getId())) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only group members can send invitations");
        }

        return toInviteDto(sendInviteInternal(group, inviter, request.getInviteeId(), request.getMessage()));
    }

    /**
     * Internal method to send an invite.
     */
    private GroupInvite sendInviteInternal(StudentGroup group, User inviter, UUID inviteeId, String message) {
        User invitee = userRepository.findById(inviteeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", inviteeId));

        // Validate invitee is a student
        if (!invitee.isStudent()) {
            throw new BusinessRuleException("NOT_STUDENT", "Only students can be invited to groups");
        }

        // Check if already a member
        if (group.hasMember(inviteeId)) {
            throw new ConflictException("User is already a member of this group");
        }

        // Check if invitee is in another group
        if (memberRepository.existsByStudentId(inviteeId)) {
            throw new ConflictException("User is already a member of another group");
        }

        // Check if there's already a pending invite
        if (inviteRepository.existsByGroupIdAndInviteeIdAndStatus(group.getId(), inviteeId, InviteStatus.PENDING)) {
            throw new ConflictException("An invitation is already pending for this user");
        }

        // Check group size limits
        int maxSize = getMaxGroupSize();
        if (group.getMemberCount() >= maxSize) {
            throw new BusinessRuleException("GROUP_FULL", "Group has reached maximum size of " + maxSize + " members");
        }

        // Create the invite
        GroupInvite invite = GroupInvite.builder()
                .group(group)
                .inviter(inviter)
                .invitee(invitee)
                .status(InviteStatus.PENDING)
                .message(message)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS)) // 7 day expiry
                .build();

        invite = inviteRepository.save(invite);

        // Send notification
        notificationService.sendGroupInviteNotification(invitee, group.getId(), group.getName(), inviter);

        log.info("Invite sent from {} to {} for group {}", inviter.getId(), inviteeId, group.getId());

        return invite;
    }

    /**
     * Get pending invites received by a user.
     */
    public List<GroupInviteDto> getPendingInvitesForUser(UUID userId) {
        return inviteRepository.findByInviteeIdAndStatus(userId, InviteStatus.PENDING).stream()
                .map(this::toInviteDto)
                .collect(Collectors.toList());
    }

    /**
     * Get pending invites sent by a group.
     */
    public List<GroupInviteDto> getPendingInvitesForGroup(UUID groupId) {
        return inviteRepository.findByGroupIdAndStatus(groupId, InviteStatus.PENDING).stream()
                .map(this::toInviteDto)
                .collect(Collectors.toList());
    }

    /**
     * Respond to an invite (accept or decline).
     */
    @Transactional
    public GroupInviteDto respondToInvite(UUID inviteId, boolean accept, User user) {
        GroupInvite invite = inviteRepository.findByIdWithRelations(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("GroupInvite", "id", inviteId));

        // Verify this invite belongs to the user
        if (!invite.getInvitee().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("GroupInvite", "id", inviteId);
        }

        // Check if still pending
        if (!invite.isPending()) {
            throw new BusinessRuleException("INVITE_ALREADY_PROCESSED", "This invitation has already been responded to");
        }

        // Check if expired
        if (invite.isExpired()) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new BusinessRuleException("INVITE_EXPIRED", "This invitation has expired");
        }

        if (accept) {
            // Check if user joined another group in the meantime
            if (memberRepository.existsByStudentId(user.getId())) {
                invite.decline();
                inviteRepository.save(invite);
                throw new ConflictException("You are already a member of another group");
            }

            // Check group size
            StudentGroup group = invite.getGroup();
            int maxSize = getMaxGroupSize();
            if (group.getMemberCount() >= maxSize) {
                throw new BusinessRuleException("GROUP_FULL", "Group has reached maximum size of " + maxSize + " members");
            }

            // Accept and add to group
            invite.accept();

            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .student(user)
                    .build();
            memberRepository.save(newMember);

            log.info("User {} accepted invite and joined group {}", user.getId(), group.getId());
        } else {
            invite.decline();
            log.info("User {} declined invite for group {}", user.getId(), invite.getGroup().getId());
        }

        return toInviteDto(inviteRepository.save(invite));
    }

    /**
     * Cancel an invite (by the inviter or leader).
     */
    @Transactional
    public void cancelInvite(UUID inviteId, User actor) {
        GroupInvite invite = inviteRepository.findByIdWithRelations(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("GroupInvite", "id", inviteId));

        // Only inviter, leader, or admin can cancel
        boolean canCancel = invite.getInviter().getId().equals(actor.getId()) ||
                invite.getGroup().isLeader(actor.getId()) ||
                actor.isAdmin();

        if (!canCancel) {
            throw new BusinessRuleException("PERMISSION_DENIED", "You don't have permission to cancel this invitation");
        }

        if (!invite.isPending()) {
            throw new BusinessRuleException("INVITE_NOT_PENDING", "This invitation cannot be cancelled");
        }

        invite.cancel();
        inviteRepository.save(invite);

        log.info("Invite {} cancelled by user {}", inviteId, actor.getId());
    }

    // ==================== Utility Methods ====================

    /**
     * Get minimum group size from settings.
     */
    private int getMinGroupSize() {
        return settingRepository.findById("group_min_size")
                .map(s -> s.getValueAsInteger())
                .orElse(DEFAULT_MIN_GROUP_SIZE);
    }

    /**
     * Get maximum group size from settings.
     */
    private int getMaxGroupSize() {
        return settingRepository.findById("group_max_size")
                .map(s -> s.getValueAsInteger())
                .orElse(DEFAULT_MAX_GROUP_SIZE);
    }

    /**
     * Get available students for invitation (not in any group).
     */
    public Page<UserDto> getAvailableStudents(String search, Pageable pageable) {
        // This would be implemented in UserRepository/UserService
        // For now, returning empty - should filter students not in any group
        return Page.empty();
    }

    /**
     * Convert StudentGroup entity to DTO.
     */
    public GroupDto toDto(StudentGroup group) {
        List<GroupMemberDto> memberDtos = group.getMembers().stream()
                .map(m -> GroupMemberDto.builder()
                        .studentId(m.getStudent().getId())
                        .studentName(m.getStudent().getFullName())
                        .studentEmail(m.getStudent().getEmail())
                        .isLeader(group.isLeader(m.getStudent().getId()))
                        .joinedAt(m.getJoinedAt())
                        .build())
                .sorted((a, b) -> Boolean.compare(b.isLeader(), a.isLeader())) // Leader first
                .collect(Collectors.toList());

        UUID projectId = projectRepository.findByGroupId(group.getId())
                .map(p -> p.getId())
                .orElse(null);

        return GroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .leader(group.getLeader() != null ? toUserDto(group.getLeader()) : null)
                .members(memberDtos)
                .memberCount(group.getMemberCount())
                .hasProject(projectId != null)
                .projectId(projectId)
                .createdAt(group.getCreatedAt())
                .build();
    }

    /**
     * Convert GroupInvite entity to DTO.
     */
    private GroupInviteDto toInviteDto(GroupInvite invite) {
        return GroupInviteDto.builder()
                .id(invite.getId())
                .groupId(invite.getGroup().getId())
                .groupName(invite.getGroup().getName())
                .inviterId(invite.getInviter().getId())
                .inviterName(invite.getInviter().getFullName())
                .inviteeId(invite.getInvitee().getId())
                .inviteeName(invite.getInvitee().getFullName())
                .inviteeEmail(invite.getInvitee().getEmail())
                .status(invite.getStatus().name())
                .message(invite.getMessage())
                .createdAt(invite.getCreatedAt())
                .respondedAt(invite.getRespondedAt())
                .expiresAt(invite.getExpiresAt())
                .build();
    }

    /**
     * Convert User entity to simplified DTO.
     */
    private UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
