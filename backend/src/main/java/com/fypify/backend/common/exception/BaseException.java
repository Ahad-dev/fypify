package com.fypify.backend.common.exception;

/**
 * Base exception for all business logic exceptions in the application.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. TEMPLATE METHOD PATTERN (Behavioral) - Abstract Base Class
 *    - This abstract class defines the template for all custom exceptions.
 *    - Provides common structure: errorCode + message.
 *    - Concrete exceptions (ResourceNotFoundException, ValidationException) extend this.
 * 
 * 2. FACTORY METHOD PATTERN (Creational) - Static Factory Methods in Subclasses
 *    - Subclasses use static factory methods for common error cases.
 *    - Example: UnauthorizedException.invalidCredentials()
 *    - Encapsulates exception creation with descriptive names.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. PROTOTYPE PATTERN (Creational) - Suggested for Exception Templates
 *    - Create exception prototypes that can be cloned and customized.
 *    - Useful for frequently occurring exception patterns.
 * 
 * 2. BUILDER PATTERN (Creational) - Suggested for Complex Exceptions
 *    - For exceptions with many fields (code, message, details, cause, httpStatus):
 *      throw BusinessException.builder()
 *          .code("GROUP_FULL")
 *          .message("Group has reached maximum capacity")
 *          .detail("maxSize", 4)
 *          .httpStatus(BAD_REQUEST)
 *          .build();
 * 
 * ===========================================================================================
 */
public abstract class BaseException extends RuntimeException {

    private final String errorCode;

    protected BaseException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    protected BaseException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
