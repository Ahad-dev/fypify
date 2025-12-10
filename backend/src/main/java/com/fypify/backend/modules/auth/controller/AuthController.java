package com.fypify.backend.modules.auth.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.auth.dto.LoginRequest;
import com.fypify.backend.modules.auth.dto.LoginResponse;
import com.fypify.backend.modules.auth.service.AuthService;
import com.fypify.backend.modules.user.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;

    /**
     * Login endpoint.
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Logged in successfully"));
    }

    /**
     * Get current authenticated user.
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        UserDto user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * Logout endpoint (client-side token removal).
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user (client should discard token)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT is stateless, so logout is handled client-side by removing the token
        // This endpoint is for API consistency and future token blacklist implementation
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
