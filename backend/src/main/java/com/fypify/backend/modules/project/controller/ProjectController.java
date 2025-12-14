package com.fypify.backend.modules.project.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.project.dto.*;
import com.fypify.backend.modules.project.entity.ProjectStatus;
import com.fypify.backend.modules.project.service.ProjectService;
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

import java.util.Map;
import java.util.UUID;

/**
 * Controller for Project operations.
 * Provides endpoints for project registration, approval, and management.
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "FYP project management")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    // ==================== Project Queries ====================

    /**
     * Get all projects.
     * GET /api/v1/projects
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE', 'SUPERVISOR')")
    @Operation(summary = "Get all projects", description = "Get all projects (Admin/FYP Committee/Supervisor only)")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getAllProjects(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProjectDto> projects = projectService.getAllProjects(pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    /**
     * Get projects by status.
     * GET /api/v1/projects/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE', 'SUPERVISOR')")
    @Operation(summary = "Get projects by status", description = "Get projects filtered by status")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getProjectsByStatus(
            @PathVariable ProjectStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProjectDto> projects = projectService.getProjectsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    /**
     * Get pending projects (for FYP Committee review).
     * GET /api/v1/projects/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Get pending projects", description = "Get projects pending approval")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getPendingProjects(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<ProjectDto> projects = projectService.getPendingProjects(pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    /**
     * Get my supervised projects.
     * GET /api/v1/projects/my-supervised
     */
    @GetMapping("/my-supervised")
    @PreAuthorize("hasRole('SUPERVISOR')")
    @Operation(summary = "Get supervised projects", description = "Get projects supervised by the current user")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getMySupervisedProjects(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User supervisor = userService.getByEmail(userDetails.getUsername());
        Page<ProjectDto> projects = projectService.getProjectsBySupervisor(supervisor.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    /**
     * Get project for my group.
     * GET /api/v1/projects/my-project
     */
    @GetMapping("/my-project")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my project", description = "Get the project for the student's group")
    public ResponseEntity<ApiResponse<ProjectDto>> getMyProject(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User student = userService.getByEmail(userDetails.getUsername());
        // This would need to first get the student's group, then the project
        // For now, return a message - this should be enhanced
        return ResponseEntity.ok(ApiResponse.success(null, "Use /groups/my-group to get your group and project info"));
    }

    /**
     * Search projects by title.
     * GET /api/v1/projects/search?q=
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE', 'SUPERVISOR')")
    @Operation(summary = "Search projects", description = "Search projects by title")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> searchProjects(
            @RequestParam("q") String query,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<ProjectDto> projects = projectService.searchProjects(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    /**
     * Get project by ID.
     * GET /api/v1/projects/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get project by ID", description = "Get project details by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable UUID id) {
        ProjectDto project = projectService.getProjectWithDetails(id);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    /**
     * Get project counts by status.
     * GET /api/v1/projects/stats/counts
     */
    @GetMapping("/stats/counts")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Get project statistics", description = "Get project counts by status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getProjectStats() {
        Map<String, Long> counts = projectService.getProjectCountsByStatus();
        return ResponseEntity.ok(ApiResponse.success(counts));
    }

    // ==================== Project Registration ====================

    /**
     * Register a new project.
     * POST /api/v1/projects
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Register project", description = "Register a new project for your group")
    public ResponseEntity<ApiResponse<ProjectDto>> registerProject(
            @Valid @RequestBody RegisterProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User registrar = userService.getByEmail(userDetails.getUsername());
        ProjectDto project = projectService.registerProject(request, registrar);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(project, "Project registered successfully. Awaiting FYP Committee approval."));
    }

    /**
     * Update a project.
     * PUT /api/v1/projects/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Update project", description = "Update project details (while pending)")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        ProjectDto project = projectService.updateProject(id, request, actor);
        return ResponseEntity.ok(ApiResponse.success(project, "Project updated successfully"));
    }

    /**
     * Delete a project.
     * DELETE /api/v1/projects/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Delete project", description = "Delete a project (admin or leader while pending)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        projectService.deleteProject(id, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }

    // ==================== Project Approval ====================

    /**
     * Approve or reject a project.
     * POST /api/v1/projects/{id}/decision
     */
    @PostMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Approve/Reject project", description = "Make approval decision on a project (FYP Committee only)")
    public ResponseEntity<ApiResponse<ProjectDto>> makeDecision(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectDecisionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User decisionMaker = userService.getByEmail(userDetails.getUsername());
        ProjectDto project = projectService.makeDecision(id, request, decisionMaker);
        String message = request.getApprove() ? "Project approved successfully" : "Project rejected";
        return ResponseEntity.ok(ApiResponse.success(project, message));
    }

    /**
     * Quick approve a project.
     * POST /api/v1/projects/{id}/approve
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Approve project", description = "Quick approve a project with supervisor assignment")
    public ResponseEntity<ApiResponse<ProjectDto>> approveProject(
            @PathVariable UUID id,
            @RequestParam("supervisorId") UUID supervisorId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User decisionMaker = userService.getByEmail(userDetails.getUsername());
        ProjectDecisionRequest request = ProjectDecisionRequest.builder()
                .approve(true)
                .supervisorId(supervisorId)
                .build();
        ProjectDto project = projectService.makeDecision(id, request, decisionMaker);
        return ResponseEntity.ok(ApiResponse.success(project, "Project approved successfully"));
    }

    /**
     * Reject a project.
     * POST /api/v1/projects/{id}/reject
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'FYP_COMMITTEE')")
    @Operation(summary = "Reject project", description = "Reject a project with reason")
    public ResponseEntity<ApiResponse<ProjectDto>> rejectProject(
            @PathVariable UUID id,
            @RequestParam("reason") String reason,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User decisionMaker = userService.getByEmail(userDetails.getUsername());
        ProjectDecisionRequest request = ProjectDecisionRequest.builder()
                .approve(false)
                .rejectionReason(reason)
                .build();
        ProjectDto project = projectService.makeDecision(id, request, decisionMaker);
        return ResponseEntity.ok(ApiResponse.success(project, "Project rejected"));
    }
}
