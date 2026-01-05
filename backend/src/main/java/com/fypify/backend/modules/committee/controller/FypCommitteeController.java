package com.fypify.backend.modules.committee.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.committee.dto.*;
import com.fypify.backend.modules.committee.service.FinalResultService;
import com.fypify.backend.modules.committee.service.FypCommitteeService;
import com.fypify.backend.modules.project.dto.ProjectDto;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for FYP Committee operations.
 * Handles project approval/rejection, deadline management, and final results.
 */
@RestController
@RequestMapping("/api/v1/committee/fyp")
@RequiredArgsConstructor
@Tag(name = "FYP Committee", description = "FYP Committee operations for project approval and deadline management")
public class FypCommitteeController {

    private final FypCommitteeService fypCommitteeService;
    private final FinalResultService finalResultService;
    private final UserService userService;

    // ==================== Project Endpoints ====================

    @GetMapping("/projects/pending")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Get pending projects", description = "Get all projects pending FYP Committee approval")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getPendingProjects(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(fypCommitteeService.getPendingProjects(pageable)));
    }

    @PatchMapping("/projects/{id}/approve")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Approve a project", description = "Approve a project and assign a supervisor")
    public ResponseEntity<ApiResponse<ProjectDto>> approveProject(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            fypCommitteeService.approveProject(id, request, currentUser),
            "Project approved successfully"
        ));
    }

    @PatchMapping("/projects/{id}/reject")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Reject a project", description = "Reject a project with a reason")
    public ResponseEntity<ApiResponse<ProjectDto>> rejectProject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            fypCommitteeService.rejectProject(id, request, currentUser),
            "Project rejected"
        ));
    }

    // ==================== Deadline Batch Endpoints ====================

    @PostMapping("/deadlines/batches")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Create deadline batch", description = "Create a new deadline batch with deadlines for document types")
    public ResponseEntity<ApiResponse<DeadlineBatchDto>> createDeadlineBatch(
            @Valid @RequestBody CreateDeadlineBatchRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            fypCommitteeService.createDeadlineBatch(request, currentUser),
            "Deadline batch created successfully"
        ));
    }

    @GetMapping("/deadlines/batches")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Get all deadline batches", description = "Get all deadline batches with pagination")
    public ResponseEntity<ApiResponse<Page<DeadlineBatchDto>>> getAllBatches(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(fypCommitteeService.getAllBatches(pageable)));
    }

    @GetMapping("/deadlines/batches/{id}")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN', 'SUPERVISOR', 'STUDENT')")
    @Operation(summary = "Get deadline batch by ID", description = "Get a specific deadline batch with its deadlines")
    public ResponseEntity<ApiResponse<DeadlineBatchDto>> getBatchById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(fypCommitteeService.getBatchById(id)));
    }

    @GetMapping("/deadlines/batches/current")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current deadline batch", description = "Get the currently active deadline batch")
    public ResponseEntity<ApiResponse<DeadlineBatchDto>> getCurrentBatch() {
        return fypCommitteeService.getCurrentBatch()
                .map(batch -> ResponseEntity.ok(ApiResponse.success(batch)))
                .orElse(ResponseEntity.ok(ApiResponse.success(null, "No active deadline batch")));
    }

    @PatchMapping("/deadlines/batches/{id}/deactivate")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Deactivate deadline batch", description = "Deactivate a deadline batch")
    public ResponseEntity<ApiResponse<Void>> deactivateBatch(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getByEmail(userDetails.getUsername());
        fypCommitteeService.deactivateBatch(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Deadline batch deactivated"));
    }

    // ==================== Final Result Endpoints ====================

    @PostMapping("/projects/{projectId}/compute-final")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Compute final result", description = "Compute final weighted result for a project")
    public ResponseEntity<ApiResponse<FinalResultDto>> computeFinalResult(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            finalResultService.computeFinalResult(projectId, currentUser),
            "Final result computed successfully"
        ));
    }

    @PatchMapping("/projects/{projectId}/release-final")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Release final result", description = "Release final result to students")
    public ResponseEntity<ApiResponse<FinalResultDto>> releaseFinalResult(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
            finalResultService.releaseFinalResult(projectId, currentUser),
            "Final result released to students"
        ));
    }

    @GetMapping("/projects/{projectId}/result")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Get final result", description = "Get computed final result for a project. Returns null if not computed yet.")
    public ResponseEntity<ApiResponse<FinalResultDto>> getFinalResult(
            @PathVariable UUID projectId) {
        FinalResultDto result = finalResultService.getFinalResult(projectId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/projects/{projectId}/released-result")
    @PreAuthorize("hasAnyRole('STUDENT', 'SUPERVISOR', 'FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Get released final result", description = "Get released final result for a project (student view)")
    public ResponseEntity<ApiResponse<FinalResultDto>> getReleasedResult(
            @PathVariable UUID projectId) {
        FinalResultDto result = finalResultService.getReleasedResult(projectId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
