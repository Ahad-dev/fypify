package com.fypify.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when there's a resource conflict (e.g., duplicate entry).
 * Results in HTTP 409 response.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends BaseException {

    public static final String ERROR_CODE = "CONFLICT";

    public ConflictException(String message) {
        super(ERROR_CODE, message);
    }

    public static ConflictException duplicateResource(String resourceName, String fieldName, Object fieldValue) {
        return new ConflictException(
                String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue)
        );
    }
}
