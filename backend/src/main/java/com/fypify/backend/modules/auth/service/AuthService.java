package com.fypify.backend.modules.auth.service;

import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.UnauthorizedException;
import com.fypify.backend.common.exception.ValidationException;
import com.fypify.backend.modules.auth.dto.ChangePasswordRequest;
import com.fypify.backend.modules.auth.dto.LoginRequest;
import com.fypify.backend.modules.auth.dto.LoginResponse;
import com.fypify.backend.modules.auth.dto.RegisterRequest;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for authentication operations.
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
}
