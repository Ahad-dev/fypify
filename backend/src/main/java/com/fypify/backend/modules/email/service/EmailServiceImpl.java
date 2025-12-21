package com.fypify.backend.modules.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Email Service Implementation.
 * Handles all email sending functionality using Gmail SMTP.
 * All methods are async to avoid blocking business logic.
 * Failures are logged but never propagated to callers.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${email.enabled:true}")
    private boolean emailEnabled;

    @Value("${email.from.address:noreply@fypify.com}")
    private String fromAddress;

    @Value("${email.from.name:FYPIFY}")
    private String fromName;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // ==================== Core Email Methods ====================

    @Override
    @Async("emailTaskExecutor")
    public void sendSimpleEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            log.debug("Email sending is disabled. Would have sent to: {}", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(String.format("%s <%s>", fromName, fromAddress));
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);

        } catch (MailException e) {
            log.error("Failed to send simple email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendSimpleEmail(List<String> recipients, String subject, String body) {
        if (!emailEnabled) {
            log.debug("Email sending is disabled. Would have sent to {} recipients", recipients.size());
            return;
        }

        for (String recipient : recipients) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(String.format("%s <%s>", fromName, fromAddress));
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(body);

                mailSender.send(message);
                log.info("Simple email sent successfully to: {}", recipient);

            } catch (MailException e) {
                log.error("Failed to send simple email to {}: {}", recipient, e.getMessage());
            }
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        if (!emailEnabled) {
            log.debug("Email sending is disabled. Would have sent template '{}' to: {}", templateName, to);
            return;
        }

        try {
            // Add common variables
            Map<String, Object> allVariables = new HashMap<>(variables);
            allVariables.put("frontendUrl", frontendUrl);
            allVariables.put("year", java.time.Year.now().getValue());

            // Process template
            Context context = new Context();
            context.setVariables(allVariables);
            String htmlContent = templateEngine.process("email/" + templateName, context);

            // Create and send message
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(String.format("%s <%s>", fromName, fromAddress));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Template email '{}' sent successfully to: {}", templateName, to);

        } catch (MessagingException | MailException e) {
            log.error("Failed to send template email '{}' to {}: {}", templateName, to, e.getMessage());
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendTemplateEmail(List<String> recipients, String subject, String templateName, Map<String, Object> variables) {
        if (!emailEnabled) {
            log.debug("Email sending is disabled. Would have sent template '{}' to {} recipients", templateName, recipients.size());
            return;
        }

        for (String recipient : recipients) {
            try {
                // Add common variables
                Map<String, Object> allVariables = new HashMap<>(variables);
                allVariables.put("frontendUrl", frontendUrl);
                allVariables.put("year", java.time.Year.now().getValue());

                // Process template
                Context context = new Context();
                context.setVariables(allVariables);
                String htmlContent = templateEngine.process("email/" + templateName, context);

                // Create and send message
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(String.format("%s <%s>", fromName, fromAddress));
                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(mimeMessage);
                log.info("Template email '{}' sent successfully to: {}", templateName, recipient);

            } catch (MessagingException | MailException e) {
                log.error("Failed to send template email '{}' to {}: {}", templateName, recipient, e.getMessage());
            }
        }
    }

    // ==================== Project-Related Emails ====================

    @Override
    @Async("emailTaskExecutor")
    public void sendProjectRegisteredEmail(List<String> fypCommitteeEmails, String projectTitle, String groupName, String registeredBy) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "groupName", groupName,
                "registeredBy", registeredBy
        );
        sendTemplateEmail(fypCommitteeEmails, "New Project Registration: " + projectTitle, "project-registered", variables);
        log.info("Project registered emails sent for project: {}", projectTitle);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendProjectApprovedEmail(List<String> studentEmails, String projectTitle, String supervisorName) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "supervisorName", supervisorName
        );
        sendTemplateEmail(studentEmails, "Project Approved: " + projectTitle, "project-approved", variables);
        log.info("Project approved emails sent for project: {}", projectTitle);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendProjectRejectedEmail(List<String> studentEmails, String projectTitle, String rejectionReason) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "rejectionReason", rejectionReason
        );
        sendTemplateEmail(studentEmails, "Project Requires Changes: " + projectTitle, "project-rejected", variables);
        log.info("Project rejected emails sent for project: {}", projectTitle);
    }

    // ==================== Deadline-Related Emails ====================

    @Override
    @Async("emailTaskExecutor")
    public void sendDeadlineSetEmail(List<String> recipientEmails, String deadlineTitle, String dueDate, String description) {
        Map<String, Object> variables = Map.of(
                "deadlineTitle", deadlineTitle,
                "dueDate", dueDate,
                "description", description
        );
        sendTemplateEmail(recipientEmails, "New Deadline: " + deadlineTitle, "deadline-set", variables);
        log.info("Deadline set emails sent for: {}", deadlineTitle);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendDeadlineReminderEmail(List<String> recipientEmails, String deadlineTitle, String dueDate, int hoursRemaining) {
        Map<String, Object> variables = Map.of(
                "deadlineTitle", deadlineTitle,
                "dueDate", dueDate,
                "hoursRemaining", hoursRemaining
        );
        sendTemplateEmail(recipientEmails, "Deadline Reminder: " + deadlineTitle, "deadline-reminder", variables);
        log.info("Deadline reminder emails sent for: {}", deadlineTitle);
    }

    // ==================== Submission-Related Emails ====================

    @Override
    @Async("emailTaskExecutor")
    public void sendSubmissionUploadedEmail(String supervisorEmail, String studentName, String projectTitle, String submissionType) {
        Map<String, Object> variables = Map.of(
                "studentName", studentName,
                "projectTitle", projectTitle,
                "submissionType", submissionType
        );
        sendTemplateEmail(supervisorEmail, "New Submission: " + submissionType + " - " + projectTitle, "submission-uploaded", variables);
        log.info("Submission uploaded email sent to supervisor for project: {}", projectTitle);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendRevisionRequestedEmail(List<String> studentEmails, String projectTitle, String submissionType, String feedback) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "submissionType", submissionType,
                "feedback", feedback
        );
        sendTemplateEmail(studentEmails, "Revision Requested: " + submissionType + " - " + projectTitle, "revision-requested", variables);
        log.info("Revision requested emails sent for project: {}", projectTitle);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendDocumentLockedEmail(List<String> studentEmails, String projectTitle, String documentType) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "documentType", documentType
        );
        sendTemplateEmail(studentEmails, "Document Locked: " + documentType + " - " + projectTitle, "document-locked", variables);
        log.info("Document locked emails sent for project: {}", projectTitle);
    }

    // ==================== Evaluation-Related Emails ====================

    @Override
    @Async("emailTaskExecutor")
    public void sendEvaluationAvailableEmail(List<String> studentEmails, String projectTitle, String evaluationType) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "evaluationType", evaluationType
        );
        sendTemplateEmail(studentEmails, "Evaluation Available: " + evaluationType, "evaluation-available", variables);
        log.info("Evaluation available emails sent for project: {}", projectTitle);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendFinalResultEmail(List<String> studentEmails, String projectTitle, String result) {
        Map<String, Object> variables = Map.of(
                "projectTitle", projectTitle,
                "result", result
        );
        sendTemplateEmail(studentEmails, "Final Result Released: " + projectTitle, "final-result", variables);
        log.info("Final result emails sent for project: {}", projectTitle);
    }

    // ==================== Group-Related Emails ====================

    @Override
    @Async("emailTaskExecutor")
    public void sendGroupInviteEmail(String inviteeEmail, String groupName, String inviterName) {
        Map<String, Object> variables = Map.of(
                "groupName", groupName,
                "inviterName", inviterName
        );
        sendTemplateEmail(inviteeEmail, "Group Invitation: " + groupName, "group-invite", variables);
        log.info("Group invite email sent to: {}", inviteeEmail);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendMemberJoinedEmail(List<String> memberEmails, String newMemberName, String groupName) {
        Map<String, Object> variables = Map.of(
                "newMemberName", newMemberName,
                "groupName", groupName
        );
        sendTemplateEmail(memberEmails, "New Member Joined: " + groupName, "member-joined", variables);
        log.info("Member joined emails sent for group: {}", groupName);
    }
}
