package com.fypify.backend.service;

import com.fypify.backend.dto.request.LoginRequest;
import com.fypify.backend.dto.request.RefreshTokenRequest;
import com.fypify.backend.dto.response.AuthResponse;
import com.fypify.backend.entity.User;
import com.fypify.backend.exception.AuthenticationException;
import com.fypify.backend.exception.InvalidTokenException;
import com.fypify.backend.repository.UserRepository;
import com.fypify.backend.security.jwt.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication Service
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles authentication operations
 *    - Login, token refresh, token validation
 *    - No user management or other business logic
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on UserRepository interface (abstraction)
 *    - Depends on PasswordEncoder interface (abstraction)
 *    - Depends on JwtUtil (component, not implementation)
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Can extend with new auth methods (OAuth, etc.) without modification
 * 
 * Design Pattern: Facade Pattern
 * - Simplifies complex authentication process
 * - Hides complexity of:
 *   * User validation
 *   * Password verification
 *   * Token generation (access + refresh)
 *   * Token validation
 * - Provides simple interface: login(), refreshToken()
 * 
 * Benefits of Facade Pattern:
 * - Controllers don't need to know about JWT, password encoding, etc.
 * - Single point of authentication logic
 * - Easy to test
 * - Easy to modify authentication flow
 * 
 * Best Practices:
 * - Constructor injection (immutable dependencies)
 * - Logging for security auditing
 * - Proper exception handling
 * - Don't expose sensitive information in errors
 */
@Slf4j
@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Constructor Injection (DIP - Dependency Inversion Principle)
     * 
     * @param userRepository user repository
     * @param passwordEncoder password encoder
     * @param jwtUtil JWT utility
     */
    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Authenticate user and generate tokens
     * Facade method that simplifies authentication
     * 
     * Steps:
     * 1. Validate user credentials
     * 2. Generate access token (15 min)
     * 3. Generate refresh token (7 days)
     * 4. Build response
     * 
     * @param loginRequest login credentials
     * @return AuthResponse with access and refresh tokens
     * @throws AuthenticationException if credentials are invalid
     */
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getEmail());

        // 1. Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - {}", loginRequest.getEmail());
                    return new AuthenticationException("Invalid email or password");
                });

        // 2. Check if user is active
        if (!user.getIsActive()) {
            log.warn("Login failed: User is inactive - {}", loginRequest.getEmail());
            throw new AuthenticationException("Account is inactive. Please contact administrator.");
        }

        // 3. Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user - {}", loginRequest.getEmail());
            throw new AuthenticationException("Invalid email or password");
        }

        // 4. Generate tokens (Strategy Pattern - different strategies for access and refresh)
        String accessToken = jwtUtil.generateAccessToken(
            user.getEmail(), 
            user.getRole().name(), 
            user.getId()
        );
        
        String refreshToken = jwtUtil.generateRefreshToken(
            user.getEmail(), 
            user.getId()
        );

        log.info("Login successful for user: {}", user.getEmail());

        // 5. Build response (Builder Pattern)
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900L) // 15 minutes in seconds
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Refresh access token using refresh token
     * Facade method for token refresh
     * 
     * Steps:
     * 1. Validate refresh token
     * 2. Extract user info
     * 3. Generate new access token
     * 4. Return new tokens (optionally rotate refresh token)
     * 
     * @param refreshTokenRequest refresh token request
     * @return AuthResponse with new access token
     * @throws InvalidTokenException if refresh token is invalid
     */
    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        
        log.info("Token refresh attempt");

        try {
            // 1. Extract username from refresh token
            String email = jwtUtil.extractUsername(refreshToken);
            
            // 2. Find user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

            // 3. Validate refresh token
            if (!jwtUtil.validateRefreshToken(refreshToken, user.getEmail())) {
                log.warn("Invalid refresh token for user: {}", email);
                throw new InvalidTokenException("Invalid or expired refresh token");
            }

            // 4. Check if user is active
            if (!user.getIsActive()) {
                log.warn("Token refresh failed: User is inactive - {}", email);
                throw new AuthenticationException("Account is inactive");
            }

            // 5. Generate new access token
            String newAccessToken = jwtUtil.generateAccessToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
            );

            // Optional: Rotate refresh token (generate new one)
            String newRefreshToken = jwtUtil.generateRefreshToken(
                user.getEmail(),
                user.getId()
            );

            log.info("Token refreshed successfully for user: {}", email);

            // 6. Build response
            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken) // Send new refresh token (rotation)
                    .tokenType("Bearer")
                    .expiresIn(900L) // 15 minutes
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new InvalidTokenException("Invalid or expired refresh token");
        }
    }

    /**
     * Validate access token
     * Used by security filter
     * 
     * @param token access token
     * @return User if valid
     * @throws InvalidTokenException if token is invalid
     */
    public User validateAccessToken(String token) {
        try {
            String email = jwtUtil.extractUsername(token);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidTokenException("Invalid token"));

            if (!jwtUtil.validateAccessToken(token, user.getEmail())) {
                throw new InvalidTokenException("Invalid or expired access token");
            }

            if (!user.getIsActive()) {
                throw new InvalidTokenException("Account is inactive");
            }

            return user;
            
        } catch (Exception e) {
            throw new InvalidTokenException("Invalid token: " + e.getMessage());
        }
    }
}
