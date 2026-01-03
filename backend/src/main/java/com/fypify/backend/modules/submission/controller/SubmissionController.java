package com.fypify.backend.modules.submission.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.submission.dto.*;
import com.fypify.backend.modules.submission.service.SubmissionService;
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
 * Controller for document submission operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural) - Controller as thin facade
 *    - Delegates all business logic to SubmissionService.
 *    - Handles HTTP concerns only.
 * 
 * 2. SINGLETON PATTERN (Creational) - via Spring @RestController
 *    - Single instance handles all submission requests.
 * 
 * ===========================================================================================
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Document submission management")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserService userService;

    // ==================== Project Submissions ====================

    /**
     * Create a new submission for a project.
     * POST /api/v1/projects/{projectId}/submissions
     */
    @PostMapping("/projects/{projectId}/submissions")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Create submission", description = "Upload a new document submission for a project")
    public ResponseEntity<ApiResponse<SubmissionDto>> createSubmission(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User uploader = userService.getByEmail(userDetails.getUsername());
        SubmissionDto submission = submissionService.createSubmission(projectId, request, uploader);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(submission, "Submission created successfully"));
    }

    /**
     * Get all submissions for a project.
     * GET /api/v1/projects/{projectId}/submissions
     */
    @GetMapping("/projects/{projectId}/submissions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get project submissions", description = "Get all submissions for a project")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getProjectSubmissions(
            @PathVariable UUID projectId
    ) {
        List<SubmissionDto> submissions = submissionService.getSubmissionsByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    /**
     * Get submissions by project and document type.
     * GET /api/v1/projects/{projectId}/submissions?docTypeId={docTypeId}
     */
    @GetMapping("/projects/{projectId}/submissions/by-type")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get submissions by type", description = "Get submissions for a specific document type")
    public ResponseEntity<ApiResponse<List<SubmissionDto>>> getSubmissionsByType(
            @PathVariable UUID projectId,
            @RequestParam UUID docTypeId
    ) {
        List<SubmissionDto> submissions = submissionService.getSubmissionsByProjectAndDocType(projectId, docTypeId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    /**
     * Get latest submission for a document type.
     * GET /api/v1/projects/{projectId}/submissions/latest
     */
    @GetMapping("/projects/{projectId}/submissions/latest")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get latest submission", description = "Get the latest submission for a document type")
    public ResponseEntity<ApiResponse<SubmissionDto>> getLatestSubmission(
            @PathVariable UUID projectId,
            @RequestParam UUID docTypeId
    ) {
        SubmissionDto submission = submissionService.getLatestSubmission(projectId, docTypeId);
        return ResponseEntity.ok(ApiResponse.success(submission));
    }

    // ==================== Individual Submission Operations ====================

    /**
     * Get submission by ID.
     * GET /api/v1/submissions/{id}
     */
    @GetMapping("/submissions/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get submission", description = "Get submission details by ID")
    public ResponseEntity<ApiResponse<SubmissionDto>> getSubmission(@PathVariable UUID id) {
        SubmissionDto submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.success(submission));
    }

    /**
     * Mark submission as final.
     * PATCH /api/v1/submissions/{id}/mark-final
     */
    @PatchMapping("/submissions/{id}/mark-final")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Mark as final", description = "Mark a submission as final (no more revisions allowed)")
    public ResponseEntity<ApiResponse<SubmissionDto>> markAsFinal(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        SubmissionDto submission = submissionService.markAsFinal(id, actor);
        return ResponseEntity.ok(ApiResponse.success(submission, "Submission marked as final"));
    }

    // ==================== Supervisor Operations ====================

    /**
     * Get pending submissions for supervisor.
     * GET /api/v1/submissions/pending
     */
    @GetMapping("/submissions/pending")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Get pending submissions", description = "Get submissions pending supervisor review")
    public ResponseEntity<ApiResponse<Page<SubmissionDto>>> getPendingSubmissions(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        User supervisor = userService.getByEmail(userDetails.getUsername());
        Page<SubmissionDto> submissions = submissionService.getPendingForSupervisor(supervisor.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    /**
     * Review a submission (approve or request revision).
     * POST /api/v1/submissions/{id}/review
     */
    @PostMapping("/submissions/{id}/review")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Review submission", description = "Supervisor reviews and approves or requests revision")
    public ResponseEntity<ApiResponse<SubmissionDto>> reviewSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody SupervisorReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User supervisor = userService.getByEmail(userDetails.getUsername());
        SubmissionDto submission = submissionService.reviewSubmission(id, request, supervisor);
        String message = request.getApprove() ? "Submission approved" : "Revision requested";
        return ResponseEntity.ok(ApiResponse.success(submission, message));
    }

    /**
     * Get locked submissions for supervisor's projects (for evaluation).
     * GET /api/v1/submissions/supervisor/locked
     */
    @GetMapping("/submissions/supervisor/locked")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Get locked submissions for supervisor", description = "Get locked submissions for supervisor's projects")
    public ResponseEntity<ApiResponse<Page<SubmissionDto>>> getLockedSubmissionsForSupervisor(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        User supervisor = userService.getByEmail(userDetails.getUsername());
        Page<SubmissionDto> submissions = submissionService.getLockedSubmissionsForSupervisor(supervisor.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    /**
     * Submit supervisor marks for a locked submission.
     * POST /api/v1/submissions/{id}/supervisor-marks
     */
    @PostMapping("/submissions/{id}/supervisor-marks")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Submit supervisor marks", description = "Submit marks for a locked submission")
    public ResponseEntity<ApiResponse<SupervisorMarksDto>> submitSupervisorMarks(
            @PathVariable UUID id,
            @Valid @RequestBody SupervisorMarksRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User supervisor = userService.getByEmail(userDetails.getUsername());
        SupervisorMarksDto marks = submissionService.submitSupervisorMarks(
                id, request.getScore(), supervisor);
        return ResponseEntity.ok(ApiResponse.success(marks, "Supervisor marks submitted successfully"));
    }

    /**
     * Get supervisor marks for a submission.
     * GET /api/v1/submissions/{id}/supervisor-marks
     */
    @GetMapping("/submissions/{id}/supervisor-marks")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get supervisor marks", description = "Get supervisor marks for a submission")
    public ResponseEntity<ApiResponse<SupervisorMarksDto>> getSupervisorMarks(@PathVariable UUID id) {
        SupervisorMarksDto marks = submissionService.getSupervisorMarks(id);
        return ResponseEntity.ok(ApiResponse.success(marks));
    }

    // ==================== FYP Committee Operations ====================

    /**
     * Lock a submission for evaluation.
     * POST /api/v1/submissions/{id}/lock
     */
    @PostMapping("/submissions/{id}/lock")
    @PreAuthorize("hasAnyRole('FYP_COMMITTEE', 'ADMIN')")
    @Operation(summary = "Lock for evaluation", description = "Lock a submission for committee evaluation")
    public ResponseEntity<ApiResponse<SubmissionDto>> lockForEvaluation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        SubmissionDto submission = submissionService.lockForEvaluation(id, actor);
        return ResponseEntity.ok(ApiResponse.success(submission, "Submission locked for evaluation"));
    }

    // ==================== Project Deadlines ====================

    /**
     * Get all deadlines for a project.
     * GET /api/v1/projects/{projectId}/deadlines
     */
    @GetMapping("/projects/{projectId}/deadlines")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get project deadlines", description = "Get all deadlines for a project")
    public ResponseEntity<ApiResponse<List<com.fypify.backend.modules.committee.dto.ProjectDeadlineDto>>> getProjectDeadlines(
            @PathVariable UUID projectId
    ) {
        List<com.fypify.backend.modules.committee.dto.ProjectDeadlineDto> deadlines = submissionService.getProjectDeadlines(projectId);
        return ResponseEntity.ok(ApiResponse.success(deadlines));
    }
}

