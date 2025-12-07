package com.fypify.backend.dto.request;

import com.fypify.backend.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create User Request DTO
 * 
 * SOLID Principles:
 * - Single Responsibility: Only represents user creation data
 * - Interface Segregation: Only contains fields needed for creation
 * 
 * Design Pattern: DTO (Data Transfer Object) Pattern
 * - Transfers data between layers
 * - Decouples API contract from domain model
 * - Enables validation at API boundary
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for creating a new user")
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Full name of the user", example = "John Doe", required = true)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(description = "Email address (must be unique)", example = "john.doe@fypify.com", required = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    @Schema(description = "User password (min 6 characters)", example = "password123", required = true)
    private String password;

    @NotNull(message = "Role is required")
    @Schema(description = "User role", example = "STUDENT", required = true, allowableValues = {"STUDENT", "SUPERVISOR", "EVALUATOR", "COMMITTEE", "ADMIN"})
    private Role role;

    @Builder.Default
    @Schema(description = "Account active status", example = "true", defaultValue = "true")
    private Boolean isActive = true;
}
