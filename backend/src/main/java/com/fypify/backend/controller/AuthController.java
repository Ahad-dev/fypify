package com.fypify.backend.controller;

import com.fypify.backend.dto.request.LoginRequest;
import com.fypify.backend.dto.request.RefreshTokenRequest;
import com.fypify.backend.dto.ApiResponse;
import com.fypify.backend.dto.response.AuthResponse;
import com.fypify.backend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles HTTP authentication requests
 *    - No business logic (delegated to AuthenticationService)
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on AuthenticationService (abstraction)
 *    - Not coupled to implementation details
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Can add new auth endpoints without modifying existing ones
 * 
 * Design Pattern: Facade Pattern (Delegation)
 * - Controller is thin layer
 * - Delegates all logic to AuthenticationService (Facade)
 * - Only handles:
 *   * HTTP request/response mapping
 *   * Validation
 *   * Response formatting
 * 
 * REST API Design:
 * - POST /api/auth/login - User login
 * - POST /api/auth/refresh - Refresh access token
 * 
 * Best Practices:
 * - @Valid for automatic validation
 * - Consistent response format (ApiResponse)
 * - Proper HTTP status codes
 * - Logging for security auditing
 * - CORS friendly
 * - OpenAPI documentation for Swagger UI
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@Tag(
    name = "Authentication", 
    description = "Authentication endpoints for login and token refresh. All authentication endpoints are public and do not require a Bearer token."
)
public class AuthController {

    private final AuthenticationService authenticationService;

    /**
     * Constructor Injection (DIP)
     * 
     * @param authenticationService authentication service
     */
    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * User login endpoint
     * 
     * POST /api/auth/login
     * 
     * Request Body:
     * {
     *   "email": "admin@fypify.com",
     *   "password": "admin123"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "accessToken": "eyJhbGc...",
     *     "refreshToken": "eyJhbGc...",
     *     "tokenType": "Bearer",
     *     "expiresIn": 900,
     *     "userId": 1,
     *     "name": "Admin User",
     *     "email": "admin@fypify.com",
     *     "role": "ADMIN"
     *   },
     *   "error": null
     * }
     * 
     * @param loginRequest login credentials
     * @return AuthResponse with tokens and user info
     */
    @PostMapping("/login")
    @Operation(
        summary = "User Login",
        description = "Authenticate user with email and password. Returns JWT access token (15 min) and refresh token (7 days).",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Login credentials",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginRequest.class),
                examples = {
                    @ExampleObject(
                        name = "Admin Login",
                        summary = "Login as Admin",
                        value = """
                            {
                              "email": "admin@fypify.com",
                              "password": "admin123"
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "Student Login",
                        summary = "Login as Student",
                        value = """
                            {
                              "email": "student@fypify.com",
                              "password": "student123"
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "Supervisor Login",
                        summary = "Login as Supervisor",
                        value = """
                            {
                              "email": "supervisor@fypify.com",
                              "password": "supervisor123"
                            }
                            """
                    )
                }
            )
        )
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": null,
                          "data": {
                            "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
                            "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
                            "tokenType": "Bearer",
                            "expiresIn": 900,
                            "userId": 1,
                            "name": "Admin User",
                            "email": "admin@fypify.com",
                            "role": "ADMIN"
                          },
                          "error": null
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Invalid credentials",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": null,
                          "data": null,
                          "error": {
                            "code": "AUTHENTICATION_ERROR",
                            "message": "Invalid email or password",
                            "details": null
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Validation error",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": null,
                          "data": null,
                          "error": {
                            "code": "VALIDATION_ERROR",
                            "message": "Validation failed",
                            "details": {
                              "email": "Email must be valid",
                              "password": "Password is required"
                            }
                          }
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest) {
        
        log.info("Login request received for: {}", loginRequest.getEmail());

        // Delegate to service (Facade Pattern)
        AuthResponse authResponse = authenticationService.login(loginRequest);

        log.info("Login successful for: {}", loginRequest.getEmail());

        return ResponseEntity.ok(
            ApiResponse.<AuthResponse>builder()
                .success(true)
                .data(authResponse)
                .build()
        );
    }

    /**
     * Refresh token endpoint
     * 
     * POST /api/auth/refresh
     * 
     * Request Body:
     * {
     *   "refreshToken": "eyJhbGc..."
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "accessToken": "eyJhbGc...", // New access token
     *     "refreshToken": "eyJhbGc...", // New refresh token (rotated)
     *     "tokenType": "Bearer",
     *     "expiresIn": 900,
     *     "userId": 1,
     *     "name": "Admin User",
     *     "email": "admin@fypify.com",
     *     "role": "ADMIN"
     *   },
     *   "error": null
     * }
     * 
     * @param refreshTokenRequest refresh token request
     * @return AuthResponse with new tokens
     */
    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh Access Token",
        description = "Use refresh token to get a new access token. Implements token rotation - old refresh token becomes invalid after use.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Refresh token from login response",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RefreshTokenRequest.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
                        }
                        """
                )
            )
        )
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Token refreshed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": null,
                          "data": {
                            "accessToken": "eyJhbGciOiJIUzUxMiJ9.newAccessToken...",
                            "refreshToken": "eyJhbGciOiJIUzUxMiJ9.newRefreshToken...",
                            "tokenType": "Bearer",
                            "expiresIn": 900,
                            "userId": 1,
                            "name": "Admin User",
                            "email": "admin@fypify.com",
                            "role": "ADMIN"
                          },
                          "error": null
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Invalid or expired refresh token",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": null,
                          "data": null,
                          "error": {
                            "code": "INVALID_TOKEN",
                            "message": "Invalid or expired refresh token",
                            "details": null
                          }
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        
        log.info("Token refresh request received");

        // Delegate to service (Facade Pattern)
        AuthResponse authResponse = authenticationService.refreshToken(refreshTokenRequest);

        log.info("Token refreshed successfully");

        return ResponseEntity.ok(
            ApiResponse.<AuthResponse>builder()
                .success(true)
                .data(authResponse)
                .build()
        );
    }

    /**
     * Logout endpoint (optional)
     * 
     * Note: JWT is stateless, so logout is typically handled client-side
     * by deleting the tokens. This endpoint can be used for:
     * - Token blacklist
     * - Refresh token revocation in database
     * - Audit logging
     * 
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Log the logout attempt
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                log.info("User logout attempt");
            }
            
            // Since JWT is stateless, we just return success
            // The client will delete the tokens
            return ResponseEntity.ok(
                ApiResponse.<String>builder()
                    .success(true)
                    .message("Logged out successfully")
                    .data(null)
                    .build()
            );
        } catch (Exception e) {
            log.error("Error during logout: {}", e.getMessage());
            return ResponseEntity.ok(
                ApiResponse.<String>builder()
                    .success(true)
                    .message("Logged out successfully")
                    .data(null)
                    .build()
            );
        }
    }
}
