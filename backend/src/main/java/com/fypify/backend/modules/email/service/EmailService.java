package com.fypify.backend.modules.email.service;

import java.util.List;
import java.util.Map;

/**
 * Email Service Interface.
 * Provides methods for sending various types of emails asynchronously.
 * All email operations are non-blocking and failures are logged but not propagated.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. STRATEGY PATTERN (Behavioral) - Interface defines Email Strategy
 *    - This interface defines the strategy for sending emails.
 *    - EmailServiceImpl is the concrete strategy for SMTP/Gmail.
 *    - Future implementations: SendGridEmailService, SesEmailService, MockEmailService
 *    - Clients depend on interface, not implementation (DIP).
 * 
 * 2. TEMPLATE METHOD PATTERN (Behavioral) - Implicit in method signatures
 *    - All specialized email methods (sendProjectRegisteredEmail, etc.) follow a template.
 *    - They prepare data → call core method → handle result.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. ABSTRACT FACTORY PATTERN (Creational) - Suggested
 *    - Create EmailServiceFactory that produces different email service implementations
 *      based on configuration (SMTP, SendGrid, AWS SES, etc.)
 * 
 * 2. DECORATOR PATTERN (Structural) - Suggested
 *    - Create decorators: RetryableEmailService, LoggingEmailService, RateLimitedEmailService
 *    - Each decorator adds behavior without modifying the core implementation.
 * 
 * ===========================================================================================
 */
public interface EmailService {

    // ==================== Core Email Methods ====================

    /**
     * Send a simple text email.
     *
     * @param to      Recipient email address
     * @param subject Email subject
     * @param body    Plain text body
     */
    void sendSimpleEmail(String to, String subject, String body);

    /**
     * Send a simple email to multiple recipients.
     *
     * @param recipients List of recipient email addresses
     * @param subject    Email subject
     * @param body       Plain text body
     */
    void sendSimpleEmail(List<String> recipients, String subject, String body);

    /**
     * Send an HTML email using a Thymeleaf template.
     *
     * @param to           Recipient email address
     * @param subject      Email subject
     * @param templateName Template name (without .html extension)
     * @param variables    Template variables
     */
    void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables);

    /**
     * Send template email to multiple recipients.
     *
     * @param recipients   List of recipient email addresses
     * @param subject      Email subject
     * @param templateName Template name (without .html extension)
     * @param variables    Template variables
     */
    void sendTemplateEmail(List<String> recipients, String subject, String templateName, Map<String, Object> variables);

    // ==================== Project-Related Emails ====================

    /**
     * Send email when a project is registered.
     *
     * @param fypCommitteeEmails List of FYP committee member emails
     * @param projectTitle       Title of the registered project
     * @param groupName          Name of the group that registered
     * @param registeredBy       Name of the student who registered
     */
    void sendProjectRegisteredEmail(List<String> fypCommitteeEmails, String projectTitle, String groupName, String registeredBy);

    /**
     * Send email when a project is approved.
     *
     * @param studentEmails  List of group member emails
     * @param projectTitle   Title of the project
     * @param supervisorName Name of assigned supervisor
     */
    void sendProjectApprovedEmail(List<String> studentEmails, String projectTitle, String supervisorName);

    /**
     * Send email when a project is rejected.
     *
     * @param studentEmails   List of group member emails
     * @param projectTitle    Title of the project
     * @param rejectionReason Reason for rejection
     */
    void sendProjectRejectedEmail(List<String> studentEmails, String projectTitle, String rejectionReason);

    // ==================== Deadline-Related Emails ====================

    /**
     * Send email when a deadline is set.
     *
     * @param recipientEmails List of recipient emails (students/supervisors)
     * @param deadlineTitle   Title/name of the deadline
     * @param dueDate         Due date string
     * @param description     Description of what's due
     */
    void sendDeadlineSetEmail(List<String> recipientEmails, String deadlineTitle, String dueDate, String description);

    /**
     * Send email reminder before deadline.
     *
     * @param recipientEmails List of recipient emails
     * @param deadlineTitle   Title/name of the deadline
     * @param dueDate         Due date string
     * @param hoursRemaining  Hours remaining until deadline
     */
    void sendDeadlineReminderEmail(List<String> recipientEmails, String deadlineTitle, String dueDate, int hoursRemaining);

    // ==================== Submission-Related Emails ====================

    /**
     * Send email when a submission is uploaded.
     *
     * @param supervisorEmail Supervisor email
     * @param studentName     Name of student who submitted
     * @param projectTitle    Project title
     * @param submissionType  Type of submission (e.g., "Proposal", "Final Report")
     */
    void sendSubmissionUploadedEmail(String supervisorEmail, String studentName, String projectTitle, String submissionType);

    /**
     * Send email when supervisor requests revision.
     *
     * @param studentEmails  List of group member emails
     * @param projectTitle   Project title
     * @param submissionType Submission type
     * @param feedback       Revision feedback from supervisor
     */
    void sendRevisionRequestedEmail(List<String> studentEmails, String projectTitle, String submissionType, String feedback);

    /**
     * Send email when document is locked after deadline.
     *
     * @param studentEmails  List of group member emails
     * @param projectTitle   Project title
     * @param documentType   Type of document locked
     */
    void sendDocumentLockedEmail(List<String> studentEmails, String projectTitle, String documentType);

    // ==================== Evaluation-Related Emails ====================

    /**
     * Send email when evaluation is available.
     *
     * @param studentEmails  List of group member emails
     * @param projectTitle   Project title
     * @param evaluationType Type of evaluation (e.g., "Proposal Defense", "Final Defense")
     */
    void sendEvaluationAvailableEmail(List<String> studentEmails, String projectTitle, String evaluationType);

    /**
     * Send email when final result is released.
     *
     * @param studentEmails List of group member emails
     * @param projectTitle  Project title
     * @param result        Result status (e.g., "Passed", "Failed", "Distinction")
     */
    void sendFinalResultEmail(List<String> studentEmails, String projectTitle, String result);

    // ==================== Group-Related Emails ====================

    /**
     * Send email when user is invited to a group.
     *
     * @param inviteeEmail Invitee's email
     * @param groupName    Name of the group
     * @param inviterName  Name of person who sent invite
     */
    void sendGroupInviteEmail(String inviteeEmail, String groupName, String inviterName);

    /**
     * Send email when user joins a group.
     *
     * @param memberEmails   Existing member emails
     * @param newMemberName  Name of new member
     * @param groupName      Name of the group
     */
    void sendMemberJoinedEmail(List<String> memberEmails, String newMemberName, String groupName);
}
