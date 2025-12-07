package com.fypify.backend.exception;

/**
 * Invalid Token Exception
 * 
 * SOLID Principle: Single Responsibility
 * - Handles ONLY invalid token errors
 */
public class InvalidTokenException extends RuntimeException {
    
    public InvalidTokenException(String message) {
        super(message);
    }
    
    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
