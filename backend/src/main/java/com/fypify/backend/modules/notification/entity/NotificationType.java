package com.fypify.backend.modules.notification.entity;

/**
 * Enum representing the type of notification.
 */
public enum NotificationType {
    // Group related
    GROUP_INVITE_RECEIVED,
    GROUP_INVITE_ACCEPTED,
    GROUP_INVITE_DECLINED,
    GROUP_MEMBER_JOINED,
    GROUP_MEMBER_LEFT,
    GROUP_LEADER_CHANGED,

    // Project related
    PROJECT_REGISTERED,
    PROJECT_APPROVED,
    PROJECT_REJECTED,
    PROJECT_SUPERVISOR_ASSIGNED,

    // Submission related
    SUBMISSION_UPLOADED,
    SUBMISSION_REVISION_REQUESTED,
    SUBMISSION_APPROVED,
    SUBMISSION_LOCKED,

    // Evaluation related
    EVALUATION_STARTED,
    EVALUATION_FINALIZED,

    // Results related
    RESULT_RELEASED,

    // Deadline related
    DEADLINE_APPROACHING,
    DEADLINE_PASSED,

    // General
    SYSTEM_ANNOUNCEMENT,
    CUSTOM
}
