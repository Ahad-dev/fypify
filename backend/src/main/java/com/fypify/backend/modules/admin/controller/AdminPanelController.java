package com.fypify.backend.modules.admin.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.admin.dto.CommitteeMemberDto;
import com.fypify.backend.modules.admin.dto.GroupSizeSettingsDto;
import com.fypify.backend.modules.admin.service.AdminService;
import com.fypify.backend.modules.admin.service.ReportsService;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Controller for Admin Panel operations.
 * Handles committee management, settings, and reports.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. CONTROLLER PATTERN (MVC/Enterprise Pattern)
 *    - Acts as the entry point for HTTP requests.
 *    - Delegates business logic to services (AdminService, ReportsService).
 *    - Handles request/response transformation.
 * 
 * 2. FACADE PATTERN (Structural)
 *    - Provides simplified API endpoints for complex admin operations.
 *    - Front controller for all admin-related requests.
 * 
 * 3. DEPENDENCY INJECTION (IoC Pattern)
 *    - Services injected via constructor injection.
 *    - Promotes loose coupling and testability.
 * 
 * ===========================================================================================
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Panel", description = "Admin operations: committees, settings, reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPanelController {

    private final AdminService adminService;
    private final ReportsService reportsService;
    private final UserService userService;

    // ==================== FYP Committee Management ====================

    @GetMapping("/committee/fyp")
    @Operation(summary = "Get FYP Committee members", description = "List all FYP Committee members")
    public ResponseEntity<ApiResponse<List<CommitteeMemberDto>>> getFypCommitteeMembers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getFypCommitteeMembers()));
    }

    @PostMapping("/committee/fyp/{userId}")
    @Operation(summary = "Add FYP Committee member", description = "Add a user to the FYP Committee")
    public ResponseEntity<ApiResponse<CommitteeMemberDto>> addFypCommitteeMember(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            adminService.addFypCommitteeMember(userId, actor),
            "Member added to FYP Committee"
        ));
    }

    @DeleteMapping("/committee/fyp/{userId}")
    @Operation(summary = "Remove FYP Committee member", description = "Remove a user from the FYP Committee")
    public ResponseEntity<ApiResponse<Void>> removeFypCommitteeMember(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userService.getByEmail(userDetails.getUsername());
        adminService.removeFypCommitteeMember(userId, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed from FYP Committee"));
    }

    // ==================== Evaluation Committee Management ====================

    @GetMapping("/committee/eval")
    @Operation(summary = "Get Evaluation Committee members", description = "List all Evaluation Committee members")
    public ResponseEntity<ApiResponse<List<CommitteeMemberDto>>> getEvalCommitteeMembers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getEvalCommitteeMembers()));
    }

    @PostMapping("/committee/eval/{userId}")
    @Operation(summary = "Add Evaluation Committee member", description = "Add a user to the Evaluation Committee")
    public ResponseEntity<ApiResponse<CommitteeMemberDto>> addEvalCommitteeMember(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            adminService.addEvalCommitteeMember(userId, actor),
            "Member added to Evaluation Committee"
        ));
    }

    @DeleteMapping("/committee/eval/{userId}")
    @Operation(summary = "Remove Evaluation Committee member", description = "Remove a user from the Evaluation Committee")
    public ResponseEntity<ApiResponse<Void>> removeEvalCommitteeMember(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userService.getByEmail(userDetails.getUsername());
        adminService.removeEvalCommitteeMember(userId, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed from Evaluation Committee"));
    }

    // ==================== Group Size Settings ====================

    @GetMapping("/settings/group-size")
    @Operation(summary = "Get group size settings", description = "Get current min/max group size settings")
    public ResponseEntity<ApiResponse<GroupSizeSettingsDto>> getGroupSizeSettings() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getGroupSizeSettings()));
    }

    @PutMapping("/settings/group-size")
    @Operation(summary = "Update group size settings", description = "Update min/max group size settings")
    public ResponseEntity<ApiResponse<GroupSizeSettingsDto>> updateGroupSizeSettings(
            @Valid @RequestBody GroupSizeSettingsDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User actor = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            adminService.updateGroupSizeSettings(dto, actor),
            "Group size settings updated"
        ));
    }

    // ==================== Reports Export ====================

    @GetMapping("/reports/marksheet/{projectId}/excel")
    @Operation(summary = "Export project marksheet (Excel)", description = "Generate Excel marksheet for a project")
    public ResponseEntity<byte[]> exportProjectMarksheetExcel(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User actor = userService.getByEmail(userDetails.getUsername());
        byte[] excelBytes = reportsService.generateProjectMarksheetExcel(projectId, actor);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marksheet-" + projectId + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/reports/marksheet/all/excel")
    @Operation(summary = "Export all marksheets (Excel)", description = "Generate Excel with all released project results")
    public ResponseEntity<byte[]> exportAllMarksheetExcel(
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        User actor = userService.getByEmail(userDetails.getUsername());
        byte[] excelBytes = reportsService.generateAllMarksheetExcel(actor);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=all-results.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
