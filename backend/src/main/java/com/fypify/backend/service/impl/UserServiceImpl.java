package com.fypify.backend.service.impl;

import com.fypify.backend.dto.request.CreateUserRequest;
import com.fypify.backend.dto.request.UpdateUserRequest;
import com.fypify.backend.dto.response.UserResponse;
import com.fypify.backend.entity.Role;
import com.fypify.backend.entity.User;
import com.fypify.backend.exception.DuplicateResourceException;
import com.fypify.backend.exception.ResourceNotFoundException;
import com.fypify.backend.repository.UserRepository;
import com.fypify.backend.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * User Service Implementation
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY manages user business logic
 *    - No HTTP handling (controller's job)
 *    - No direct SQL (repository's job)
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on UserRepository interface (abstraction)
 *    - Depends on PasswordEncoder interface (abstraction)
 *    - Not coupled to concrete implementations
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Open for extension (can add new methods)
 *    - Closed for modification (existing methods stable)
 * 
 * 4. Liskov Substitution Principle (LSP):
 *    - Can be substituted with any UserService implementation
 *    - Honors the interface contract
 * 
 * Design Patterns Applied:
 * 1. Service Layer Pattern:
 *    - Encapsulates business logic
 *    - Provides transaction boundaries
 *    - Coordinates between controller and repository
 * 
 * 2. DTO Pattern:
 *    - Converts between Entity and DTO
 *    - Prevents exposing internal domain model
 * 
 * 3. Facade Pattern:
 *    - Provides simple interface to complex operations
 *    - Hides complexity of entity-DTO conversion
 * 
 * Best Practices:
 * - @Transactional for data consistency
 * - Proper exception handling
 * - Logging for debugging and auditing
 * - Password hashing for security
 * - Input validation delegation to DTOs
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.4
 */
@Slf4j
@Service
@Transactional(readOnly = true)  // Default to read-only for performance
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructor Injection (DIP)
     * 
     * @param userRepository user repository
     * @param passwordEncoder password encoder
     */
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        log.debug("Fetching all users with pagination: {}", pageable);
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    @Override
    public List<UserResponse> getUsersByRole(Role role) {
        log.debug("Fetching users with role: {}", role);
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(UUID id) {
        log.debug("Fetching user by ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional  // Write operation - needs transaction
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());

        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Build user entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // Hash password
                .role(request.getRole())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        // Save to database
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional  // Write operation
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", id);

        // Find existing user
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Update fields if provided (partial update support)
        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("User", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        // Save updated user
        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getId());

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional  // Write operation
    public UserResponse updateUserRole(UUID id, Role role) {
        log.info("Updating role for user ID {} to {}", id, role);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setRole(role);
        User updatedUser = userRepository.save(user);

        log.info("User role updated successfully");
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional  // Write operation
    public UserResponse activateUser(UUID id) {
        log.info("Activating user ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsActive(true);
        User updatedUser = userRepository.save(user);

        log.info("User activated successfully");
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional  // Write operation
    public UserResponse deactivateUser(UUID id) {
        log.info("Deactivating user ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setIsActive(false);
        User updatedUser = userRepository.save(user);

        log.info("User deactivated successfully");
        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional  // Write operation
    public void deleteUser(UUID id) {
        log.warn("Permanently deleting user ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userRepository.delete(user);
        log.warn("User deleted permanently: {}", id);
    }

    @Override
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Map User entity to UserResponse DTO
     * 
     * DTO Pattern:
     * - Converts internal domain model to external API model
     * - Hides sensitive fields (e.g., password)
     * - Prevents over-fetching
     * 
     * @param user user entity
     * @return user response DTO
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
