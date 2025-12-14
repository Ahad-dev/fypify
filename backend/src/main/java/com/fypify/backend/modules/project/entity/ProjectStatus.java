package com.fypify.backend.modules.project.entity;

/**
 * Enum representing the status of a project.
 */
public enum ProjectStatus {
    /**
     * Project is awaiting approval from FYP Committee.
     */
    PENDING_APPROVAL,

    /**
     * Project has been approved by FYP Committee.
     */
    APPROVED,

    /**
     * Project has been rejected by FYP Committee.
     */
    REJECTED,

    /**
     * Project is currently in progress.
     */
    IN_PROGRESS,

    /**
     * Project has been completed.
     */
    COMPLETED,

    /**
     * Project has been archived.
     */
    ARCHIVED
}
