package com.fypify.backend.modules.admin.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.admin.dto.SystemSettingDto;
import com.fypify.backend.modules.admin.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public controller for reading System Settings.
 * Available to all authenticated users (no admin required).
 */
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Public Settings", description = "Public system settings endpoints")
public class PublicSettingController {

    private final SystemSettingService systemSettingService;

    /**
     * Get all system settings (read-only).
     * GET /api/v1/settings
     */
    @GetMapping
    @Operation(summary = "Get all settings", description = "Get all system settings (public read-only)")
    public ResponseEntity<ApiResponse<List<SystemSettingDto>>> getAllSettings() {
        List<SystemSettingDto> settings = systemSettingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    /**
     * Get a specific setting by key.
     * GET /api/v1/settings/{key}
     */
    @GetMapping("/{key}")
    @Operation(summary = "Get setting by key", description = "Get a specific system setting by its key")
    public ResponseEntity<ApiResponse<SystemSettingDto>> getSettingByKey(@PathVariable String key) {
        SystemSettingDto setting = systemSettingService.getByKey(key);
        return ResponseEntity.ok(ApiResponse.success(setting));
    }
}
