package com.fypify.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when user doesn't have required permissions.
 * Results in HTTP 403 response.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends BaseException {

    public static final String ERROR_CODE = "FORBIDDEN";

    public ForbiddenException(String message) {
        super(ERROR_CODE, message);
    }

    public static ForbiddenException notGroupLeader() {
        return new ForbiddenException("Only group leader can perform this action");
    }

    public static ForbiddenException insufficientPermissions() {
        return new ForbiddenException("You don't have permission to perform this action");
    }
}
