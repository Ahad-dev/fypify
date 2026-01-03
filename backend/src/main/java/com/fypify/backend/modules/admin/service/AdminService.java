package com.fypify.backend.modules.admin.service;

import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.dto.CommitteeMemberDto;
import com.fypify.backend.modules.admin.dto.GroupSizeSettingsDto;
import com.fypify.backend.modules.admin.entity.EvalCommitteeMember;
import com.fypify.backend.modules.admin.entity.FypCommitteeMember;
import com.fypify.backend.modules.admin.entity.SystemSetting;
import com.fypify.backend.modules.admin.repository.EvalCommitteeMemberRepository;
import com.fypify.backend.modules.admin.repository.FypCommitteeMemberRepository;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin Service for managing committees, settings, and administrative operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural)
 *    - Provides a unified interface for admin operations.
 *    - Clients interact with AdminService instead of multiple repositories.
 *    - Simplifies complex subsystem interactions (committees, settings).
 * 
 * 2. SERVICE LAYER PATTERN (Enterprise Pattern)
 *    - Encapsulates business logic for admin operations.
 *    - Coordinates between repositories and enforces business rules.
 *    - Transaction boundary for data consistency.
 * 
 * 3. DATA TRANSFER OBJECT (DTO) PATTERN
 *    - Uses DTOs to transfer committee member data to avoid exposing entities.
 *    - Decouples presentation from persistence layer.
 * 
 * 4. TEMPLATE METHOD PATTERN (Behavioral) - Implicit
 *    - Common pattern across add/remove methods for both committees.
 *    - addFypCommitteeMember and addEvalCommitteeMember follow same template.
 * 
 * ===========================================================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final FypCommitteeMemberRepository fypCommitteeMemberRepository;
    private final EvalCommitteeMemberRepository evalCommitteeMemberRepository;
    private final UserRepository userRepository;
    private final SystemSettingService systemSettingService;
    private final AuditLogService auditLogService;

    // ==================== FYP Committee Management ====================

    /**
     * Get all FYP Committee members.
     */
    @Transactional(readOnly = true)
    public List<CommitteeMemberDto> getFypCommitteeMembers() {
        return fypCommitteeMemberRepository.findAllWithUserDetails()
                .stream()
                .map(this::toCommitteeMemberDto)
                .collect(Collectors.toList());
    }

    /**
     * Add a user to the FYP Committee.
     */
    @Transactional
    public CommitteeMemberDto addFypCommitteeMember(UUID userId, User actor) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Check if already a member
        if (fypCommitteeMemberRepository.existsByUserId(userId)) {
            throw new ConflictException("User is already a member of FYP Committee");
        }

        // Create membership
        FypCommitteeMember member = FypCommitteeMember.builder()
                .userId(userId)
                .user(user)
                .build();

        member = fypCommitteeMemberRepository.save(member);

        // Audit log
        auditLogService.logAsync(actor, "ADD_FYP_COMMITTEE_MEMBER", "FypCommitteeMember", 
                null, java.util.Map.of("userId", userId, "userName", user.getFullName()));

        log.info("Added user {} to FYP Committee by {}", userId, actor.getEmail());
        return toCommitteeMemberDto(member);
    }

    /**
     * Remove a user from the FYP Committee.
     */
    @Transactional
    public void removeFypCommitteeMember(UUID userId, User actor) {
        if (!fypCommitteeMemberRepository.existsByUserId(userId)) {
            throw new ResourceNotFoundException("User is not a member of FYP Committee");
        }

        fypCommitteeMemberRepository.deleteByUserId(userId);

        // Audit log
        auditLogService.logAsync(actor, "REMOVE_FYP_COMMITTEE_MEMBER", "FypCommitteeMember", 
                null, java.util.Map.of("userId", userId));

        log.info("Removed user {} from FYP Committee by {}", userId, actor.getEmail());
    }

    // ==================== Evaluation Committee Management ====================

    /**
     * Get all Evaluation Committee members.
     */
    @Transactional(readOnly = true)
    public List<CommitteeMemberDto> getEvalCommitteeMembers() {
        return evalCommitteeMemberRepository.findAllWithUserDetails()
                .stream()
                .map(this::toEvalCommitteeMemberDto)
                .collect(Collectors.toList());
    }

    /**
     * Add a user to the Evaluation Committee.
     */
    @Transactional
    public CommitteeMemberDto addEvalCommitteeMember(UUID userId, User actor) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Check if already a member
        if (evalCommitteeMemberRepository.existsByUserId(userId)) {
            throw new ConflictException("User is already a member of Evaluation Committee");
        }

        // Create membership
        EvalCommitteeMember member = EvalCommitteeMember.builder()
                .userId(userId)
                .user(user)
                .build();

        member = evalCommitteeMemberRepository.save(member);

        // Audit log
        auditLogService.logAsync(actor, "ADD_EVAL_COMMITTEE_MEMBER", "EvalCommitteeMember", 
                null, java.util.Map.of("userId", userId, "userName", user.getFullName()));

        log.info("Added user {} to Evaluation Committee by {}", userId, actor.getEmail());
        return toEvalCommitteeMemberDto(member);
    }

    /**
     * Remove a user from the Evaluation Committee.
     */
    @Transactional
    public void removeEvalCommitteeMember(UUID userId, User actor) {
        if (!evalCommitteeMemberRepository.existsByUserId(userId)) {
            throw new ResourceNotFoundException("User is not a member of Evaluation Committee");
        }

        evalCommitteeMemberRepository.deleteByUserId(userId);

        // Audit log
        auditLogService.logAsync(actor, "REMOVE_EVAL_COMMITTEE_MEMBER", "EvalCommitteeMember", 
                null, java.util.Map.of("userId", userId));

        log.info("Removed user {} from Evaluation Committee by {}", userId, actor.getEmail());
    }

    // ==================== Group Size Settings ====================

    /**
     * Get current group size settings.
     */
    @Transactional(readOnly = true)
    public GroupSizeSettingsDto getGroupSizeSettings() {
        Integer minSize = systemSettingService.getGroupMinSize();
        Integer maxSize = systemSettingService.getGroupMaxSize();

        return GroupSizeSettingsDto.builder()
                .minSize(minSize)
                .maxSize(maxSize)
                .build();
    }

    /**
     * Update group size settings.
     */
    @Transactional
    public GroupSizeSettingsDto updateGroupSizeSettings(GroupSizeSettingsDto dto, User actor) {
        // Validate min <= max
        if (dto.getMinSize() > dto.getMaxSize()) {
            throw new BusinessRuleException("INVALID_SIZE_RANGE", 
                    "Minimum size cannot be greater than maximum size");
        }

        // Update settings
        systemSettingService.updateSetting(SystemSetting.KEY_GROUP_MIN_SIZE, 
                java.util.Map.of("value", dto.getMinSize()), actor);
        systemSettingService.updateSetting(SystemSetting.KEY_GROUP_MAX_SIZE, 
                java.util.Map.of("value", dto.getMaxSize()), actor);

        // Audit log
        auditLogService.logAsync(actor, "UPDATE_GROUP_SIZE_SETTINGS", "SystemSetting", 
                null, java.util.Map.of("minSize", dto.getMinSize(), "maxSize", dto.getMaxSize()));

        log.info("Updated group size settings: min={}, max={} by {}", 
                dto.getMinSize(), dto.getMaxSize(), actor.getEmail());

        return dto;
    }

    // ==================== Mapper Methods ====================

    private CommitteeMemberDto toCommitteeMemberDto(FypCommitteeMember member) {
        User user = member.getUser();
        return CommitteeMemberDto.builder()
                .userId(member.getUserId())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .role(user != null && user.getRole() != null ? user.getRole().getName() : null)
                .addedAt(member.getAddedAt())
                .build();
    }

    private CommitteeMemberDto toEvalCommitteeMemberDto(EvalCommitteeMember member) {
        User user = member.getUser();
        return CommitteeMemberDto.builder()
                .userId(member.getUserId())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .role(user != null && user.getRole() != null ? user.getRole().getName() : null)
                .addedAt(member.getAddedAt())
                .build();
    }
}
