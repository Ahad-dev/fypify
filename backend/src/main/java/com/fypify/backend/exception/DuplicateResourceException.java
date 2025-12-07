package com.fypify.backend.exception;

/**
 * Duplicate Resource Exception
 * 
 * Thrown when attempting to create a resource that already exists (e.g., duplicate email).
 * 
 * Design Pattern: Exception Hierarchy Pattern
 * - Extends RuntimeException for unchecked exception handling
 * - Specific exception for duplicate resource scenarios
 * 
 * SOLID Principles:
 * - Single Responsibility Principle: Only represents "duplicate" errors
 * - Open/Closed Principle: Can be extended for specific duplicate types
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
public class DuplicateResourceException extends RuntimeException {

    /**
     * Constructor with message
     * 
     * @param message error message
     */
    public DuplicateResourceException(String message) {
        super(message);
    }

    /**
     * Constructor with resource type and field
     * 
     * @param resourceType type of resource (e.g., "User", "Project")
     * @param fieldName field name that is duplicate (e.g., "email")
     * @param fieldValue duplicate field value
     */
    public DuplicateResourceException(String resourceType, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s: %s", resourceType, fieldName, fieldValue));
    }

    /**
     * Constructor with message and cause
     * 
     * @param message error message
     * @param cause underlying cause
     */
    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
