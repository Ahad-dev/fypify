package com.fypify.backend.security.jwt;

/**
 * Token Type Enum
 * 
 * SOLID Principle: Interface Segregation Principle
 * - Separate token types with different purposes
 * 
 * Design Pattern: Strategy Pattern Foundation
 * - Different strategies for access and refresh tokens
 * - Different expiration times
 * - Different use cases
 */
public enum TokenType {
    ACCESS("access", "Short-lived token for API access"),
    REFRESH("refresh", "Long-lived token for obtaining new access tokens");

    private final String type;
    private final String description;

    TokenType(String type, String description) {
        this.type = type;
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }
}
