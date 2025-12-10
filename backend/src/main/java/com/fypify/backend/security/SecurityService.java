package com.fypify.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Security service for permission checks in @PreAuthorize annotations.
 * Usage: @PreAuthorize("@securityService.isGroupLeader(#groupId)")
 */
@Component("securityService")
public class SecurityService {

    /**
     * Get current authenticated user principal.
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * Get current user ID.
     */
    public UUID getCurrentUserId() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Check if current user is an admin.
     */
    public boolean isAdmin() {
        UserPrincipal user = getCurrentUser();
        return user != null && "ADMIN".equals(user.getRole());
    }

    /**
     * Check if current user is a student.
     */
    public boolean isStudent() {
        UserPrincipal user = getCurrentUser();
        return user != null && "STUDENT".equals(user.getRole());
    }

    /**
     * Check if current user is a supervisor.
     */
    public boolean isSupervisor() {
        UserPrincipal user = getCurrentUser();
        return user != null && "SUPERVISOR".equals(user.getRole());
    }

    /**
     * Check if current user is FYP committee member.
     */
    public boolean isFypCommittee() {
        UserPrincipal user = getCurrentUser();
        return user != null && "FYP_COMMITTEE".equals(user.getRole());
    }

    /**
     * Check if current user is evaluation committee member.
     */
    public boolean isEvalCommittee() {
        UserPrincipal user = getCurrentUser();
        return user != null && "EVALUATION_COMMITTEE".equals(user.getRole());
    }

    /**
     * Check if current user has specific role.
     */
    public boolean hasRole(String role) {
        UserPrincipal user = getCurrentUser();
        return user != null && role.equals(user.getRole());
    }

    // ==================== Placeholder methods for future implementation ====================

    /**
     * Check if current user is the leader of the specified group.
     * TODO: Implement when group module is created.
     */
    public boolean isGroupLeader(UUID groupId) {
        // Will be implemented in group module
        return false;
    }

    /**
     * Check if current user is a member of the specified group.
     * TODO: Implement when group module is created.
     */
    public boolean isGroupMember(UUID groupId) {
        // Will be implemented in group module
        return false;
    }

    /**
     * Check if current user is the assigned supervisor of the project.
     * TODO: Implement when project module is created.
     */
    public boolean isProjectSupervisor(UUID projectId) {
        // Will be implemented in project module
        return false;
    }

    /**
     * Check if current user can access the project (member, supervisor, committee, admin).
     * TODO: Implement when project module is created.
     */
    public boolean canAccessProject(UUID projectId) {
        // Will be implemented in project module
        return isAdmin() || isFypCommittee();
    }
}
