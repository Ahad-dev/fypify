package com.fypify.backend.exception;

/**
 * Custom Authentication Exception
 * 
 * SOLID Principle: Single Responsibility Principle
 * - Represents ONLY authentication failures
 * 
 * Best Practice:
 * - Custom exception for specific error handling
 * - Meaningful error messages
 */
public class AuthenticationException extends RuntimeException {
    
    public AuthenticationException(String message) {
        super(message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
