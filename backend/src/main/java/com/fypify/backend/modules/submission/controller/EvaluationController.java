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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for Evaluation Committee operations.
 * Allows evaluation committee members to evaluate locked submissions.
 */
@RestController
@RequestMapping("/api/v1/eval")
@RequiredArgsConstructor
@Tag(name = "Evaluation", description = "Evaluation committee operations")
public class EvaluationController {

    private final SubmissionService submissionService;
    private final UserService userService;

    /**
     * Get all submissions locked for evaluation.
     * GET /api/v1/eval/submissions
     */
    @GetMapping("/submissions")
    @PreAuthorize("hasRole('EVALUATION_COMMITTEE')")
    @Operation(summary = "Get locked submissions", description = "Get all submissions ready for evaluation")
    public ResponseEntity<ApiResponse<Page<SubmissionDto>>> getLockedSubmissions(
            @PageableDefault(size = 20, sort = "uploadedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<SubmissionDto> submissions = submissionService.getLockedSubmissions(pageable);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }

    /**
     * Get all evaluation marks for a submission.
     * GET /api/v1/eval/submissions/{id}/marks
     */
    @GetMapping("/submissions/{id}/marks")
    @PreAuthorize("hasRole('EVALUATION_COMMITTEE')")
    @Operation(summary = "Get evaluation marks", description = "Get all evaluation marks for a submission")
    public ResponseEntity<ApiResponse<List<EvaluationMarksDto>>> getEvaluationMarks(
            @PathVariable UUID id
    ) {
        List<EvaluationMarksDto> marks = submissionService.getEvaluationMarks(id);
        return ResponseEntity.ok(ApiResponse.success(marks));
    }

    /**
     * Get my evaluation for a submission.
     * GET /api/v1/eval/submissions/{id}/my-evaluation
     */
    @GetMapping("/submissions/{id}/my-evaluation")
    @PreAuthorize("hasRole('EVALUATION_COMMITTEE')")
    @Operation(summary = "Get my evaluation", description = "Get current user's evaluation for a submission")
    public ResponseEntity<ApiResponse<EvaluationMarksDto>> getMyEvaluation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User evaluator = userService.getByEmail(userDetails.getUsername());
        EvaluationMarksDto evaluation = submissionService.getEvaluationByEvaluator(id, evaluator.getId());
        return ResponseEntity.ok(ApiResponse.success(evaluation));
    }

    /**
     * Submit or update evaluation marks.
     * POST /api/v1/eval/submissions/{id}/evaluate
     */
    @PostMapping("/submissions/{id}/evaluate")
    @PreAuthorize("hasRole('EVALUATION_COMMITTEE')")
    @Operation(summary = "Evaluate submission", description = "Submit or update evaluation marks for a submission")
    public ResponseEntity<ApiResponse<EvaluationMarksDto>> evaluateSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User evaluator = userService.getByEmail(userDetails.getUsername());
        EvaluationMarksDto evaluation = submissionService.evaluateSubmission(id, request, evaluator);
        String message = request.getIsFinal() != null && request.getIsFinal() 
            ? "Evaluation submitted and finalized" 
            : "Evaluation saved as draft";
        return ResponseEntity.ok(ApiResponse.success(evaluation, message));
    }

    /**
     * Finalize evaluation for a submission.
     * PATCH /api/v1/eval/submissions/{id}/finalize
     */
    @PatchMapping("/submissions/{id}/finalize")
    @PreAuthorize("hasRole('EVALUATION_COMMITTEE')")
    @Operation(summary = "Finalize evaluation", description = "Finalize evaluation marks (no further changes allowed)")
    public ResponseEntity<ApiResponse<EvaluationMarksDto>> finalizeEvaluation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User evaluator = userService.getByEmail(userDetails.getUsername());
        EvaluationMarksDto evaluation = submissionService.finalizeEvaluation(id, evaluator);
        return ResponseEntity.ok(ApiResponse.success(evaluation, "Evaluation finalized successfully"));
    }

    /**
     * Get evaluation summary for a submission.
     * GET /api/v1/eval/submissions/{id}/summary
     */
    @GetMapping("/submissions/{id}/summary")
    @PreAuthorize("hasRole('EVALUATION_COMMITTEE')")
    @Operation(summary = "Get evaluation summary", description = "Get summary of all evaluations including averages")
    public ResponseEntity<ApiResponse<EvaluationSummaryDto>> getEvaluationSummary(
            @PathVariable UUID id
    ) {
        EvaluationSummaryDto summary = submissionService.getEvaluationSummary(id);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
