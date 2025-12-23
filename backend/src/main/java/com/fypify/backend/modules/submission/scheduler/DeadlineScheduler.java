package com.fypify.backend.modules.submission.scheduler;

import com.fypify.backend.modules.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for processing document submission deadlines.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. OBSERVER PATTERN (Behavioral) - Scheduled Event Handler
 *    - Acts as a time-based observer that triggers actions when deadlines pass.
 *    - Spring's @Scheduled is the event source, this component is the observer.
 * 
 * 2. SINGLETON PATTERN (Creational) - via Spring @Component
 *    - Single scheduler instance manages all deadline processing.
 * 
 * ===========================================================================================
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeadlineScheduler {

    private final SubmissionService submissionService;

    /**
     * Process passed deadlines and lock submissions.
     * Runs every 15 minutes to check for deadlines that have passed.
     * 
     * Workflow:
     * 1. Find all deadlines that have passed
     * 2. For each deadline, find the most recent submission
     * 3. Lock the submission for evaluation
     * 4. Notify Evaluation Committee via email and in-app notification
     * 
     * Cron: "0 0/15 * * * ?" = Every 15 minutes
     */
    @Scheduled(cron = "0 0/15 * * * ?")
    public void processPassedDeadlines() {
        log.debug("Starting deadline processing job...");
        
        try {
            int lockedCount = submissionService.processPassedDeadlines();
            
            if (lockedCount > 0) {
                log.info("Deadline processing completed: {} submissions locked", lockedCount);
            } else {
                log.debug("Deadline processing completed: no new submissions to lock");
            }
        } catch (Exception e) {
            log.error("Error processing deadlines: {}", e.getMessage(), e);
        }
    }

    /**
     * Send deadline reminder notifications.
     * Runs every hour to check for upcoming deadlines (within 24/48/72 hours).
     * 
     * Cron: "0 0 * * * ?" = Every hour at minute 0
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void sendDeadlineReminders() {
        log.debug("Starting deadline reminder job...");
        
        // TODO: Implement deadline reminder logic
        // - Find deadlines approaching within 24, 48, 72 hours
        // - For each, check if reminder was already sent
        // - Send reminder notification and email to group members
        
        log.debug("Deadline reminder job completed");
    }
}

