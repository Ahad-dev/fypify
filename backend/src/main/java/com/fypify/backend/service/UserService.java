package com.fypify.backend.service;

import com.fypify.backend.dto.request.CreateUserRequest;
import com.fypify.backend.dto.request.UpdateUserRequest;
import com.fypify.backend.dto.response.UserResponse;
import com.fypify.backend.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * User Service Interface
 * 
 * SOLID Principles Applied:
 * 1. Interface Segregation Principle (ISP):
 *    - Clean interface with only necessary user management methods
 *    - Clients depend only on methods they use
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - High-level modules depend on this abstraction
 *    - Not on concrete implementation
 * 
 * 3. Single Responsibility Principle (SRP):
 *    - ONLY responsible for user business logic
 *    - No direct database access (delegated to repository)
 *    - No HTTP handling (delegated to controller)
 * 
 * Design Pattern: Service Layer Pattern
 * - Encapsulates business logic
 * - Sits between controller and repository
 * - Provides transaction boundaries
 * - Handles data transformation (Entity ↔ DTO)
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
public interface UserService {

    /**
     * Get all users with pagination
     * 
     * @param pageable pagination information
     * @return page of users
     */
    Page<UserResponse> getAllUsers(Pageable pageable);

    /**
     * Get all users by role
     * 
     * @param role user role
     * @return list of users with specified role
     */
    List<UserResponse> getUsersByRole(Role role);

    /**
     * Get user by ID
     * 
     * @param id user ID (UUID)
     * @return user response
     * @throws ResourceNotFoundException if user not found
     */
    UserResponse getUserById(UUID id);

    /**
     * Get user by email
     * 
     * @param email user email
     * @return user response
     * @throws com.fypify.backend.exception.ResourceNotFoundException if user not found
     */
    UserResponse getUserByEmail(String email);

    /**
     * Create new user
     * 
     * @param request create user request
     * @return created user
     * @throws com.fypify.backend.exception.DuplicateResourceException if email already exists
     */
    UserResponse createUser(CreateUserRequest request);

    /**
     * Update existing user
     * 
     * @param id user ID
     * @param request update user request
     * @return updated user
     * @throws com.fypify.backend.exception.ResourceNotFoundException if user not found
     */
    UserResponse updateUser(UUID id, UpdateUserRequest request);

    /**
     * Update user role
     * 
     * @param id user ID
     * @param role new role
     * @return updated user
     * @throws com.fypify.backend.exception.ResourceNotFoundException if user not found
     */
    UserResponse updateUserRole(UUID id, Role role);

    /**
     * Activate user account
     * 
     * @param id user ID
     * @return updated user
     * @throws com.fypify.backend.exception.ResourceNotFoundException if user not found
     */
    UserResponse activateUser(UUID id);

    /**
     * Deactivate user account (soft delete)
     * 
     * @param id user ID
     * @return updated user
     * @throws com.fypify.backend.exception.ResourceNotFoundException if user not found
     */
    UserResponse deactivateUser(UUID id);

    /**
     * Delete user permanently (hard delete)
     * 
     * @param id user ID
     * @throws com.fypify.backend.exception.ResourceNotFoundException if user not found
     */
    void deleteUser(UUID id);

    /**
     * Check if email exists
     * 
     * @param email email to check
     * @return true if email exists
     */
    boolean emailExists(String email);
}
