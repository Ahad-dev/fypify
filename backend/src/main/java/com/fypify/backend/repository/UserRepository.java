package com.fypify.backend.repository;

import com.fypify.backend.entity.Role;
import com.fypify.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User Repository Interface
 * 
 * SOLID Principles Applied:
 * 1. Dependency Inversion Principle (DIP):
 *    - Services depend on this interface, NOT the implementation
 *    - Spring Data JPA provides implementation at runtime
 *    - Easy to mock for testing
 * 
 * 2. Interface Segregation Principle (ISP):
 *    - Provides only user-specific query methods
 *    - Not bloated with unnecessary methods
 * 
 * 3. Single Responsibility Principle (SRP):
 *    - ONLY handles database operations for User entity
 *    - No business logic
 * 
 * Design Pattern: Repository Pattern
 * - Abstracts data access logic
 * - Provides collection-like interface for domain objects
 * - Centralizes data access code
 * - Benefits:
 *   * Easy to test (mock repository)
 *   * Centralized query logic
 *   * Separates domain from infrastructure
 * 
 * Best Practices:
 * - Use Optional<T> to avoid null returns
 * - Custom query methods follow naming conventions
 * - @Query for complex queries
 * - Proper method naming (Spring Data conventions)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email (for authentication)
     * Spring Data generates: SELECT * FROM users WHERE email = ?
     * 
     * @param email user email
     * @return Optional<User> to handle null safely
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if email already exists (for validation)
     * Spring Data generates: SELECT COUNT(*) > 0 FROM users WHERE email = ?
     * 
     * @param email user email
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find all users by role
     * Spring Data generates: SELECT * FROM users WHERE role = ?
     * 
     * @param role user role
     * @return List of users with specified role
     */
    List<User> findByRole(Role role);

    /**
     * Find active users by role
     * Custom query for complex condition
     * 
     * @param role user role
     * @param isActive active status
     * @return List of active users with specified role
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = :isActive")
    List<User> findActiveUsersByRole(@Param("role") Role role, @Param("isActive") Boolean isActive);

    /**
     * Find all active users
     * 
     * @param isActive active status
     * @return List of active users
     */
    List<User> findByIsActive(Boolean isActive);

    /**
     * Search users by name (case-insensitive)
     * Spring Data generates: SELECT * FROM users WHERE LOWER(name) LIKE LOWER(?)
     * 
     * @param name search term
     * @return List of matching users
     */
    List<User> findByNameContainingIgnoreCase(String name);

    /**
     * Count users by role
     * Useful for dashboard statistics
     * 
     * @param role user role
     * @return count of users with specified role
     */
    long countByRole(Role role);
}
