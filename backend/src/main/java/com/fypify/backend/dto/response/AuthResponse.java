package com.fypify.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Authentication Response DTO
 * 
 * SOLID Principles:
 * - Single Responsibility: Only holds auth response data
 * - Open/Closed: Can add new fields without breaking existing code
 * 
 * Design Pattern: Builder Pattern
 * - Fluent object creation
 * - Optional fields handling
 * 
 * Contains:
 * - Access token (short-lived, 15 minutes)
 * - Refresh token (long-lived, 7 days)
 * - User information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn; // Access token expiration in seconds
    
    // User information
    private UUID userId;
    private String name;
    private String email;
    private String role;
}
