package com.fypify.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update User Request DTO
 * 
 * SOLID Principles:
 * - Single Responsibility: Only represents user update data
 * - Interface Segregation: Only contains fields that can be updated
 * 
 * Design Pattern: DTO (Data Transfer Object) Pattern
 * - Transfers data between layers
 * - Decouples API contract from domain model
 * - Enables validation at API boundary
 * 
 * Note: All fields are optional for partial updates (PATCH semantics)
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for updating an existing user. All fields are optional for partial updates.")
public class UpdateUserRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Full name of the user", example = "John Doe Updated")
    private String name;

    @Email(message = "Email must be valid")
    @Schema(description = "Email address (must be unique if changed)", example = "john.updated@fypify.com")
    private String email;

    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    @Schema(description = "New password (min 6 characters)", example = "newpassword123")
    private String password;

    @Schema(description = "Account active status", example = "true")
    private Boolean isActive;
}
