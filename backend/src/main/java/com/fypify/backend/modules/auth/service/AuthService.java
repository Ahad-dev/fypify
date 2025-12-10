package com.fypify.backend.modules.auth.service;

import com.fypify.backend.common.exception.UnauthorizedException;
import com.fypify.backend.modules.auth.dto.LoginRequest;
import com.fypify.backend.modules.auth.dto.LoginResponse;
import com.fypify.backend.modules.user.dto.UserDto;
import com.fypify.backend.modules.user.entity.User;
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
import org.springframework.stereotype.Service;

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

            String jwt = tokenProvider.generateToken(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            User user = userService.findById(userPrincipal.getId());
            UserDto userDto = userService.toDto(user);

            log.info("User logged in successfully: {}", request.getEmail());

            return LoginResponse.of(jwt, tokenProvider.getJwtExpiration(), userDto);

        } catch (BadCredentialsException ex) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            throw UnauthorizedException.invalidCredentials();
        } catch (DisabledException ex) {
            log.warn("Login attempt for disabled account: {}", request.getEmail());
            throw UnauthorizedException.accountDisabled();
        }
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
