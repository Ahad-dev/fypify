package com.fypify.backend.modules.auth.service;

import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.UnauthorizedException;
import com.fypify.backend.common.exception.ValidationException;
import com.fypify.backend.modules.auth.dto.ChangePasswordRequest;
import com.fypify.backend.modules.auth.dto.ForgotPasswordRequest;
import com.fypify.backend.modules.auth.dto.LoginRequest;
import com.fypify.backend.modules.auth.dto.LoginResponse;
import com.fypify.backend.modules.auth.dto.RegisterRequest;
import com.fypify.backend.modules.auth.dto.ResetPasswordRequest;
import com.fypify.backend.modules.email.service.EmailService;
import com.fypify.backend.modules.user.dto.UserDto;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.RoleRepository;
import com.fypify.backend.modules.user.repository.UserRepository;
import com.fypify.backend.modules.user.service.UserService;
import com.fypify.backend.security.UserPrincipal;
import com.fypify.backend.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;


/**
 * Service for authentication operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural)
 *    - This service acts as a FACADE over authentication subsystem complexity.
 *    - Hides: AuthenticationManager, JwtTokenProvider, UserRepository, PasswordEncoder
 *    - Clients (AuthController) interact with simple methods: login(), register(), refreshToken()
 * 
 * 2. SINGLETON PATTERN (Creational) - via Spring @Service
 *    - Single instance manages all authentication operations.
 *    - Stateless design ensures thread safety.
 * 
 * 3. BUILDER PATTERN (Creational) - via Lombok and LoginResponse.of()
 *    - User.builder() for creating user entities.
 *    - LoginResponse.of() is a static factory method (related to Builder).
 * 
 * 4. STRATEGY PATTERN (Behavioral) - AuthenticationManager
 *    - AuthenticationManager uses strategy pattern internally.
 *    - Different AuthenticationProvider strategies can be plugged in.
 *    - DaoAuthenticationProvider is the current strategy for database authentication.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. FACTORY METHOD PATTERN (Creational) - Suggested for Token Generation
 *    - Create TokenFactory interface for generating different token types.
 *    - Implementations: JwtTokenFactory, OAuth2TokenFactory, etc.
 *    - Benefit: Easy to swap token generation strategies.
 * 
 * 2. TEMPLATE METHOD PATTERN (Behavioral) - Suggested for Auth Flow
 *    - Common auth flow: Validate → Authenticate → GenerateTokens → BuildResponse
 *    - Template method defines skeleton, subclasses customize steps.
 * 
 * 3. OBSERVER PATTERN (Behavioral) - Suggested for Auth Events
 *    - Publish events: LoginSuccessEvent, LoginFailedEvent, RegistrationEvent
 *    - Listeners can handle: audit logging, rate limiting, notifications
 * 
 * ===========================================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;


    /**
     * Authenticate user and return JWT token.
     */
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            String accessToken = tokenProvider.generateAccessToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal.getId());

            User user = userService.findById(userPrincipal.getId());
            UserDto userDto = userService.toDto(user);

            log.info("User logged in successfully: {}", request.getEmail());

            return LoginResponse.of(accessToken, refreshToken, tokenProvider.getAccessTokenExpiration(), userDto);

        } catch (BadCredentialsException ex) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            throw UnauthorizedException.invalidCredentials();
        } catch (DisabledException ex) {
            log.warn("Login attempt for disabled account: {}", request.getEmail());
            throw UnauthorizedException.accountDisabled();
        }
    }

    /**
     * Register a new user.
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        // Find role
        Role role = roleRepository.findByName(request.getRole().toUpperCase())
                .orElseThrow(() -> new ValidationException("Invalid role: " + request.getRole()));

        // Create user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        log.info("User registered successfully: {}", request.getEmail());

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), role.getName());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        UserDto userDto = userService.toDto(user);

        return LoginResponse.of(accessToken, refreshToken, tokenProvider.getAccessTokenExpiration(), userDto);
    }

    /**
     * Refresh access token using refresh token.
     */
    public LoginResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw UnauthorizedException.invalidToken();
        }

        if (!tokenProvider.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        UUID userId = tokenProvider.getUserIdFromJwt(refreshToken);
        User user = userService.findById(userId);

        if (!user.getIsActive()) {
            throw UnauthorizedException.accountDisabled();
        }

        String newAccessToken = tokenProvider.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
        );
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        UserDto userDto = userService.toDto(user);

        log.info("Token refreshed for user: {}", user.getEmail());

        return LoginResponse.of(newAccessToken, newRefreshToken, tokenProvider.getAccessTokenExpiration(), userDto);
    }

    /**
     * Change user password.
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UUID userId = getCurrentUserId();
        User user = userService.findById(userId);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
    }

    /**
     * Get current authenticated user.
     */
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw UnauthorizedException.invalidToken();
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.findById(userPrincipal.getId());
        
        return userService.toDto(user);
    }

    /**
     * Get current authenticated user ID.
     */
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw UnauthorizedException.invalidToken();
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userPrincipal.getId();
    }

    // ==================== Password Reset Methods ====================

    /**
     * Request password reset - sends email with reset link.
     * Always returns success to prevent email enumeration.
     * Admin users are excluded from password reset.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase();
        
        // Find user but don't reveal if they exist
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Don't reveal that user doesn't exist - just log and return
            log.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();

        // Admin users cannot use password reset
        if ("ADMIN".equals(user.getRole().getName())) {
            log.warn("Password reset attempted for admin account: {}", email);
            return;
        }

        // Check if user is active
        if (!user.getIsActive()) {
            log.info("Password reset requested for disabled account: {}", email);
            return;
        }

        // Generate reset token
        String resetToken = tokenProvider.generatePasswordResetToken(user.getId(), email);
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        // Send email asynchronously
        emailService.sendPasswordResetEmail(email, resetLink, user.getFullName());

        log.info("Password reset email sent to: {}", email);
    }

    /**
     * Reset password using token.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();

        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // Validate token
        if (!tokenProvider.validatePasswordResetToken(token)) {
            throw new UnauthorizedException("Invalid or expired reset token");
        }

        // Get user from token
        UUID userId = tokenProvider.getUserIdFromPasswordResetToken(token);
        User user = userService.findById(userId);

        // Verify email matches (extra security check)
        String tokenEmail = tokenProvider.getEmailFromPasswordResetToken(token);
        if (!user.getEmail().equalsIgnoreCase(tokenEmail)) {
            log.error("Token email mismatch for user: {}", userId);
            throw new UnauthorizedException("Invalid reset token");
        }

        // Admin users cannot use password reset
        if ("ADMIN".equals(user.getRole().getName())) {
            throw new UnauthorizedException("Password reset not available for this account type");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }
}

