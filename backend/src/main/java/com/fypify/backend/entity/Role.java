package com.fypify.backend.entity;

/**
 * User Role Enum
 * 
 * SOLID Principle: Interface Segregation Principle (ISP)
 * - Each role has specific permissions
 * - Roles are clearly separated
 * 
 * Design Pattern: Enum Pattern
 * - Type-safe role definition
 * - Prevents invalid role values
 */
public enum Role {
    STUDENT("Student - Can submit projects and view results"),
    SUPERVISOR("Supervisor - Can review and approve submissions"),
    EVALUATOR("Evaluator - Can grade submissions using rubrics"),
    COMMITTEE("FYP Committee - Can manage system-wide operations"),
    ADMIN("System Administrator - Full system access");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if role has admin privileges
     */
    public boolean isAdmin() {
        return this == ADMIN || this == COMMITTEE;
    }

    /**
     * Check if role can review submissions
     */
    public boolean canReview() {
        return this == SUPERVISOR || this == EVALUATOR || this == COMMITTEE;
    }

    /**
     * Check if role can submit projects
     */
    public boolean canSubmit() {
        return this == STUDENT;
    }
}
