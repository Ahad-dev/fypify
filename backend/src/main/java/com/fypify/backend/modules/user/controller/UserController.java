package com.fypify.backend.modules.user.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.user.dto.CreateUserRequest;
import com.fypify.backend.modules.user.dto.UpdateUserRequest;
import com.fypify.backend.modules.user.dto.UserDto;
import com.fypify.backend.modules.user.entity.Role;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for User management endpoints.
 * Most operations require ADMIN role.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    /**
     * Get all users with pagination.
     * GET /api/v1/users
     * Requires: ADMIN or FYP_COMMITTEE
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Get all users", description = "Get paginated list of all users")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<UserDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Get user by ID.
     * GET /api/v1/users/{id}
     * Requires: ADMIN or FYP_COMMITTEE
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Get user by ID", description = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable UUID id) {
        UserDto user = userService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Get users by role.
     * GET /api/v1/users/role/{roleName}
     * Requires: ADMIN or FYP_COMMITTEE
     */
    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Get users by role", description = "Get all users with a specific role")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByRole(@PathVariable String roleName) {
        List<UserDto> users = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * Get all supervisors.
     * GET /api/v1/users/supervisors
     * Accessible to authenticated users (for project assignment).
     */
    @GetMapping("/supervisors")
    @Operation(summary = "Get all supervisors", description = "Get list of all supervisors")
    public ResponseEntity<ApiResponse<List<UserDto>>> getSupervisors() {
        List<UserDto> supervisors = userService.getUsersByRole(Role.SUPERVISOR);
        return ResponseEntity.ok(ApiResponse.success(supervisors));
    }

    /**
     * Get all students.
     * GET /api/v1/users/students
     * Requires: ADMIN, FYP_COMMITTEE, or SUPERVISOR
     */
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE', 'SUPERVISOR')")
    @Operation(summary = "Get all students", description = "Get list of all students")
    public ResponseEntity<ApiResponse<List<UserDto>>> getStudents() {
        List<UserDto> students = userService.getUsersByRole(Role.STUDENT);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    /**
     * Create a new user.
     * POST /api/v1/users
     * Requires: ADMIN only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create a new user (admin only)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        UserDto user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User created successfully"));
    }

    /**
     * Update user.
     * PUT /api/v1/users/{id}
     * Requires: ADMIN only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user", description = "Update user details (admin only)")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserDto user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User updated successfully"));
    }

    /**
     * Delete user (soft delete).
     * DELETE /api/v1/users/{id}
     * Requires: ADMIN only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete user (soft delete, admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    /**
     * Activate user.
     * POST /api/v1/users/{id}/activate
     * Requires: ADMIN only
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate user", description = "Activate a deactivated user")
    public ResponseEntity<ApiResponse<UserDto>> activateUser(@PathVariable UUID id) {
        UserDto user = userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User activated successfully"));
    }

    /**
     * Deactivate user.
     * POST /api/v1/users/{id}/deactivate
     * Requires: ADMIN only
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate user", description = "Deactivate a user")
    public ResponseEntity<ApiResponse<UserDto>> deactivateUser(@PathVariable UUID id) {
        UserDto user = userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User deactivated successfully"));
    }
}
