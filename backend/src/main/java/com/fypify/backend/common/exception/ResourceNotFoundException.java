package com.fypify.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested resource is not found.
 * Results in HTTP 404 response.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends BaseException {

    public static final String ERROR_CODE = "NOT_FOUND";

    public ResourceNotFoundException(String message) {
        super(ERROR_CODE, message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(ERROR_CODE, String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
