package com.fypify.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Error details for API responses.
 * Contains error code, message, and optional field-level validation errors.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    /**
     * Error code for client-side handling (e.g., "VALIDATION_ERROR", "NOT_FOUND")
     */
    private String code;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * Field-level validation errors (field name -> error message)
     */
    private Map<String, String> details;
}
