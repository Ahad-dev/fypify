package com.fypify.backend.modules.admin.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.admin.dto.SystemSettingDto;
import com.fypify.backend.modules.admin.dto.UpdateSystemSettingRequest;
import com.fypify.backend.modules.admin.service.SystemSettingService;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for System Settings management.
 * Admin-only endpoints for configuring system-wide settings.
 */
@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "System Settings", description = "System settings management (Admin only)")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;
    private final UserService userService;

    /**
     * Get all system settings.
     * GET /api/v1/admin/settings
     */
    @GetMapping
    @Operation(summary = "Get all settings", description = "Get all system settings")
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getAllSettings() {
        List<SystemSettingDto> settings = systemSettingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    /**
     * Get a specific setting by key.
     * GET /api/v1/admin/settings/{key}
     */
    @GetMapping("/{key}")
    @Operation(summary = "Get setting by key", description = "Get a specific system setting by its key")
    public ResponseEntity<ApiResponse<SystemSettingDto>> getSettingByKey(@PathVariable String key) {
        SystemSettingDto setting = systemSettingService.getByKey(key);
        return ResponseEntity.ok(ApiResponse.success(setting));
    }

    /**
     * Update or create a system setting.
     * PUT /api/v1/admin/settings
     */
    @PutMapping
    @Operation(summary = "Update setting", description = "Update or create a system setting")
    public ResponseEntity<ApiResponse<SystemSettingDto>> updateSetting(
            @Valid @RequestBody UpdateSystemSettingRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        SystemSettingDto setting = systemSettingService.updateSetting(request.getKey(), request.getValue(), actor);
        return ResponseEntity.ok(ApiResponse.success(setting, "Setting updated successfully"));
    }

    /**
     * Delete a system setting.
     * DELETE /api/v1/admin/settings/{key}
     */
    @DeleteMapping("/{key}")
    @Operation(summary = "Delete setting", description = "Delete a system setting")
    public ResponseEntity<ApiResponse<Void>> deleteSetting(
            @PathVariable String key,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        systemSettingService.deleteSetting(key, actor);
        return ResponseEntity.ok(ApiResponse.success("Setting deleted successfully"));
    }
}
