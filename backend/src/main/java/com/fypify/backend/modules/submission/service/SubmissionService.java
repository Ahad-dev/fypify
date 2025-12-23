package com.fypify.backend.modules.submission.service;

import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.entity.DocumentType;
import com.fypify.backend.modules.admin.repository.DocumentTypeRepository;
import com.fypify.backend.modules.admin.service.AuditLogService;
import com.fypify.backend.modules.committee.entity.ProjectDeadline;
import com.fypify.backend.modules.committee.repository.ProjectDeadlineRepository;
import com.fypify.backend.modules.email.service.EmailService;
import com.fypify.backend.modules.file.entity.CloudinaryFile;
import com.fypify.backend.modules.file.service.FileUploadService;
import com.fypify.backend.modules.notification.entity.NotificationType;
import com.fypify.backend.modules.notification.service.NotificationService;
import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.project.repository.ProjectRepository;
import com.fypify.backend.modules.submission.dto.*;
import com.fypify.backend.modules.submission.entity.DocumentSubmission;
import com.fypify.backend.modules.submission.entity.SubmissionStatus;
import com.fypify.backend.modules.submission.repository.DocumentSubmissionRepository;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for document submission operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural)
 *    - Provides simplified interface over complex submission workflow.
 *    - Orchestrates: version calculation, file linking, notifications, audit logging.
 * 
 * 2. SINGLETON PATTERN (Creational) - via Spring @Service
 *    - Single instance manages all submission operations.
 * 
 * 3. TEMPLATE METHOD PATTERN (Behavioral) - Implicit
 *    - Common flow: Validate → Compute Version → Create → Notify → Audit
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. STRATEGY PATTERN (Behavioral) - Suggested for Version Calculation
 *    - Interface: VersioningStrategy { int getNextVersion(projectId, docTypeId); }
 *    - Implementations: PessimisticLockStrategy, OptimisticLockStrategy, AdvisoryLockStrategy
 * 
 * 2. OBSERVER PATTERN (Behavioral) - Suggested for Submission Events
 *    - Publish SubmissionCreatedEvent, SubmissionFinalizedEvent
 *    - Listeners handle notifications, emails, audit logs independently.
 * 
 * ===========================================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionService {

    private final DocumentSubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final ProjectDeadlineRepository deadlineRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    // ==================== Submission CRUD Operations ====================

    /**
     * Create a new submission for a project.
     * Uses pessimistic locking to compute the next version safely.
     * 
     * @param projectId The project ID
     * @param request   The submission request
     * @param uploader  The user uploading the submission
     * @return Created submission DTO
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public SubmissionDto createSubmission(UUID projectId, CreateSubmissionRequest request, User uploader) {
        // Find project
        Project project = projectRepository.findByIdWithRelations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Validate uploader is part of the project group
        if (!project.getGroup().hasMember(uploader.getId()) && !uploader.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only group members can create submissions");
        }

        // Check project is approved (or in progress)
        if (!project.isApproved()) {
            throw new BusinessRuleException("PROJECT_NOT_APPROVED", "Cannot create submissions for unapproved projects");
        }

        // Find document type
        DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("DocumentType", "id", request.getDocumentTypeId()));

        if (!documentType.getIsActive()) {
            throw new BusinessRuleException("DOC_TYPE_INACTIVE", "Document type is not active");
        }

        // Check if final submission already exists for this doc type
        if (submissionRepository.existsFinalSubmission(projectId, request.getDocumentTypeId())) {
            throw new BusinessRuleException("FINAL_EXISTS", 
                    "A final submission already exists for this document type. No more submissions allowed.");
        }

        // Find the uploaded file
        CloudinaryFile file = fileUploadService.findById(request.getFileId());

        // Check deadline status for this document type
        Instant deadline = getDeadlineForProjectAndDocType(projectId, request.getDocumentTypeId());
        boolean isLateSubmission = deadline != null && Instant.now().isAfter(deadline);

        // Compute next version with pessimistic lock
        // This prevents race conditions when multiple users try to submit simultaneously
        Integer nextVersion = submissionRepository.getNextVersionWithLock(projectId, request.getDocumentTypeId());

        // Determine initial status based on deadline
        // If deadline passed, submission goes directly to supervisor (marked as late internally)
        SubmissionStatus initialStatus = SubmissionStatus.PENDING_SUPERVISOR;

        // Create submission
        DocumentSubmission submission = DocumentSubmission.builder()
                .project(project)
                .documentType(documentType)
                .version(nextVersion)
                .file(file)
                .uploadedBy(uploader)
                .status(initialStatus)
                .isFinal(false)
                .comments(isLateSubmission 
                        ? "[LATE SUBMISSION] " + (request.getComments() != null ? request.getComments() : "")
                        : request.getComments())
                .build();

        submission = submissionRepository.save(submission);

        // Notify supervisor
        if (project.getSupervisor() != null) {
            notificationService.sendNotificationAsync(
                    project.getSupervisor(),
                    com.fypify.backend.modules.notification.entity.NotificationType.SUBMISSION_UPLOADED,
                    Map.of(
                            "projectId", project.getId().toString(),
                            "projectTitle", project.getTitle(),
                            "documentType", documentType.getTitle(),
                            "version", nextVersion,
                            "submissionId", submission.getId().toString(),
                            "uploadedBy", uploader.getFullName()
                    )
            );

            // Send email to supervisor
            emailService.sendSubmissionUploadedEmail(
                    project.getSupervisor().getEmail(),
                    uploader.getFullName(),
                    project.getTitle(),
                    documentType.getTitle()
            );
        }

        // Audit log
        auditLogService.logCreate(uploader, "DocumentSubmission", submission.getId(),
                Map.of(
                        "projectId", projectId.toString(),
                        "documentType", documentType.getCode(),
                        "version", nextVersion
                ));

        if (isLateSubmission) {
            log.warn("Late submission created: projectId={}, docType={}, version={}, uploadedBy={}",
                    projectId, documentType.getCode(), nextVersion, uploader.getId());
        } else {
            log.info("Submission created: projectId={}, docType={}, version={}, uploadedBy={}",
                    projectId, documentType.getCode(), nextVersion, uploader.getId());
        }

        return toDto(submission, deadline);
    }

    /**
     * Get deadline for a specific project and document type.
     * Returns null if no deadline is configured.
     */
    private Instant getDeadlineForProjectAndDocType(UUID projectId, UUID docTypeId) {
        return deadlineRepository.findByProjectIdAndDocumentTypeId(projectId, docTypeId)
                .map(ProjectDeadline::getDeadlineDate)
                .orElse(null);
    }

    /**
     * Get submission by ID.
     */
    public SubmissionDto getSubmissionById(UUID submissionId) {
        return toDto(findById(submissionId));
    }

    /**
     * Find submission entity by ID.
     */
    public DocumentSubmission findById(UUID submissionId) {
        return submissionRepository.findByIdWithRelations(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", submissionId));
    }

    /**
     * Get all submissions for a project.
     */
    public List<SubmissionDto> getSubmissionsByProject(UUID projectId) {
        return submissionRepository.findByProjectId(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get submissions for a project and document type.
     */
    public List<SubmissionDto> getSubmissionsByProjectAndDocType(UUID projectId, UUID docTypeId) {
        return submissionRepository.findByProjectIdAndDocTypeId(projectId, docTypeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get latest submission for a project and document type.
     */
    public SubmissionDto getLatestSubmission(UUID projectId, UUID docTypeId) {
        return submissionRepository.findLatestByProjectAndDocType(projectId, docTypeId)
                .map(this::toDto)
                .orElse(null);
    }

    /**
     * Get all deadlines for a project.
     * Returns all deadlines from the project's deadline batch.
     */
    public List<com.fypify.backend.modules.committee.dto.ProjectDeadlineDto> getProjectDeadlines(UUID projectId) {
        Project project = projectRepository.findByIdWithRelations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (project.getDeadlineBatch() == null) {
            return List.of();
        }

        return deadlineRepository.findByBatchIdWithDocumentType(project.getDeadlineBatch().getId())
                .stream()
                .map(pd -> com.fypify.backend.modules.committee.dto.ProjectDeadlineDto.builder()
                        .id(pd.getId())
                        .batchId(pd.getBatch().getId())
                        .documentTypeId(pd.getDocumentType().getId())
                        .documentTypeTitle(pd.getDocumentType().getTitle())
                        .deadlineDate(pd.getDeadlineDate())
                        .sortOrder(pd.getSortOrder())
                        .isPast(pd.isPast())
                        .createdAt(pd.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get pending submissions for a supervisor.
     */
    public Page<SubmissionDto> getPendingForSupervisor(UUID supervisorId, Pageable pageable) {
        return submissionRepository.findPendingForSupervisor(supervisorId, pageable).map(this::toDto);
    }

    // ==================== Submission State Transitions ====================

    /**
     * Mark a submission as final.
     * After marking as final, no more submissions of this document type are allowed.
     */
    @Transactional
    public SubmissionDto markAsFinal(UUID submissionId, User actor) {
        DocumentSubmission submission = findById(submissionId);
        Project project = submission.getProject();

        // Validate actor is group leader or admin
        if (!project.getGroup().isLeader(actor.getId()) && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the group leader can mark submissions as final");
        }

        // Validate submission can be marked as final
        if (!submission.canMarkFinal()) {
            throw new BusinessRuleException("CANNOT_MARK_FINAL", 
                    "Submission cannot be marked as final in current state: " + submission.getStatus());
        }

        submission.markFinal();
        submission = submissionRepository.save(submission);

        // Audit log
        auditLogService.logUpdate(actor, "DocumentSubmission", submission.getId(),
                Map.of("isFinal", false),
                Map.of("isFinal", true));

        log.info("Submission marked as final: submissionId={}, by={}", submissionId, actor.getId());

        return toDto(submission);
    }

    /**
     * Supervisor reviews a submission (approve or request revision).
     */
    @Transactional
    public SubmissionDto reviewSubmission(UUID submissionId, SupervisorReviewRequest request, User supervisor) {
        DocumentSubmission submission = findById(submissionId);
        Project project = submission.getProject();

        // Validate supervisor is assigned to this project
        if (!project.isSupervisor(supervisor.getId()) && !supervisor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the assigned supervisor can review submissions");
        }

        // Validate submission is pending review
        if (submission.isLocked()) {
            throw new BusinessRuleException("SUBMISSION_LOCKED", "Cannot review a locked submission");
        }

        SubmissionStatus oldStatus = submission.getStatus();

        if (request.getApprove()) {
            submission.approveBySupervsor();
            log.info("Submission approved by supervisor: submissionId={}", submissionId);
        } else {
            if (request.getFeedback() == null || request.getFeedback().isBlank()) {
                throw new BusinessRuleException("FEEDBACK_REQUIRED", "Feedback is required when requesting revision");
            }
            submission.requestRevision(request.getFeedback());

            // Notify group members about revision request
            List<String> memberEmails = project.getGroup().getMembers().stream()
                    .map(m -> m.getStudent().getEmail())
                    .filter(email -> email != null && !email.isBlank())
                    .collect(Collectors.toList());

            emailService.sendRevisionRequestedEmail(
                    memberEmails,
                    project.getTitle(),
                    submission.getDocumentType().getTitle(),
                    request.getFeedback()
            );

            log.info("Revision requested for submission: submissionId={}", submissionId);
        }

        submission = submissionRepository.save(submission);

        // Audit log
        auditLogService.logUpdate(supervisor, "DocumentSubmission", submission.getId(),
                Map.of("status", oldStatus.name()),
                Map.of("status", submission.getStatus().name()));

        return toDto(submission);
    }

    /**
     * Lock a submission for evaluation (manually or by deadline).
     */
    @Transactional
    public SubmissionDto lockForEvaluation(UUID submissionId, User actor) {
        DocumentSubmission submission = findById(submissionId);

        // Only FYP Committee or Admin can lock
        if (!actor.isFypCommittee() && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only FYP Committee can lock submissions for evaluation");
        }

        submission.lockForEvaluation();
        submission = submissionRepository.save(submission);

        auditLogService.logUpdate(actor, "DocumentSubmission", submission.getId(),
                Map.of("status", "PREVIOUS"),
                Map.of("status", submission.getStatus().name()));

        log.info("Submission locked for evaluation: submissionId={}, by={}", submissionId, actor.getId());

        return toDto(submission);
    }

    // ==================== Auto-Lock After Deadline ====================

    /**
     * Process deadlines that have passed and lock the most recent submissions.
     * This should be called by a scheduled job.
     * 
     * Workflow:
     * 1. Find all passed deadlines
     * 2. For each deadline, find projects with that deadline batch
     * 3. For each project, find the most recent submission for that doc type
     * 4. Lock the submission and notify Evaluation Committee
     */
    @Transactional
    public int processPassedDeadlines() {
        Instant now = Instant.now();
        List<ProjectDeadline> passedDeadlines = deadlineRepository.findAllPassedDeadlines(now);
        int lockedCount = 0;

        for (ProjectDeadline deadline : passedDeadlines) {
            // Find all projects with this deadline batch
            List<Project> projects = projectRepository.findByDeadlineBatchId(deadline.getBatch().getId());

            for (Project project : projects) {
                // Find the most recent submission for this doc type
                var latestSubmission = submissionRepository
                        .findLatestByProjectAndDocType(project.getId(), deadline.getDocumentType().getId());

                if (latestSubmission.isPresent()) {
                    DocumentSubmission submission = latestSubmission.get();

                    // Only lock if not already locked/finalized
                    if (!submission.isLocked()) {
                        submission.lockForEvaluation();
                        submissionRepository.save(submission);
                        lockedCount++;

                        log.info("Auto-locked submission after deadline: submissionId={}, projectId={}, docType={}",
                                submission.getId(), project.getId(), deadline.getDocumentType().getCode());

                        // Notify Evaluation Committee
                        notifyEvaluationCommittee(submission, project, deadline.getDocumentType());
                    }
                } else {
                    // No submission exists - could log warning or create placeholder
                    log.warn("No submission found for project {} and doc type {} after deadline",
                            project.getId(), deadline.getDocumentType().getCode());
                }
            }
        }

        return lockedCount;
    }

    /**
     * Notify Evaluation Committee about a locked submission ready for evaluation.
     */
    private void notifyEvaluationCommittee(DocumentSubmission submission, Project project, DocumentType docType) {
        // Find all evaluation committee members
        List<User> evalCommittee = userRepository.findByRoleName(Role.EVALUATION_COMMITTEE);

        for (User member : evalCommittee) {
            notificationService.sendNotificationAsync(
                    member,
                    NotificationType.SUBMISSION_LOCKED,
                    Map.of(
                            "submissionId", submission.getId().toString(),
                            "projectId", project.getId().toString(),
                            "projectTitle", project.getTitle(),
                            "documentType", docType.getTitle(),
                            "version", submission.getVersion(),
                            "message", "Submission is locked and ready for evaluation"
                    )
            );
        }

        // Send email to evaluation committee
        List<String> emails = evalCommittee.stream()
                .map(User::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .collect(Collectors.toList());

        if (!emails.isEmpty()) {
            emailService.sendDocumentLockedEmail(emails, project.getTitle(), docType.getTitle());
        }
    }

    // ==================== Conversion Methods ====================

    /**
     * Convert entity to DTO (without deadline info - will be fetched).
     */
    public SubmissionDto toDto(DocumentSubmission submission) {
        Instant deadline = null;
        if (submission.getProject() != null && submission.getDocumentType() != null) {
            deadline = getDeadlineForProjectAndDocType(
                    submission.getProject().getId(), 
                    submission.getDocumentType().getId()
            );
        }
        return toDto(submission, deadline);
    }

    /**
     * Convert entity to DTO with deadline information.
     */
    public SubmissionDto toDto(DocumentSubmission submission, Instant deadline) {
        boolean deadlinePassed = deadline != null && Instant.now().isAfter(deadline);
        boolean isLate = deadline != null && submission.getUploadedAt() != null 
                && submission.getUploadedAt().isAfter(deadline);

        return SubmissionDto.builder()
                .id(submission.getId())
                .projectId(submission.getProject() != null ? submission.getProject().getId() : null)
                .projectTitle(submission.getProject() != null ? submission.getProject().getTitle() : null)
                .documentTypeId(submission.getDocumentType() != null ? submission.getDocumentType().getId() : null)
                .documentTypeCode(submission.getDocumentType() != null ? submission.getDocumentType().getCode() : null)
                .documentTypeTitle(submission.getDocumentType() != null ? submission.getDocumentType().getTitle() : null)
                .version(submission.getVersion())
                .file(submission.getFile() != null ? fileUploadService.toDto(submission.getFile()) : null)
                .uploadedById(submission.getUploadedBy() != null ? submission.getUploadedBy().getId() : null)
                .uploadedByName(submission.getUploadedBy() != null ? submission.getUploadedBy().getFullName() : null)
                .uploadedAt(submission.getUploadedAt())
                .status(submission.getStatus())
                .statusDisplay(formatStatusDisplay(submission.getStatus()) + (isLate ? " (Late)" : ""))
                .isFinal(submission.getIsFinal())
                .supervisorReviewedAt(submission.getSupervisorReviewedAt())
                .comments(submission.getComments())
                .canEdit(submission.canEdit() && !deadlinePassed)
                .canMarkFinal(submission.canMarkFinal())
                .isLocked(submission.isLocked())
                .deadlineDate(deadline)
                .isLate(isLate)
                .deadlinePassed(deadlinePassed)
                .build();
    }

    /**
     * Format status for display.
     */
    private String formatStatusDisplay(SubmissionStatus status) {
        return switch (status) {
            case PENDING_SUPERVISOR -> "Pending Supervisor Review";
            case REVISION_REQUESTED -> "Revision Requested";
            case APPROVED_BY_SUPERVISOR -> "Approved by Supervisor";
            case LOCKED_FOR_EVAL -> "Locked for Evaluation";
            case EVAL_IN_PROGRESS -> "Evaluation in Progress";
            case EVAL_FINALIZED -> "Evaluation Finalized";
        };
    }
}

