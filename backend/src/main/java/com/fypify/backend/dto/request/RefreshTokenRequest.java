package com.fypify.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Refresh Token Request DTO
 * 
 * SOLID Principle: Single Responsibility Principle
 * - ONLY holds refresh token request data
 * 
 * Design Pattern: DTO Pattern
 * - Decouples API from domain
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
