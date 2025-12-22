package com.fypify.backend.modules.submission.entity;

/**
 * Enum representing the status of a document submission.
 */
public enum SubmissionStatus {
    
    /**
     * Submission uploaded, pending supervisor review.
     */
    PENDING_SUPERVISOR,
    
    /**
     * Supervisor requested revisions.
     */
    REVISION_REQUESTED,
    
    /**
     * Approved by supervisor, available for committee evaluation.
     */
    APPROVED_BY_SUPERVISOR,
    
    /**
     * Locked for evaluation (deadline passed or manually locked).
     */
    LOCKED_FOR_EVAL,
    
    /**
     * Evaluation in progress by committee.
     */
    EVAL_IN_PROGRESS,
    
    /**
     * Evaluation finalized.
     */
    EVAL_FINALIZED
}

