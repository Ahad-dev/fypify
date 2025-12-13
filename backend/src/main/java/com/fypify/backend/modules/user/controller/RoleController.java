package com.fypify.backend.modules.user.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.user.dto.RoleDto;
import com.fypify.backend.modules.user.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for Role management endpoints.
 */
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role management endpoints")
public class RoleController {

    private final RoleService roleService;

    /**
     * Get all roles.
     * GET /api/v1/roles
     * Accessible to authenticated users.
     */
    @GetMapping
    @Operation(summary = "Get all roles", description = "Get list of all available roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        List<RoleDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    /**
     * Get role by ID.
     * GET /api/v1/roles/{id}
     * Requires: ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get role by ID", description = "Get role details by ID")
    public ResponseEntity<ApiResponse<RoleDto>> getRoleById(@PathVariable UUID id) {
        RoleDto role = roleService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(role));
    }

    /**
     * Get role by name.
     * GET /api/v1/roles/name/{name}
     * Requires: ADMIN
     */
    @GetMapping("/name/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get role by name", description = "Get role details by name")
    public ResponseEntity<ApiResponse<RoleDto>> getRoleByName(@PathVariable String name) {
        RoleDto role = roleService.getByName(name);
        return ResponseEntity.ok(ApiResponse.success(role));
    }
}
