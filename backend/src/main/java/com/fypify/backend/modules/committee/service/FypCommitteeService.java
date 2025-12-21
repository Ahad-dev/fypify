package com.fypify.backend.modules.committee.service;

import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.entity.DocumentType;
import com.fypify.backend.modules.admin.repository.DocumentTypeRepository;
import com.fypify.backend.modules.admin.service.AuditLogService;
import com.fypify.backend.modules.committee.dto.*;
import com.fypify.backend.modules.committee.entity.DeadlineBatch;
import com.fypify.backend.modules.committee.entity.ProjectDeadline;
import com.fypify.backend.modules.committee.repository.DeadlineBatchRepository;
import com.fypify.backend.modules.committee.repository.ProjectDeadlineRepository;
import com.fypify.backend.modules.email.service.EmailService;
import com.fypify.backend.modules.group.entity.StudentGroup;
import com.fypify.backend.modules.notification.entity.Notification;
import com.fypify.backend.modules.notification.entity.NotificationType;
import com.fypify.backend.modules.notification.repository.NotificationRepository;
import com.fypify.backend.modules.project.dto.ProjectDto;
import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.project.entity.ProjectStatus;
import com.fypify.backend.modules.project.repository.ProjectRepository;
import com.fypify.backend.modules.project.service.ProjectService;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for FYP Committee operations.
 * Handles project approval/rejection and deadline management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FypCommitteeService {

    private static final int MIN_DAYS_BETWEEN_DEADLINES = 15;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("MMMM dd, yyyy")
            .withZone(ZoneId.systemDefault());

    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final DeadlineBatchRepository batchRepository;
    private final ProjectDeadlineRepository deadlineRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    // ==================== Project Approval/Rejection ====================

    /**
     * Get all pending projects for FYP Committee review.
     */
    public Page<ProjectDto> getPendingProjects(Pageable pageable) {
        return projectRepository.findByStatus(ProjectStatus.PENDING_APPROVAL, pageable)
                .map(projectService::toDto);
    }

    /**
     * Approve a project and assign a supervisor.
     */
    @Transactional
    public ProjectDto approveProject(UUID projectId, ApproveProjectRequest request, User approver) {
        // Verify approver is FYP Committee
        if (!approver.isFypCommittee() && !approver.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only FYP Committee members can approve projects");
        }

        Project project = projectRepository.findByIdWithRelations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Verify project is pending
        if (!project.isPendingApproval()) {
            throw new BusinessRuleException("INVALID_STATUS", "Project is not pending approval");
        }

        // Validate supervisor
        User supervisor = userRepository.findById(request.getSupervisorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getSupervisorId()));

        if (!supervisor.isSupervisor()) {
            throw new BusinessRuleException("INVALID_SUPERVISOR", "Selected user is not a supervisor");
        }

        // Find applicable deadline batch
        Instant approvalTime = Instant.now();
        DeadlineBatch batch = batchRepository.findApplicableBatchWithDeadlines(approvalTime)
                .orElse(null);

        // Approve the project
        project.approve(approver, supervisor);
        project.setDeadlineBatch(batch);
        project = projectRepository.save(project);

        StudentGroup group = project.getGroup();

        // Send notifications and emails
        sendApprovalNotifications(project, supervisor, group, batch);

        // Audit log
        auditLogService.logUpdate(approver, "Project", project.getId(),
                Map.of("status", ProjectStatus.PENDING_APPROVAL.name()),
                Map.of("status", ProjectStatus.APPROVED.name(), 
                       "supervisorId", supervisor.getId().toString()));

        log.info("Project '{}' approved by {} with supervisor {}", 
                project.getTitle(), approver.getId(), supervisor.getId());

        return projectService.toDto(project);
    }

    /**
     * Reject a project with a reason.
     */
    @Transactional
    public ProjectDto rejectProject(UUID projectId, RejectProjectRequest request, User rejector) {
        // Verify rejector is FYP Committee
        if (!rejector.isFypCommittee() && !rejector.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only FYP Committee members can reject projects");
        }

        Project project = projectRepository.findByIdWithRelations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Verify project is pending
        if (!project.isPendingApproval()) {
            throw new BusinessRuleException("INVALID_STATUS", "Project is not pending approval");
        }

        // Reject the project
        project.reject(rejector, request.getReason());
        project = projectRepository.save(project);

        StudentGroup group = project.getGroup();

        // Send notifications and emails
        sendRejectionNotifications(project, group, request.getReason());

        // Audit log
        auditLogService.logUpdate(rejector, "Project", project.getId(),
                Map.of("status", ProjectStatus.PENDING_APPROVAL.name()),
                Map.of("status", ProjectStatus.REJECTED.name(), 
                       "reason", request.getReason()));

        log.info("Project '{}' rejected by {} - reason: {}", 
                project.getTitle(), rejector.getId(), request.getReason());

        return projectService.toDto(project);
    }

    // ==================== Deadline Batch Management ====================

    /**
     * Create a new deadline batch with deadlines for document types.
     */
    @Transactional
    public DeadlineBatchDto createDeadlineBatch(CreateDeadlineBatchRequest request, User creator) {
        // Verify creator is FYP Committee or Admin
        if (!creator.isFypCommittee() && !creator.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only FYP Committee members can create deadline batches");
        }

        // Check name uniqueness
        if (batchRepository.existsByName(request.getName())) {
            throw new ConflictException("A deadline batch with this name already exists");
        }

        // Validate deadlines order and dates
        validateDeadlines(request.getDeadlines());

        // Create the batch
        DeadlineBatch batch = DeadlineBatch.builder()
                .name(request.getName())
                .description(request.getDescription())
                .appliesFrom(request.getAppliesFrom())
                .appliesUntil(request.getAppliesUntil())
                .isActive(true)
                .createdBy(creator)
                .deadlines(new ArrayList<>())
                .build();

        // Add deadlines
        for (CreateDeadlineBatchRequest.DeadlineItem item : request.getDeadlines()) {
            DocumentType docType = documentTypeRepository.findById(item.getDocumentTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("DocumentType", "id", item.getDocumentTypeId()));

            ProjectDeadline deadline = ProjectDeadline.builder()
                    .batch(batch)
                    .documentType(docType)
                    .deadlineDate(item.getDeadlineDate())
                    .sortOrder(item.getSortOrder() != null ? item.getSortOrder() : docType.getDisplayOrder())
                    .build();

            batch.addDeadline(deadline);
        }

        batch = batchRepository.save(batch);

        // Send notifications about new deadlines
        sendDeadlineSetNotifications(batch);

        // Audit log
        auditLogService.logCreate(creator, "DeadlineBatch", batch.getId(),
                Map.of("name", batch.getName(), 
                       "deadlineCount", String.valueOf(batch.getDeadlines().size())));

        log.info("Deadline batch '{}' created by {} with {} deadlines", 
                batch.getName(), creator.getId(), batch.getDeadlines().size());

        return toBatchDto(batch);
    }

    /**
     * Get all deadline batches.
     */
    public Page<DeadlineBatchDto> getAllBatches(Pageable pageable) {
        return batchRepository.findAllByOrderByAppliesFromDesc(pageable)
                .map(this::toBatchDto);
    }

    /**
     * Get a deadline batch by ID with deadlines.
     */
    public DeadlineBatchDto getBatchById(UUID batchId) {
        DeadlineBatch batch = batchRepository.findByIdWithDeadlines(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("DeadlineBatch", "id", batchId));
        return toBatchDto(batch);
    }

    /**
     * Get the currently active deadline batch.
     */
    public Optional<DeadlineBatchDto> getCurrentBatch() {
        return batchRepository.findApplicableBatchWithDeadlines(Instant.now())
                .map(this::toBatchDto);
    }

    /**
     * Deactivate a deadline batch.
     */
    @Transactional
    public void deactivateBatch(UUID batchId, User actor) {
        if (!actor.isFypCommittee() && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only FYP Committee members can deactivate deadline batches");
        }

        DeadlineBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("DeadlineBatch", "id", batchId));

        batch.setIsActive(false);
        batchRepository.save(batch);

        auditLogService.logUpdate(actor, "DeadlineBatch", batchId,
                Map.of("isActive", "true"),
                Map.of("isActive", "false"));

        log.info("Deadline batch '{}' deactivated by {}", batch.getName(), actor.getId());
    }

    // ==================== Helper Methods ====================

    /**
     * Validate deadlines ensure proper ordering and minimum gaps.
     */
    private void validateDeadlines(List<CreateDeadlineBatchRequest.DeadlineItem> deadlines) {
        // Sort by sortOrder
        List<CreateDeadlineBatchRequest.DeadlineItem> sorted = deadlines.stream()
                .sorted(Comparator.comparingInt(d -> d.getSortOrder() != null ? d.getSortOrder() : 0))
                .toList();

        Instant previousDate = null;
        for (CreateDeadlineBatchRequest.DeadlineItem deadline : sorted) {
            if (previousDate != null) {
                long daysBetween = ChronoUnit.DAYS.between(previousDate, deadline.getDeadlineDate());
                if (daysBetween < MIN_DAYS_BETWEEN_DEADLINES) {
                    throw new BusinessRuleException("INVALID_DEADLINE_GAP", 
                            "Deadlines must be at least " + MIN_DAYS_BETWEEN_DEADLINES + 
                            " days apart. Found only " + daysBetween + " days between consecutive deadlines.");
                }
            }
            previousDate = deadline.getDeadlineDate();
        }
    }

    /**
     * Send approval notifications to group members, supervisor, and evaluation committee.
     */
    private void sendApprovalNotifications(Project project, User supervisor, StudentGroup group, DeadlineBatch batch) {
        String projectTitle = project.getTitle();
        UUID projectId = project.getId();

        // Collect student emails
        List<String> studentEmails = group.getMembers().stream()
                .map(m -> m.getStudent().getEmail())
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toList());

        // Notify group members (in-app)
        for (var member : group.getMembers()) {
            Notification notification = Notification.builder()
                    .user(member.getStudent())
                    .type(NotificationType.PROJECT_APPROVED)
                    .payload(Map.of(
                            "projectId", projectId.toString(),
                            "projectTitle", projectTitle,
                            "supervisorName", supervisor.getFullName()
                    ))
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        // Email to students
        emailService.sendProjectApprovedEmail(studentEmails, projectTitle, supervisor.getFullName());

        // Notify and email supervisor
        if (supervisor.getEmail() != null && !supervisor.getEmail().isBlank()) {
            Notification supervisorNotif = Notification.builder()
                    .user(supervisor)
                    .type(NotificationType.PROJECT_SUPERVISOR_ASSIGNED)
                    .payload(Map.of(
                            "projectId", projectId.toString(),
                            "projectTitle", projectTitle,
                            "groupName", group.getName()
                    ))
                    .isRead(false)
                    .build();
            notificationRepository.save(supervisorNotif);

            // Simple email to supervisor about assignment
            emailService.sendSimpleEmail(
                    supervisor.getEmail(),
                    "New Project Assignment: " + projectTitle,
                    "You have been assigned as supervisor for the project: " + projectTitle + "\n\n" +
                    "Group: " + group.getName() + "\n" +
                    "Please log in to FYPIFY to view project details and connect with your students."
            );
        }

        // Notify evaluation committee
        List<User> evalCommittee = userRepository.findByRoleName(Role.EVALUATION_COMMITTEE);
        List<String> evalEmails = new ArrayList<>();
        
        for (User member : evalCommittee) {
            Notification notification = Notification.builder()
                    .user(member)
                    .type(NotificationType.PROJECT_APPROVED)
                    .payload(Map.of(
                            "projectId", projectId.toString(),
                            "projectTitle", projectTitle,
                            "supervisorName", supervisor.getFullName(),
                            "message", "A new project has been approved and is ready for evaluation tracking."
                    ))
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
            
            if (member.getEmail() != null && !member.getEmail().isBlank()) {
                evalEmails.add(member.getEmail());
            }
        }

        // Email to evaluation committee
        if (!evalEmails.isEmpty()) {
            emailService.sendSimpleEmail(
                    evalEmails,
                    "New Project Approved: " + projectTitle,
                    "A new project has been approved and added to the evaluation queue.\n\n" +
                    "Project: " + projectTitle + "\n" +
                    "Supervisor: " + supervisor.getFullName() + "\n" +
                    "Group: " + group.getName() + "\n\n" +
                    "Please log in to FYPIFY to view project details."
            );
        }

        log.info("Approval notifications sent for project '{}'", projectTitle);
    }

    /**
     * Send rejection notifications to group members.
     */
    private void sendRejectionNotifications(Project project, StudentGroup group, String reason) {
        String projectTitle = project.getTitle();
        UUID projectId = project.getId();

        // Collect student emails
        List<String> studentEmails = group.getMembers().stream()
                .map(m -> m.getStudent().getEmail())
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toList());

        // Notify group members (in-app)
        for (var member : group.getMembers()) {
            Notification notification = Notification.builder()
                    .user(member.getStudent())
                    .type(NotificationType.PROJECT_REJECTED)
                    .payload(Map.of(
                            "projectId", projectId.toString(),
                            "projectTitle", projectTitle,
                            "reason", reason
                    ))
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }

        // Email to students
        emailService.sendProjectRejectedEmail(studentEmails, projectTitle, reason);

        log.info("Rejection notifications sent for project '{}'", projectTitle);
    }

    /**
     * Send notifications about new deadlines being set.
     */
    private void sendDeadlineSetNotifications(DeadlineBatch batch) {
        // Get all students and supervisors
        List<User> students = userRepository.findByRoleName(Role.STUDENT);
        List<User> supervisors = userRepository.findByRoleName(Role.SUPERVISOR);

        List<String> allEmails = new ArrayList<>();

        // Build deadline summary
        StringBuilder deadlineSummary = new StringBuilder();
        for (ProjectDeadline deadline : batch.getDeadlines()) {
            deadlineSummary.append("- ")
                    .append(deadline.getDocumentType().getTitle())
                    .append(": ")
                    .append(DATE_FORMATTER.format(deadline.getDeadlineDate()))
                    .append("\n");
        }

        // Notify students
        for (User student : students) {
            Notification notification = Notification.builder()
                    .user(student)
                    .type(NotificationType.DEADLINE_APPROACHING)
                    .payload(Map.of(
                            "batchName", batch.getName(),
                            "message", "New project deadlines have been set. Please check your dashboard."
                    ))
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);

            if (student.getEmail() != null && !student.getEmail().isBlank()) {
                allEmails.add(student.getEmail());
            }
        }

        // Notify supervisors
        for (User supervisor : supervisors) {
            Notification notification = Notification.builder()
                    .user(supervisor)
                    .type(NotificationType.DEADLINE_APPROACHING)
                    .payload(Map.of(
                            "batchName", batch.getName(),
                            "message", "New project deadlines have been set for the current batch."
                    ))
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);

            if (supervisor.getEmail() != null && !supervisor.getEmail().isBlank()) {
                allEmails.add(supervisor.getEmail());
            }
        }

        // Send email about deadlines
        if (!allEmails.isEmpty() && !batch.getDeadlines().isEmpty()) {
            ProjectDeadline firstDeadline = batch.getDeadlines().get(0);
            emailService.sendDeadlineSetEmail(
                    allEmails,
                    batch.getName(),
                    DATE_FORMATTER.format(firstDeadline.getDeadlineDate()),
                    "New project deadlines have been announced:\n\n" + deadlineSummary
            );
        }

        log.info("Deadline set notifications sent for batch '{}'", batch.getName());
    }

    // ==================== DTO Mappers ====================

    private DeadlineBatchDto toBatchDto(DeadlineBatch batch) {
        List<ProjectDeadlineDto> deadlineDtos = batch.getDeadlines().stream()
                .map(this::toDeadlineDto)
                .collect(Collectors.toList());

        return DeadlineBatchDto.builder()
                .id(batch.getId())
                .name(batch.getName())
                .description(batch.getDescription())
                .appliesFrom(batch.getAppliesFrom())
                .appliesUntil(batch.getAppliesUntil())
                .isActive(batch.getIsActive())
                .createdById(batch.getCreatedBy() != null ? batch.getCreatedBy().getId() : null)
                .createdByName(batch.getCreatedBy() != null ? batch.getCreatedBy().getFullName() : null)
                .deadlines(deadlineDtos)
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }

    private ProjectDeadlineDto toDeadlineDto(ProjectDeadline deadline) {
        DocumentType docType = deadline.getDocumentType();
        return ProjectDeadlineDto.builder()
                .id(deadline.getId())
                .batchId(deadline.getBatch().getId())
                .documentTypeId(docType.getId())
                .documentTypeCode(docType.getCode())
                .documentTypeTitle(docType.getTitle())
                .deadlineDate(deadline.getDeadlineDate())
                .sortOrder(deadline.getSortOrder())
                .isPast(deadline.isPast())
                .createdAt(deadline.getCreatedAt())
                .build();
    }
}
