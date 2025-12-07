package com.fypify.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * User Entity
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - This class represents ONLY user data
 *    - No business logic included
 *    - Authentication/authorization handled by services
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Extends BaseEntity for audit fields
 *    - Can be extended for specialized user types
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Can be substituted with BaseEntity where needed
 *    - Maintains parent class contracts
 * 
 * Design Patterns:
 * 1. Builder Pattern:
 *    - Lombok @Builder for fluent object creation
 *    - Handles complex object construction
 *    - Example: User.builder().name("John").email("john@uet.edu.pk").build()
 * 
 * 2. Entity Pattern (JPA):
 *    - Represents database table
 *    - ORM mapping
 * 
 * Best Practices:
 * - Bean Validation annotations for data integrity
 * - Proper indexing on frequently queried fields (email)
 * - Lombok for reducing boilerplate
 * - Immutable ID (no setter)
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_role", columnList = "role")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 60, max = 255, message = "Password hash must be valid")
    @Column(nullable = false)
    private String password; // BCrypt hashed password

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Business method to check if user can perform admin actions
     * Delegates to Role enum (Single Responsibility)
     */
    public boolean hasAdminPrivileges() {
        return role != null && role.isAdmin();
    }

    /**
     * Business method to check if user can review submissions
     */
    public boolean canReviewSubmissions() {
        return role != null && role.canReview();
    }

    /**
     * Business method to check if user can submit projects
     */
    public boolean canSubmitProjects() {
        return role != null && role.canSubmit();
    }

    /**
     * Mask password in toString for security
     * Best Practice: Never log passwords
     */
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", isActive=" + isActive +
                '}';
    }
}
