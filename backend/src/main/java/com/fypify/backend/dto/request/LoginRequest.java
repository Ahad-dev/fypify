package com.fypify.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login Request DTO
 * 
 * SOLID Principle: Single Responsibility Principle
 * - ONLY holds login request data
 * - No business logic
 * 
 * Design Pattern: DTO Pattern
 * - Data Transfer Object for login requests
 * - Decouples API layer from domain layer
 * 
 * Best Practice:
 * - Bean validation for input validation
 * - Immutable through builder pattern
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
