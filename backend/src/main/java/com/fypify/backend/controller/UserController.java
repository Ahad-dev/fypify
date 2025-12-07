package com.fypify.backend.controller;

import com.fypify.backend.dto.ApiResponse;
import com.fypify.backend.dto.request.CreateUserRequest;
import com.fypify.backend.dto.request.UpdateUserRequest;
import com.fypify.backend.dto.response.UserResponse;
import com.fypify.backend.entity.Role;
import com.fypify.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * User Management Controller
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles HTTP requests for user management
 *    - No business logic (delegated to UserService)
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on UserService interface (abstraction)
 *    - Not coupled to implementation details
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Can add new endpoints without modifying existing ones
 * 
 * Design Pattern: Controller Pattern (MVC)
 * - Handles HTTP requests and responses
 * - Delegates business logic to service layer
 * - Returns standardized ApiResponse
 * 
 * Security:
 * - Role-based access control with @PreAuthorize
 * - JWT authentication required (except public endpoints)
 * - ADMIN role for sensitive operations
 * - COMMITTEE role for role management
 * 
 * API Endpoints:
 * - GET    /api/users              - List all users (ADMIN, COMMITTEE)
 * - GET    /api/users/role/{role}  - Get users by role (ADMIN, COMMITTEE, SUPERVISOR)
 * - GET    /api/users/{id}         - Get user by ID (Authenticated)
 * - GET    /api/users/email/{email} - Get user by email (Authenticated)
 * - POST   /api/users              - Create user (ADMIN)
 * - PUT    /api/users/{id}         - Update user (ADMIN, Self)
 * - PATCH  /api/users/{id}/role    - Update user role (ADMIN, COMMITTEE)
 * - PATCH  /api/users/{id}/activate - Activate user (ADMIN)
 * - PATCH  /api/users/{id}/deactivate - Deactivate user (ADMIN)
 * - DELETE /api/users/{id}         - Delete user (ADMIN only)
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@Tag(
    name = "User Management",
    description = "User CRUD operations with role-based access control. Most endpoints require ADMIN or COMMITTEE privileges."
)
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    /**
     * Constructor Injection (DIP)
     * 
     * @param userService user service
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Get all users with pagination
     * 
     * Access: ADMIN, COMMITTEE
     * 
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy field to sort by
     * @param direction sort direction (ASC/DESC)
     * @return paginated list of users
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE')")
    @Operation(
        summary = "Get all users",
        description = "Retrieve all users with pagination and sorting. Requires ADMIN or COMMITTEE role."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Users retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "Users retrieved successfully",
                          "data": {
                            "content": [
                              {
                                "id": 1,
                                "name": "Admin User",
                                "email": "admin@fypify.com",
                                "role": "ADMIN",
                                "isActive": true,
                                "createdAt": "2025-12-07T10:00:00",
                                "updatedAt": "2025-12-07T10:00:00"
                              }
                            ],
                            "totalElements": 5,
                            "totalPages": 1,
                            "number": 0,
                            "size": 10
                          },
                          "error": null
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - Insufficient permissions",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": null,
                          "data": null,
                          "error": {
                            "code": "FORBIDDEN",
                            "message": "Access denied",
                            "details": null
                          }
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by", example = "name")
            @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction", example = "ASC")
            @RequestParam(defaultValue = "ASC") String direction) {

        log.info("Fetching all users - page: {}, size: {}, sortBy: {}, direction: {}", 
                 page, size, sortBy, direction);

        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<UserResponse> users = userService.getAllUsers(pageable);

        return ResponseEntity.ok(
            ApiResponse.success("Users retrieved successfully", users)
        );
    }

    /**
     * Get users by role
     * 
     * Access: ADMIN, COMMITTEE, SUPERVISOR
     * 
     * @param role user role
     * @return list of users with specified role
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE', 'SUPERVISOR')")
    @Operation(
        summary = "Get users by role",
        description = "Retrieve all users with a specific role. Useful for getting all students, supervisors, etc."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Users retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "Users with role STUDENT retrieved successfully",
                          "data": [
                            {
                              "id": 5,
                              "name": "Student User",
                              "email": "student@fypify.com",
                              "role": "STUDENT",
                              "isActive": true,
                              "createdAt": "2025-12-07T10:00:00",
                              "updatedAt": "2025-12-07T10:00:00"
                            }
                          ],
                          "error": null
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(
            @Parameter(description = "User role", example = "STUDENT")
            @PathVariable Role role) {

        log.info("Fetching users with role: {}", role);

        List<UserResponse> users = userService.getUsersByRole(role);

        return ResponseEntity.ok(
            ApiResponse.success("Users with role " + role + " retrieved successfully", users)
        );
    }

    /**
     * Get user by ID
     * 
     * Access: All authenticated users
     * 
     * @param id user ID
     * @return user details
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get user by ID",
        description = "Retrieve a specific user by their ID. Any authenticated user can access this."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "User retrieved successfully",
                          "data": {
                            "id": 1,
                            "name": "Admin User",
                            "email": "admin@fypify.com",
                            "role": "ADMIN",
                            "isActive": true,
                            "createdAt": "2025-12-07T10:00:00",
                            "updatedAt": "2025-12-07T10:00:00"
                          },
                          "error": null
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": null,
                          "data": null,
                          "error": {
                            "code": "RESOURCE_NOT_FOUND",
                            "message": "User not found with id: 999",
                            "details": null
                          }
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "User ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {

        log.info("Fetching user with ID: {}", id);

        UserResponse user = userService.getUserById(id);

        return ResponseEntity.ok(
            ApiResponse.success("User retrieved successfully", user)
        );
    }

    /**
     * Get user by email
     * 
     * Access: All authenticated users
     * 
     * @param email user email
     * @return user details
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get user by email",
        description = "Retrieve a specific user by their email address."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(
            @Parameter(description = "User email", example = "admin@fypify.com")
            @PathVariable String email) {

        log.info("Fetching user with email: {}", email);

        UserResponse user = userService.getUserByEmail(email);

        return ResponseEntity.ok(
            ApiResponse.success("User retrieved successfully", user)
        );
    }

    /**
     * Create new user
     * 
     * Access: ADMIN only
     * 
     * @param request create user request
     * @return created user
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Create new user",
        description = "Create a new user account. Only ADMIN can create users.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User creation data",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CreateUserRequest.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "name": "New Student",
                          "email": "newstudent@fypify.com",
                          "password": "password123",
                          "role": "STUDENT",
                          "isActive": true
                        }
                        """
                )
            )
        )
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "User created successfully",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "User created successfully",
                          "data": {
                            "id": 6,
                            "name": "New Student",
                            "email": "newstudent@fypify.com",
                            "role": "STUDENT",
                            "isActive": true,
                            "createdAt": "2025-12-07T16:00:00",
                            "updatedAt": "2025-12-07T16:00:00"
                          },
                          "error": null
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Email already exists",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": null,
                          "data": null,
                          "error": {
                            "code": "DUPLICATE_RESOURCE",
                            "message": "User already exists with email: newstudent@fypify.com",
                            "details": null
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Validation error"
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        log.info("Creating new user with email: {}", request.getEmail());

        UserResponse user = userService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("User created successfully", user)
        );
    }

    /**
     * Update user
     * 
     * Access: ADMIN or Self
     * TODO: Add authentication principal check for self-update
     * 
     * @param id user ID
     * @param request update user request
     * @return updated user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // TODO: Add "or #id == authentication.principal.id"
    @Operation(
        summary = "Update user",
        description = "Update user information. ADMIN can update any user. Users can update their own profile (future enhancement).",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated user data. All fields are optional for partial updates.",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UpdateUserRequest.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "name": "Updated Name",
                          "email": "updated@fypify.com",
                          "password": "newpassword123"
                        }
                        """
                )
            )
        )
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User updated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Email already exists"
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "User ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {

        log.info("Updating user with ID: {}", id);

        UserResponse user = userService.updateUser(id, request);

        return ResponseEntity.ok(
            ApiResponse.success("User updated successfully", user)
        );
    }

    /**
     * Update user role
     * 
     * Access: ADMIN, COMMITTEE
     * 
     * @param id user ID
     * @param role new role
     * @return updated user
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMMITTEE')")
    @Operation(
        summary = "Update user role",
        description = "Change a user's role. Requires ADMIN or COMMITTEE privileges."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Role updated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @Parameter(description = "User ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id,
            @Parameter(description = "New role", example = "SUPERVISOR")
            @RequestParam Role role) {

        log.info("Updating role for user ID {} to {}", id, role);

        UserResponse user = userService.updateUserRole(id, role);

        return ResponseEntity.ok(
            ApiResponse.success("User role updated successfully", user)
        );
    }

    /**
     * Activate user
     * 
     * Access: ADMIN only
     * 
     * @param id user ID
     * @return activated user
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Activate user account",
        description = "Activate a deactivated user account. Only ADMIN can activate users."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User activated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(
            @Parameter(description = "User ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {

        log.info("Activating user ID: {}", id);

        UserResponse user = userService.activateUser(id);

        return ResponseEntity.ok(
            ApiResponse.success("User activated successfully", user)
        );
    }

    /**
     * Deactivate user (soft delete)
     * 
     * Access: ADMIN only
     * 
     * @param id user ID
     * @return deactivated user
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Deactivate user account",
        description = "Deactivate a user account (soft delete). User can be reactivated later. Only ADMIN can deactivate users."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User deactivated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(
            @Parameter(description = "User ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {

        log.info("Deactivating user ID: {}", id);

        UserResponse user = userService.deactivateUser(id);

        return ResponseEntity.ok(
            ApiResponse.success("User deactivated successfully", user)
        );
    }

    /**
     * Delete user permanently (hard delete)
     * 
     * Access: ADMIN only
     * WARNING: This is irreversible!
     * 
     * @param id user ID
     * @return success message
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Delete user permanently",
        description = "⚠️ **WARNING**: Permanently delete a user from the database. This action is irreversible! Consider using deactivate instead. Only ADMIN can delete users."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User deleted successfully",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "User deleted permanently",
                          "data": null,
                          "error": null
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "User not found"
        )
    })
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "User ID (UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {

        log.warn("Permanently deleting user ID: {}", id);

        userService.deleteUser(id);

        return ResponseEntity.ok(
            ApiResponse.success("User deleted permanently", null)
        );
    }
}
