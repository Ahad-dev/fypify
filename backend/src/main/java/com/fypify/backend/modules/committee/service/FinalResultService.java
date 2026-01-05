package com.fypify.backend.modules.committee.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.entity.DocumentType;
import com.fypify.backend.modules.admin.repository.DocumentTypeRepository;
import com.fypify.backend.modules.committee.dto.FinalResultDetailsDto;
import com.fypify.backend.modules.committee.dto.FinalResultDto;
import com.fypify.backend.modules.committee.entity.FinalResult;
import com.fypify.backend.modules.committee.entity.ProjectDeadline;
import com.fypify.backend.modules.committee.repository.FinalResultRepository;
import com.fypify.backend.modules.committee.repository.ProjectDeadlineRepository;
import com.fypify.backend.modules.group.entity.StudentGroup;
import com.fypify.backend.modules.notification.entity.NotificationType;
import com.fypify.backend.modules.notification.service.NotificationService;
import com.fypify.backend.modules.project.entity.Project;
import com.fypify.backend.modules.project.repository.ProjectRepository;
import com.fypify.backend.modules.submission.entity.DocumentSubmission;
import com.fypify.backend.modules.submission.entity.EvaluationMarks;
import com.fypify.backend.modules.submission.entity.SupervisorMarks;
import com.fypify.backend.modules.submission.entity.SubmissionStatus;
import com.fypify.backend.modules.submission.repository.DocumentSubmissionRepository;
import com.fypify.backend.modules.submission.repository.EvaluationMarksRepository;
import com.fypify.backend.modules.submission.repository.SupervisorMarksRepository;
import com.fypify.backend.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for computing and releasing final results.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FinalResultService {

    private final FinalResultRepository finalResultRepository;
    private final ProjectRepository projectRepository;
    private final DocumentSubmissionRepository submissionRepository;
    private final EvaluationMarksRepository evaluationMarksRepository;
    private final SupervisorMarksRepository supervisorMarksRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final ProjectDeadlineRepository projectDeadlineRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    /**
     * Compute final result for a project.
     * Requires all document types from the project's deadline batch to have
     * finalized submissions with supervisor and committee marks.
     */
    @Transactional
    public FinalResultDto computeFinalResult(UUID projectId, User computedBy) {
        log.info("Computing final result for project {} by {}", projectId, computedBy.getEmail());

        // 1. Check if result already exists
        if (finalResultRepository.existsByProjectId(projectId)) {
            throw new ConflictException("Final result already computed for this project. Use update endpoint to recompute.");
        }

        // 2. Get project with deadline batch
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // 3. Validate project has a deadline batch assigned
        if (project.getDeadlineBatch() == null) {
            throw new BusinessRuleException("NO_DEADLINE_BATCH", "Project does not have a deadline batch assigned");
        }

        // 4. Get required document types from project's deadline batch
        List<ProjectDeadline> deadlines = projectDeadlineRepository.findByBatchIdWithDocumentType(
                project.getDeadlineBatch().getId());
        
        if (deadlines.isEmpty()) {
            throw new BusinessRuleException("NO_DEADLINES", "No deadlines found in the project's deadline batch");
        }
        
        Set<UUID> requiredDocTypeIds = deadlines.stream()
                .map(d -> d.getDocumentType().getId())
                .collect(Collectors.toSet());
        
        log.info("Project {} requires {} document types from deadline batch", projectId, requiredDocTypeIds.size());

        // 5. Get all finalized submissions for project
        List<DocumentSubmission> allSubmissions = submissionRepository.findByProjectId(projectId).stream()
                .filter(s -> s.getStatus() == SubmissionStatus.EVAL_FINALIZED)
                .filter(DocumentSubmission::getIsFinal) // Only final versions
                .toList();

        if (allSubmissions.isEmpty()) {
            throw new BusinessRuleException("NO_FINALIZED_SUBMISSIONS", "No finalized submissions found for this project");
        }

        // 6. Filter submissions to only include those for required document types
        List<DocumentSubmission> submissions = allSubmissions.stream()
                .filter(s -> requiredDocTypeIds.contains(s.getDocumentType().getId()))
                .toList();
        
        // 7. Validate all required document types have finalized submissions
        Set<UUID> finalizedDocTypeIds = submissions.stream()
                .map(s -> s.getDocumentType().getId())
                .collect(Collectors.toSet());
        
        Set<UUID> missingDocTypes = new HashSet<>(requiredDocTypeIds);
        missingDocTypes.removeAll(finalizedDocTypeIds);
        
        if (!missingDocTypes.isEmpty()) {
            // Get names of missing document types
            List<String> missingNames = deadlines.stream()
                    .filter(d -> missingDocTypes.contains(d.getDocumentType().getId()))
                    .map(d -> d.getDocumentType().getTitle())
                    .toList();
            throw new BusinessRuleException("INCOMPLETE_EVALUATIONS", 
                    "Not all required documents are evaluated. Missing: " + String.join(", ", missingNames));
        }

        // 8. Calculate weighted scores for each submission
        List<FinalResultDetailsDto.DocumentScoreBreakdown> breakdowns = new ArrayList<>();
        BigDecimal totalWeightedScore = BigDecimal.ZERO;
        int totalWeight = 0;

        for (DocumentSubmission submission : submissions) {
            DocumentType docType = submission.getDocumentType();
            
            // Get supervisor score from supervisor_marks table
            BigDecimal supervisorScore = supervisorMarksRepository.findBySubmissionId(submission.getId())
                    .map(SupervisorMarks::getScore)
                    .orElse(BigDecimal.ZERO);
            
            // Get committee average score
            List<EvaluationMarks> evalMarks = evaluationMarksRepository
                    .findFinalizedBySubmissionId(submission.getId());
            
            BigDecimal committeeAvgScore = BigDecimal.ZERO;
            if (!evalMarks.isEmpty()) {
                BigDecimal sum = evalMarks.stream()
                        .map(EvaluationMarks::getScore)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                committeeAvgScore = sum.divide(BigDecimal.valueOf(evalMarks.size()), 4, RoundingMode.HALF_UP);
            }

            // Calculate weighted score for this document
            int supervisorWeight = docType.getWeightSupervisor();
            int committeeWeight = docType.getWeightCommittee();
            
            // weightedScore = (supervisorScore * supervisorWeight + committeeAvgScore * committeeWeight) / 100
            BigDecimal weightedScore = supervisorScore.multiply(BigDecimal.valueOf(supervisorWeight))
                    .add(committeeAvgScore.multiply(BigDecimal.valueOf(committeeWeight)))
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            breakdowns.add(FinalResultDetailsDto.DocumentScoreBreakdown.builder()
                    .submissionId(submission.getId())
                    .docTypeCode(docType.getCode())
                    .docTypeTitle(docType.getTitle())
                    .supervisorScore(supervisorScore)
                    .supervisorWeight(supervisorWeight)
                    .committeeAvgScore(committeeAvgScore)
                    .committeeWeight(committeeWeight)
                    .committeeEvaluatorCount(evalMarks.size())
                    .weightedScore(weightedScore)
                    .build());

            totalWeightedScore = totalWeightedScore.add(weightedScore);
            totalWeight++;
        }

        // Calculate overall average
        BigDecimal finalScore = totalWeight > 0 
                ? totalWeightedScore.divide(BigDecimal.valueOf(totalWeight), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 5. Create details DTO
        FinalResultDetailsDto details = FinalResultDetailsDto.builder()
                .documents(breakdowns)
                .totalScore(finalScore)
                .computedAt(Instant.now())
                .computedById(computedBy.getId())
                .computedByName(computedBy.getFullName())
                .build();

        // 6. Create and save final result
        FinalResult finalResult = FinalResult.builder()
                .project(project)
                .totalScore(finalScore)
                .details(serializeDetails(details))
                .released(false)
                .build();

        finalResult = finalResultRepository.save(finalResult);
        log.info("Computed final result for project {}: score = {}", projectId, finalScore);

        return toDto(finalResult);
    }

    /**
     * Release final result to students.
     */
    @Transactional
    public FinalResultDto releaseFinalResult(UUID projectId, User releasedBy) {
        log.info("Releasing final result for project {} by {}", projectId, releasedBy.getEmail());

        FinalResult finalResult = finalResultRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Final result not found. Compute first."));

        if (finalResult.getReleased()) {
            throw new ConflictException("Final result is already released");
        }

        // Release the result
        finalResult.release(releasedBy);
        finalResult = finalResultRepository.save(finalResult);

        // Send notifications to all group members
        sendResultReleasedNotifications(finalResult);

        log.info("Released final result for project {}", projectId);
        return toDto(finalResult);
    }

    /**
     * Get final result for a project.
     * Returns null if no result exists yet.
     */
    @Transactional(readOnly = true)
    public FinalResultDto getFinalResult(UUID projectId) {
        return finalResultRepository.findByProjectId(projectId)
                .map(this::toDto)
                .orElse(null);
    }

    /**
     * Get released final result (for student view).
     */
    @Transactional(readOnly = true)
    public FinalResultDto getReleasedResult(UUID projectId) {
        FinalResult finalResult = finalResultRepository.findReleasedByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Released result not found"));
        return toDto(finalResult);
    }

    // ============ Helper Methods ============

    private void sendResultReleasedNotifications(FinalResult result) {
        Project project = result.getProject();
        StudentGroup group = project.getGroup();
        
        if (group == null || group.getMembers() == null) {
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("projectId", project.getId().toString());
        payload.put("projectTitle", project.getTitle());
        payload.put("totalScore", result.getTotalScore().toString());
        payload.put("title", "Results Released");
        payload.put("message", String.format("Final results for '%s' have been released. Your score: %.2f", 
                project.getTitle(), result.getTotalScore()));

        group.getMembers().forEach(member -> {
            notificationService.sendNotification(
                    member.getStudent(),
                    NotificationType.RESULT_RELEASED,
                    payload
            );
        });
    }

    private String serializeDetails(FinalResultDetailsDto details) {
        try {
            return objectMapper.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize final result details", e);
            throw new RuntimeException("Failed to serialize result details", e);
        }
    }

    private FinalResultDetailsDto deserializeDetails(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, FinalResultDetailsDto.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize final result details", e);
            return null;
        }
    }

    private FinalResultDto toDto(FinalResult finalResult) {
        return FinalResultDto.builder()
                .id(finalResult.getId())
                .projectId(finalResult.getProject().getId())
                .projectTitle(finalResult.getProject().getTitle())
                .totalScore(finalResult.getTotalScore())
                .details(deserializeDetails(finalResult.getDetails()))
                .released(finalResult.getReleased())
                .releasedById(finalResult.getReleasedBy() != null ? finalResult.getReleasedBy().getId() : null)
                .releasedByName(finalResult.getReleasedBy() != null ? finalResult.getReleasedBy().getFullName() : null)
                .releasedAt(finalResult.getReleasedAt())
                .createdAt(finalResult.getCreatedAt())
                .updatedAt(finalResult.getUpdatedAt())
                .build();
    }
}
