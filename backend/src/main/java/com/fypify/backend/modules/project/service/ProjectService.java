package com.fypify.backend.modules.project.service;

import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.service.AuditLogService;
import com.fypify.backend.modules.email.service.EmailService;
import com.fypify.backend.modules.group.dto.GroupDto;
import com.fypify.backend.modules.group.entity.StudentGroup;
import com.fypify.backend.modules.group.repository.StudentGroupRepository;
import com.fypify.backend.modules.group.service.GroupService;
import com.fypify.backend.modules.notification.service.NotificationService;
import com.fypify.backend.modules.project.dto.*;
import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.project.entity.ProjectStatus;
import com.fypify.backend.modules.project.repository.ProjectRepository;
import com.fypify.backend.modules.user.dto.UserDto;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for project operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final StudentGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    // ==================== Project CRUD Operations ====================

    /**
     * Get all projects (paginated).
     */
    public Page<ProjectDto> getAllProjects(Pageable pageable) {
        return projectRepository.findAllWithRelations(pageable).map(this::toDto);
    }

    /**
     * Get projects by status.
     */
    public Page<ProjectDto> getProjectsByStatus(ProjectStatus status, Pageable pageable) {
        return projectRepository.findByStatus(status, pageable).map(this::toDto);
    }

    /**
     * Get pending projects (for FYP Committee review).
     */
    public Page<ProjectDto> getPendingProjects(Pageable pageable) {
        return projectRepository.findPendingProjects(pageable).map(this::toDto);
    }

    /**
     * Get projects supervised by a user.
     */
    public Page<ProjectDto> getProjectsBySupervisor(UUID supervisorId, Pageable pageable) {
        return projectRepository.findBySupervisorId(supervisorId, pageable).map(this::toDto);
    }

    /**
     * Search projects by title.
     */
    public Page<ProjectDto> searchProjects(String search, Pageable pageable) {
        return projectRepository.searchByTitle(search, pageable).map(this::toDto);
    }

    /**
     * Get project by ID.
     */
    public ProjectDto getProjectById(UUID projectId) {
        return toDto(findProjectById(projectId));
    }

    /**
     * Get project by ID with full details.
     */
    public ProjectDto getProjectWithDetails(UUID projectId) {
        Project project = projectRepository.findByIdWithRelations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        return toDtoWithDetails(project);
    }

    /**
     * Get project for a group.
     */
    public Optional<ProjectDto> getProjectByGroupId(UUID groupId) {
        return projectRepository.findByGroupId(groupId).map(this::toDto);
    }

    /**
     * Find project entity by ID.
     */
    public Project findProjectById(UUID projectId) {
        return projectRepository.findByIdWithRelations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
    }

    /**
     * Register a new project.
     * Only the group leader can register a project, and the group must not already have one.
     */
    @Transactional
    public ProjectDto registerProject(RegisterProjectRequest request, User registrar) {
        // Verify registrar is a student
        if (!registrar.isStudent()) {
            throw new BusinessRuleException("NOT_STUDENT", "Only students can register projects");
        }

        // Find the group
        StudentGroup group = groupRepository.findByIdWithMembers(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", request.getGroupId()));

        // Verify registrar is the group leader
        if (!group.isLeader(registrar.getId())) {
            throw new BusinessRuleException("NOT_GROUP_LEADER", "Only the group leader can register a project");
        }

        // Check if group already has a project
        if (projectRepository.existsByGroupId(request.getGroupId())) {
            throw new ConflictException("This group already has a registered project");
        }

        // Validate proposed supervisors if provided
        List<UUID> proposedSupervisors = request.getProposedSupervisors();
        if (proposedSupervisors != null && !proposedSupervisors.isEmpty()) {
            for (UUID supervisorId : proposedSupervisors) {
                User supervisor = userRepository.findById(supervisorId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", supervisorId));
                if (!supervisor.isSupervisor()) {
                    throw new BusinessRuleException("NOT_SUPERVISOR", "User " + supervisor.getFullName() + " is not a supervisor");
                }
            }
        }

        // Create the project with PENDING_APPROVAL status
        Project project = Project.builder()
                .group(group)
                .title(request.getTitle())
                .projectAbstract(request.getProjectAbstract())
                .domain(request.getDomain())
                .proposedSupervisors(proposedSupervisors)
                .status(ProjectStatus.PENDING_APPROVAL)
                .build();

        project = projectRepository.save(project);

        // Send notifications to FYP Committee members
        List<User> fypCommitteeMembers = userRepository.findByRoleName(Role.FYP_COMMITTEE);
        notificationService.sendProjectRegisteredNotification(
                fypCommitteeMembers,
                project.getId(),
                project.getTitle(),
                group.getId()
        );

        // Send email notification to FYP Committee members (async, non-blocking)
        List<String> fypCommitteeEmails = fypCommitteeMembers.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toList());
        emailService.sendProjectRegisteredEmail(
                fypCommitteeEmails,
                project.getTitle(),
                group.getName(),
                registrar.getFullName()
        );

        // Log the action
        auditLogService.logCreate(registrar, "Project", project.getId(),
                Map.of(
                        "title", project.getTitle(),
                        "groupId", group.getId().toString(),
                        "status", project.getStatus().name()
                ));

        log.info("Project '{}' registered by user {} for group {}", project.getTitle(), registrar.getId(), group.getId());

        return toDto(project);
    }

    /**
     * Update a project (only allowed while pending or rejected).
     */
    @Transactional
    public ProjectDto updateProject(UUID projectId, UpdateProjectRequest request, User actor) {
        Project project = findProjectById(projectId);

        // Verify actor is the group leader or admin
        StudentGroup group = project.getGroup();
        if (!group.isLeader(actor.getId()) && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only the group leader can update the project");
        }

        // Only allow updates while pending or rejected (for resubmission)
        if (!project.isPendingApproval() && !project.isRejected() && !actor.isAdmin()) {
            throw new BusinessRuleException("PROJECT_NOT_EDITABLE", "Project can only be updated while pending approval or rejected");
        }

        // Capture old values
        String oldTitle = project.getTitle();
        String oldDomain = project.getDomain();
        boolean hasChanges = false;

        if (request.getTitle() != null && !request.getTitle().equals(project.getTitle())) {
            project.setTitle(request.getTitle());
            hasChanges = true;
        }

        if (request.getProjectAbstract() != null) {
            project.setProjectAbstract(request.getProjectAbstract());
            hasChanges = true;
        }

        if (request.getDomain() != null) {
            project.setDomain(request.getDomain());
            hasChanges = true;
        }

        if (request.getProposedSupervisors() != null) {
            // Validate supervisors
            for (UUID supervisorId : request.getProposedSupervisors()) {
                User supervisor = userRepository.findById(supervisorId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", supervisorId));
                if (!supervisor.isSupervisor()) {
                    throw new BusinessRuleException("NOT_SUPERVISOR", "User " + supervisor.getFullName() + " is not a supervisor");
                }
            }
            project.setProposedSupervisors(request.getProposedSupervisors());
            hasChanges = true;
        }

        project = projectRepository.save(project);

        if (hasChanges) {
            auditLogService.logUpdate(actor, "Project", project.getId(),
                    Map.of("title", oldTitle, "domain", oldDomain != null ? oldDomain : ""),
                    Map.of("title", project.getTitle(), "domain", project.getDomain() != null ? project.getDomain() : ""));
        }

        return toDto(project);
    }

    /**
     * Approve or reject a project (FYP Committee only).
     */
    @Transactional
    public ProjectDto makeDecision(UUID projectId, ProjectDecisionRequest request, User decisionMaker) {
        // Verify decision maker is FYP Committee or Admin
        if (!decisionMaker.isFypCommittee() && !decisionMaker.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "Only FYP Committee members can approve/reject projects");
        }

        Project project = findProjectById(projectId);

        // Must be pending
        if (!project.isPendingApproval()) {
            throw new BusinessRuleException("PROJECT_ALREADY_PROCESSED", "This project has already been processed");
        }

        StudentGroup group = project.getGroup();
        ProjectStatus oldStatus = project.getStatus();

        if (request.getApprove()) {
            // Approve the project
            if (request.getSupervisorId() == null) {
                throw new BusinessRuleException("SUPERVISOR_REQUIRED", "Supervisor ID is required when approving a project");
            }

            User supervisor = userRepository.findById(request.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getSupervisorId()));

            if (!supervisor.isSupervisor()) {
                throw new BusinessRuleException("NOT_SUPERVISOR", "The assigned user is not a supervisor");
            }

            project.approve(decisionMaker, supervisor);

            // Notify group members
            for (var member : group.getMembers()) {
                notificationService.sendProjectApprovedNotification(
                        member.getStudent(),
                        project.getId(),
                        project.getTitle(),
                        supervisor
                );
            }

            // Send email notification to group members (async, non-blocking)
            List<String> studentEmails = group.getMembers().stream()
                    .map(m -> m.getStudent().getEmail())
                    .filter(email -> email != null && !email.isBlank())
                    .collect(Collectors.toList());
            emailService.sendProjectApprovedEmail(studentEmails, project.getTitle(), supervisor.getFullName());

            auditLogService.logUpdate(decisionMaker, "Project", project.getId(),
                    Map.of("status", oldStatus.name()),
                    Map.of("status", project.getStatus().name(), "supervisorId", supervisor.getId().toString()));

            log.info("Project '{}' approved by {} with supervisor {}", project.getTitle(), decisionMaker.getId(), supervisor.getId());

        } else {
            // Reject the project
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BusinessRuleException("REJECTION_REASON_REQUIRED", "Rejection reason is required");
            }

            project.reject(decisionMaker, request.getRejectionReason());

            // Notify group members
            for (var member : group.getMembers()) {
                notificationService.sendProjectRejectedNotification(
                        member.getStudent(),
                        project.getId(),
                        project.getTitle(),
                        request.getRejectionReason()
                );
            }

            // Send email notification to group members (async, non-blocking)
            List<String> studentEmails = group.getMembers().stream()
                    .map(m -> m.getStudent().getEmail())
                    .filter(email -> email != null && !email.isBlank())
                    .collect(Collectors.toList());
            emailService.sendProjectRejectedEmail(studentEmails, project.getTitle(), request.getRejectionReason());

            auditLogService.logUpdate(decisionMaker, "Project", project.getId(),
                    Map.of("status", oldStatus.name()),
                    Map.of("status", project.getStatus().name(), "rejectionReason", request.getRejectionReason()));

            log.info("Project '{}' rejected by {} - reason: {}", project.getTitle(), decisionMaker.getId(), request.getRejectionReason());
        }

        return toDto(projectRepository.save(project));
    }

    /**
     * Delete a project (admin only, or group leader while pending).
     */
    @Transactional
    public void deleteProject(UUID projectId, User actor) {
        Project project = findProjectById(projectId);

        // Admin can always delete, group leader only while pending
        boolean isLeader = project.getGroup() != null && project.getGroup().isLeader(actor.getId());
        boolean canDelete = actor.isAdmin() || (isLeader && project.isPendingApproval());

        if (!canDelete) {
            throw new BusinessRuleException("PERMISSION_DENIED", "You don't have permission to delete this project");
        }

        projectRepository.delete(project);

        auditLogService.logDelete(actor, "Project", projectId,
                Map.of("title", project.getTitle()));

        log.info("Project '{}' deleted by {}", project.getTitle(), actor.getId());
    }

    /**
     * Resubmit a rejected project for approval.
     * Only the group leader can resubmit a rejected project.
     */
    @Transactional
    public ProjectDto resubmitProject(UUID projectId, User actor) {
        Project project = findProjectById(projectId);

        // Verify actor is the group leader
        StudentGroup group = project.getGroup();
        if (!group.isLeader(actor.getId())) {
            throw new BusinessRuleException("NOT_GROUP_LEADER", "Only the group leader can resubmit the project");
        }

        // Verify project is rejected
        if (!project.isRejected()) {
            throw new BusinessRuleException("PROJECT_NOT_REJECTED", "Only rejected projects can be resubmitted");
        }

        // Resubmit the project
        String previousRejectionReason = project.getRejectionReason();
        project.resubmit();
        project = projectRepository.save(project);

        // Send notifications to FYP Committee members
        List<User> fypCommitteeMembers = userRepository.findByRoleName(Role.FYP_COMMITTEE);
        notificationService.sendProjectRegisteredNotification(
                fypCommitteeMembers,
                project.getId(),
                project.getTitle() + " (Resubmitted)",
                group.getId()
        );

        // Send email notification to FYP Committee members (async, non-blocking)
        List<String> fypCommitteeEmails = fypCommitteeMembers.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toList());
        emailService.sendProjectRegisteredEmail(
                fypCommitteeEmails,
                project.getTitle() + " (Resubmitted)",
                group.getName(),
                actor.getFullName()
        );

        // Log the action
        auditLogService.logUpdate(actor, "Project", project.getId(),
                Map.of("status", ProjectStatus.REJECTED.name(), "rejectionReason", previousRejectionReason != null ? previousRejectionReason : ""),
                Map.of("status", ProjectStatus.PENDING_APPROVAL.name()));

        log.info("Project '{}' resubmitted by user {} for group {}", project.getTitle(), actor.getId(), group.getId());

        return toDto(project);
    }

    // ==================== Statistics ====================

    /**
     * Get project counts by status.
     */
    public Map<String, Long> getProjectCountsByStatus() {
        Map<String, Long> counts = new HashMap<>();
        for (ProjectStatus status : ProjectStatus.values()) {
            counts.put(status.name(), projectRepository.countByStatus(status));
        }
        return counts;
    }

    // ==================== Conversion Methods ====================

    /**
     * Convert Project entity to DTO.
     */
    public ProjectDto toDto(Project project) {
        return ProjectDto.builder()
                .id(project.getId())
                .title(project.getTitle())
                .projectAbstract(project.getProjectAbstract())
                .domain(project.getDomain())
                .proposedSupervisors(project.getProposedSupervisors())
                .supervisor(project.getSupervisor() != null ? toUserDto(project.getSupervisor()) : null)
                .status(project.getStatus())
                .statusDisplay(formatStatusDisplay(project.getStatus()))
                .approvedBy(project.getApprovedBy() != null ? toUserDto(project.getApprovedBy()) : null)
                .approvedAt(project.getApprovedAt())
                .rejectionReason(project.getRejectionReason())
                .groupId(project.getGroup() != null ? project.getGroup().getId() : null)
                .groupName(project.getGroup() != null ? project.getGroup().getName() : null)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    /**
     * Convert Project entity to DTO with full details.
     */
    public ProjectDto toDtoWithDetails(Project project) {
        ProjectDto dto = toDto(project);

        // Add full group details
        if (project.getGroup() != null) {
            dto.setGroup(groupService.toDto(project.getGroup()));
        }

        // Add proposed supervisor details
        if (project.getProposedSupervisors() != null && !project.getProposedSupervisors().isEmpty()) {
            List<UserDto> supervisorDetails = project.getProposedSupervisors().stream()
                    .map(id -> userRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .map(this::toUserDto)
                    .collect(Collectors.toList());
            dto.setProposedSupervisorDetails(supervisorDetails);
        }

        return dto;
    }

    /**
     * Convert User entity to simplified DTO.
     */
    private UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Format project status for display.
     */
    private String formatStatusDisplay(ProjectStatus status) {
        return switch (status) {
            case PENDING_APPROVAL -> "Pending Approval";
            case APPROVED -> "Approved";
            case REJECTED -> "Rejected";
            case IN_PROGRESS -> "In Progress";
            case COMPLETED -> "Completed";
            case ARCHIVED -> "Archived";
        };
    }
}
