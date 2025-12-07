package com.fypify.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Standard API Error Response
 * Follows FYPIFY API error format
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private boolean success = false;
    private ErrorDetail error;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        private String code;
        private String message;
        private Map<String, String> details;

        public ErrorDetail(String code, String message) {
            this.code = code;
            this.message = message;
            this.details = null;
        }
    }

    /**
     * Create error response
     */
    public static ErrorResponse create(String code, String message) {
        return new ErrorResponse(false, new ErrorDetail(code, message));
    }

    /**
     * Create error response with details
     */
    public static ErrorResponse create(String code, String message, Map<String, String> details) {
        return new ErrorResponse(false, new ErrorDetail(code, message, details));
    }
}
