package com.fypify.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Standard API response wrapper for all endpoints.
 * Provides consistent response format across the application.
 *
 * @param <T> The type of data being returned
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. BUILDER PATTERN (Creational) - via Lombok @Builder
 *    - Enables fluent construction of ApiResponse objects.
 *    - Example: ApiResponse.<User>builder().success(true).data(user).build()
 * 
 * 2. FACTORY METHOD PATTERN (Creational) - Static Factory Methods
 *    - success(data), success(data, message), error(code, message) are factory methods.
 *    - Encapsulate object creation with descriptive, intention-revealing names.
 *    - Hide Builder complexity for common use cases.
 *    - Example: ApiResponse.success(data) vs ApiResponse.builder().success(true).data(data).build()
 * 
 * 3. GENERIC TYPE PATTERN (Language Feature, supports patterns)
 *    - Generic <T> allows type-safe responses for any data type.
 *    - Compile-time type checking prevents runtime errors.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. DECORATOR PATTERN (Structural) - Suggested for Response Enhancement
 *    - Create decorators for adding metadata: PaginatedApiResponse, CacheableApiResponse
 *    - Wrap base response with additional information without modifying it.
 * 
 * ===========================================================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private ApiError error;

    @Builder.Default
    private Instant timestamp = Instant.now();

    /**
     * Create a successful response with data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    /**
     * Create a successful response with data and message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    /**
     * Create a successful response with only a message (no data)
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    /**
     * Create an error response
     */
    public static <T> ApiResponse<T> error(ApiError error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .build();
    }

    /**
     * Create an error response with code and message
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ApiError.builder()
                        .code(code)
                        .message(message)
                        .build())
                .build();
    }
}
