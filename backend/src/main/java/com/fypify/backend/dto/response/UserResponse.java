package com.fypify.backend.dto.response;

import com.fypify.backend.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User Response DTO
 * 
 * SOLID Principles:
 * - Single Responsibility: Only represents user data in API responses
 * - Interface Segregation: Contains all user information needed by clients
 * 
 * Design Pattern: DTO (Data Transfer Object) Pattern
 * - Transfers data between layers
 * - Hides sensitive information (e.g., password hash)
 * - Decouples API response from domain model
 * - Prevents over-fetching/under-fetching
 * 
 * Security Note:
 * - Does NOT include password or sensitive fields
 * - Safe to expose in API responses
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User information returned in API responses")
public class UserResponse {

    @Schema(description = "User ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Full name", example = "John Doe")
    private String name;

    @Schema(description = "Email address", example = "john.doe@fypify.com")
    private String email;

    @Schema(description = "User role", example = "STUDENT")
    private Role role;

    @Schema(description = "Account active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Account creation timestamp", example = "2025-12-07T15:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp", example = "2025-12-07T16:45:00")
    private LocalDateTime updatedAt;
}
