package com.fypify.backend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Utility Service
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles JWT token operations
 *    - Token generation, validation, parsing
 *    - No business logic or authentication logic
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Open for extension (can add new token types)
 *    - Closed for modification (core logic stable)
 * 
 * 3. Dependency Inversion Principle (DIP):
 *    - Depends on Spring's @Value (abstraction)
 *    - Can be easily tested with different configs
 * 
 * Design Pattern: Strategy Pattern
 * - Different token generation strategies for access and refresh tokens
 * - generateToken() method is the strategy interface
 * - Access and refresh tokens use different expiration times
 * 
 * Best Practices:
 * - Uses HMAC SHA-512 for signing
 * - Proper exception handling
 * - Logging for security auditing
 * - Immutable secret key
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh.expiration}")
    private Long refreshTokenExpiration;

    /**
     * Get signing key from secret
     * Best Practice: Uses secure HMAC SHA-512
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate Access Token
     * Strategy Pattern: Access token generation strategy
     * 
     * @param email user email
     * @param role user role
     * @param userId user ID
     * @return JWT access token
     */
    public String generateAccessToken(String email, String role, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);
        claims.put("tokenType", TokenType.ACCESS.getType());
        
        log.debug("Generating access token for user: {}", email);
        return generateToken(claims, email, accessTokenExpiration);
    }

    /**
     * Generate Refresh Token
     * Strategy Pattern: Refresh token generation strategy
     * 
     * @param email user email
     * @param userId user ID
     * @return JWT refresh token
     */
    public String generateRefreshToken(String email, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("tokenType", TokenType.REFRESH.getType());
        
        log.debug("Generating refresh token for user: {}", email);
        return generateToken(claims, email, refreshTokenExpiration);
    }

    /**
     * Core token generation method
     * Template for all token types
     * 
     * @param claims additional claims
     * @param subject token subject (email)
     * @param expiration expiration time in ms
     * @return JWT token string
     */
    private String generateToken(Map<String, Object> claims, String subject, Long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract username (email) from token
     * 
     * @param token JWT token
     * @return username/email
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract user ID from token
     * 
     * @param token JWT token
     * @return user ID
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extract user role from token
     * 
     * @param token JWT token
     * @return user role
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Extract token type (access or refresh)
     * 
     * @param token JWT token
     * @return token type
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", String.class));
    }

    /**
     * Extract expiration date from token
     * 
     * @param token JWT token
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic claim extraction method
     * 
     * @param token JWT token
     * @param claimsResolver function to extract specific claim
     * @param <T> claim type
     * @return extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from token
     * 
     * @param token JWT token
     * @return all claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate token
     * Checks if token belongs to user and is not expired
     * 
     * @param token JWT token
     * @param username username to validate against
     * @return true if valid, false otherwise
     */
    public Boolean validateToken(String token, String username) {
        try {
            final String tokenUsername = extractUsername(token);
            boolean isValid = tokenUsername.equals(username) && !isTokenExpired(token);
            
            if (isValid) {
                log.debug("Token validated successfully for user: {}", username);
            } else {
                log.warn("Token validation failed for user: {}", username);
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate access token
     * Additional check for token type
     * 
     * @param token JWT token
     * @param username username to validate against
     * @return true if valid access token, false otherwise
     */
    public Boolean validateAccessToken(String token, String username) {
        try {
            String tokenType = extractTokenType(token);
            return TokenType.ACCESS.getType().equals(tokenType) 
                   && validateToken(token, username);
        } catch (Exception e) {
            log.error("Access token validation error: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate refresh token
     * Additional check for token type
     * 
     * @param token JWT token
     * @param username username to validate against
     * @return true if valid refresh token, false otherwise
     */
    public Boolean validateRefreshToken(String token, String username) {
        try {
            String tokenType = extractTokenType(token);
            return TokenType.REFRESH.getType().equals(tokenType) 
                   && validateToken(token, username);
        } catch (Exception e) {
            log.error("Refresh token validation error: {}", e.getMessage());
            return false;
        }
    }
}
