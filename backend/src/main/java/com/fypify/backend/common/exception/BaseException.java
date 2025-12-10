package com.fypify.backend.common.exception;

/**
 * Base exception for all business logic exceptions in the application.
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
