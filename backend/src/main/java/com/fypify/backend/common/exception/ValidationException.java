package com.fypify.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when request validation fails.
 * Results in HTTP 400 response.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends BaseException {

    public static final String ERROR_CODE = "VALIDATION_ERROR";

    public ValidationException(String message) {
        super(ERROR_CODE, message);
    }
}
