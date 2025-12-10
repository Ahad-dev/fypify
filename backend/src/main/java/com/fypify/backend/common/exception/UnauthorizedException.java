package com.fypify.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when authentication fails.
 * Results in HTTP 401 response.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends BaseException {

    public static final String ERROR_CODE = "UNAUTHORIZED";

    public UnauthorizedException(String message) {
        super(ERROR_CODE, message);
    }

    public static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException("Invalid email or password");
    }

    public static UnauthorizedException invalidToken() {
        return new UnauthorizedException("Invalid or expired token");
    }

    public static UnauthorizedException accountDisabled() {
        return new UnauthorizedException("Account is disabled");
    }
}
