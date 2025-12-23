package com.fypify.backend.modules.group.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.group.dto.*;
import com.fypify.backend.modules.group.service.GroupService;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for Student Group operations.
 * Provides endpoints for group management, membership, and invitations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural) - Controller as Thin Facade
 *    - This controller acts as a thin facade over the GroupService.
 *    - It delegates all business logic to the service layer (SRP compliance).
 *    - Each endpoint method follows the same structure:
 *      Request → Validate → Delegate to Service → Wrap in ApiResponse → Return
 * 
 * 2. SINGLETON PATTERN (Creational) - via Spring @RestController
 *    - Controller is a singleton bean managed by Spring container.
 *    - Single instance handles all HTTP requests for this endpoint.
 * 
 * 3. DEPENDENCY INJECTION PATTERN
 *    - Uses @RequiredArgsConstructor for constructor-based DI.
 *    - Dependencies (GroupService, UserService) injected at creation time.
 *    - Promotes loose coupling and testability.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. COMMAND PATTERN (Behavioral) - Suggested for Complex Operations
 *    - WHERE: Each endpoint could encapsulate its operation as a Command object.
 *    - HOW: Create Command classes (CreateGroupCommand, DeleteGroupCommand, etc.)
 *    - BENEFIT: Enables undo/redo, logging, and queuing of operations.
 *    - Example:
 *      public interface GroupCommand<T> {
 *          T execute();
 *      }
 *      
 *      class CreateGroupCommand implements GroupCommand<GroupDto> {
 *          private final CreateGroupRequest request;
 *          private final User creator;
 *          private final GroupService service;
 *          
 *          public GroupDto execute() {
 *              return service.createGroup(request, creator);
 *          }
 *      }
 * 
 * 2. DECORATOR PATTERN (Structural) - Suggested for Cross-Cutting Concerns
 *    - Already partially implemented via Spring AOP (@PreAuthorize, @Valid)
 *    - Could be extended for custom logging, metrics, or caching decorators.
 * 
 * ===========================================================================================
 */
@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@Tag(name = "Groups", description = "Student group management")
public class GroupController {

    private final GroupService groupService;
    private final UserService userService;

    // ==================== Group CRUD ====================

    /**
     * Get all groups (Admin/FYP Committee).
     * GET /api/v1/groups
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE', 'SUPERVISOR')")
    @Operation(summary = "Get all groups", description = "Get all student groups (Admin/FYP Committee only)")
    public ResponseEntity<ApiResponse<Page<GroupDto>>> getAllGroups(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<GroupDto> groups = groupService.getAllGroups(pageable);
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    /**
     * Search groups by name.
     * GET /api/v1/groups/search?q=
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE', 'SUPERVISOR')")
    @Operation(summary = "Search groups", description = "Search groups by name")
    public ResponseEntity<ApiResponse<Page<GroupDto>>> searchGroups(
            @RequestParam("q") String query,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<GroupDto> groups = groupService.searchGroups(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    /**
     * Get current user's group.
     * GET /api/v1/groups/my-group
     */
    @GetMapping("/my-group")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my group", description = "Get the group that the current student belongs to")
    public ResponseEntity<ApiResponse<GroupDto>> getMyGroup(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User student = userService.getByEmail(userDetails.getUsername());
        return groupService.getStudentGroup(student.getId())
                .map(group -> ResponseEntity.ok(ApiResponse.success(group)))
                .orElse(ResponseEntity.ok(ApiResponse.success(null, "You are not a member of any group")));
    }

    /**
     * Get group by ID.
     * GET /api/v1/groups/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get group by ID", description = "Get group details by ID")
    public ResponseEntity<ApiResponse<GroupDto>> getGroupById(@PathVariable UUID id) {
        GroupDto group = groupService.getGroupWithDetails(id);
        return ResponseEntity.ok(ApiResponse.success(group));
    }

    /**
     * Create a new group.
     * POST /api/v1/groups
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Create a group", description = "Create a new student group. The creator becomes the leader.")
    public ResponseEntity<ApiResponse<GroupDto>> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User creator = userService.getByEmail(userDetails.getUsername());
        GroupDto group = groupService.createGroup(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(group, "Group created successfully"));
    }

    /**
     * Update group details.
     * PUT /api/v1/groups/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update group", description = "Update group details (leader only)")
    public ResponseEntity<ApiResponse<GroupDto>> updateGroup(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGroupRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        GroupDto group = groupService.updateGroup(id, request, actor);
        return ResponseEntity.ok(ApiResponse.success(group, "Group updated successfully"));
    }

    /**
     * Delete a group.
     * DELETE /api/v1/groups/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Delete group", description = "Delete a group (leader or admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        groupService.deleteGroup(id, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Group deleted successfully"));
    }

    // ==================== Member Management ====================

    /**
     * Remove a member from the group.
     * DELETE /api/v1/groups/{id}/members/{memberId}
     */
    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Remove member", description = "Remove a member from the group (leader only)")
    public ResponseEntity<ApiResponse<GroupDto>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID memberId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        GroupDto group = groupService.removeMember(id, memberId, actor);
        return ResponseEntity.ok(ApiResponse.success(group, "Member removed successfully"));
    }

    /**
     * Leave the group.
     * POST /api/v1/groups/{id}/leave
     */
    @PostMapping("/{id}/leave")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Leave group", description = "Leave the current group")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User student = userService.getByEmail(userDetails.getUsername());
        groupService.leaveGroup(id, student);
        return ResponseEntity.ok(ApiResponse.success(null, "You have left the group"));
    }

    /**
     * Transfer leadership to another member.
     * POST /api/v1/groups/{id}/transfer-leadership
     */
    @PostMapping("/{id}/transfer-leadership")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Transfer leadership", description = "Transfer group leadership to another member")
    public ResponseEntity<ApiResponse<GroupDto>> transferLeadership(
            @PathVariable UUID id,
            @RequestParam("newLeaderId") UUID newLeaderId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentLeader = userService.getByEmail(userDetails.getUsername());
        GroupDto group = groupService.transferLeadership(id, newLeaderId, currentLeader);
        return ResponseEntity.ok(ApiResponse.success(group, "Leadership transferred successfully"));
    }

    // ==================== Invitations ====================

    /**
     * Send an invitation to join the group.
     * POST /api/v1/groups/{id}/invites
     */
    @PostMapping("/{id}/invites")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Send invite", description = "Send an invitation to a student to join the group")
    public ResponseEntity<ApiResponse<GroupInviteDto>> sendInvite(
            @PathVariable UUID id,
            @Valid @RequestBody SendInviteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User inviter = userService.getByEmail(userDetails.getUsername());
        GroupInviteDto invite = groupService.sendInvite(id, request, inviter);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(invite, "Invitation sent successfully"));
    }

    /**
     * Get pending invites for the group.
     * GET /api/v1/groups/{id}/invites
     */
    @GetMapping("/{id}/invites")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get group invites", description = "Get pending invitations sent by the group")
    public ResponseEntity<ApiResponse<List<GroupInviteDto>>> getGroupInvites(@PathVariable UUID id) {
        List<GroupInviteDto> invites = groupService.getPendingInvitesForGroup(id);
        return ResponseEntity.ok(ApiResponse.success(invites));
    }

    /**
     * Cancel an invitation.
     * DELETE /api/v1/groups/{groupId}/invites/{inviteId}
     */
    @DeleteMapping("/{groupId}/invites/{inviteId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Cancel invite", description = "Cancel a pending invitation")
    public ResponseEntity<ApiResponse<Void>> cancelInvite(
            @PathVariable UUID groupId,
            @PathVariable UUID inviteId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        groupService.cancelInvite(inviteId, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Invitation cancelled"));
    }

    /**
     * Get my pending invitations.
     * GET /api/v1/groups/invites/my-invites
     */
    @GetMapping("/invites/my-invites")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my invites", description = "Get pending invitations received by the current user")
    public ResponseEntity<ApiResponse<List<GroupInviteDto>>> getMyInvites(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User student = userService.getByEmail(userDetails.getUsername());
        List<GroupInviteDto> invites = groupService.getPendingInvitesForUser(student.getId());
        return ResponseEntity.ok(ApiResponse.success(invites));
    }

    /**
     * Respond to an invitation.
     * POST /api/v1/groups/invites/{inviteId}/respond
     */
    @PostMapping("/invites/{inviteId}/respond")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Respond to invite", description = "Accept or decline a group invitation")
    public ResponseEntity<ApiResponse<GroupInviteDto>> respondToInvite(
            @PathVariable UUID inviteId,
            @Valid @RequestBody InviteResponseRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User student = userService.getByEmail(userDetails.getUsername());
        GroupInviteDto invite = groupService.respondToInvite(inviteId, request.getAccept(), student);
        String message = request.getAccept() ? "You have joined the group" : "Invitation declined";
        return ResponseEntity.ok(ApiResponse.success(invite, message));
    }
}
