package com.fypify.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a business rule is violated.
 * Results in HTTP 400 response.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BusinessRuleException extends BaseException {

    public BusinessRuleException(String errorCode, String message) {
        super(errorCode, message);
    }

    // Pre-defined business rule exceptions

    public static BusinessRuleException deadlinePassed() {
        return new BusinessRuleException("DEADLINE_PASSED", "Deadline has already passed");
    }

    public static BusinessRuleException resultsNotReleased() {
        return new BusinessRuleException("RESULTS_NOT_RELEASED", "Results have not been released yet");
    }

    public static BusinessRuleException invalidWeights() {
        return new BusinessRuleException("INVALID_WEIGHTS", "Document weights must sum to 100");
    }

    public static BusinessRuleException committeeMinSize() {
        return new BusinessRuleException("COMMITTEE_MIN_SIZE", "Committee must have at least 1 member");
    }

    public static BusinessRuleException groupSizeViolation(int min, int max) {
        return new BusinessRuleException("GROUP_SIZE_VIOLATION",
                String.format("Group size must be between %d and %d members", min, max));
    }

    public static BusinessRuleException alreadyInGroup() {
        return new BusinessRuleException("ALREADY_IN_GROUP", "Student is already a member of another group");
    }

    public static BusinessRuleException submissionLocked() {
        return new BusinessRuleException("SUBMISSION_LOCKED", "Submission is locked and cannot be modified");
    }
}
