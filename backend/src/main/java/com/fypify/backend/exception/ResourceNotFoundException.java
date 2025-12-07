package com.fypify.backend.exception;

/**
 * Resource Not Found Exception
 * 
 * Thrown when a requested resource (e.g., User, Project) is not found in the database.
 * 
 * Design Pattern: Exception Hierarchy Pattern
 * - Extends RuntimeException for unchecked exception handling
 * - Specific exception for resource not found scenarios
 * - Better than generic exceptions
 * 
 * SOLID Principles:
 * - Single Responsibility Principle: Only represents "not found" errors
 * - Open/Closed Principle: Can be extended for specific resource types
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructor with message
     * 
     * @param message error message
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor with resource type and ID
     * 
     * @param resourceType type of resource (e.g., "User", "Project")
     * @param fieldName field name used for lookup (e.g., "id", "email")
     * @param fieldValue field value
     */
    public ResourceNotFoundException(String resourceType, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: %s", resourceType, fieldName, fieldValue));
    }

    /**
     * Constructor with message and cause
     * 
     * @param message error message
     * @param cause underlying cause
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
