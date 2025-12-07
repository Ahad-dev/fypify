package com.fypify.backend.service;

import com.fypify.backend.entity.Role;
import com.fypify.backend.entity.User;
import com.fypify.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Database Initialization Service
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY responsible for initial database setup
 *    - Separate from other services
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on UserRepository interface (abstraction)
 *    - Depends on PasswordEncoder interface (abstraction)
 * 
 * Design Pattern: Command Pattern
 * - CommandLineRunner executes initialization commands on startup
 * - Encapsulates initialization logic
 * 
 * Best Practices:
 * - Runs only once on application startup
 * - Uses @Slf4j for logging
 * - Checks existence before creating (idempotent)
 * - Creates admin user for initial access
 */
@Slf4j
@Service
public class DatabaseInitializationService {

    /**
     * Initialize database with default users
     * 
     * This method creates initial admin user if no users exist
     * Uses CommandLineRunner to run on application startup
     * 
     * @param userRepository user repository
     * @param passwordEncoder password encoder
     * @return CommandLineRunner bean
     */
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, 
                                         PasswordEncoder passwordEncoder) {
        return args -> {
            log.info("🚀 Starting database initialization...");

            // Check if users already exist
            long userCount = userRepository.count();
            
            if (userCount == 0) {
                log.info("📝 No users found. Creating default users...");
                createDefaultUsers(userRepository, passwordEncoder);
                log.info("✅ Default users created successfully!");
            } else {
                log.info("✅ Database already initialized with {} users", userCount);
            }

            // Log user statistics
            logUserStatistics(userRepository);
        };
    }

    /**
     * Create default users for each role
     * Builder Pattern used for User object creation
     */
    private void createDefaultUsers(UserRepository userRepository, 
                                    PasswordEncoder passwordEncoder) {
        
        // Admin User
        User admin = User.builder()
                .name("System Administrator")
                .email("admin@fypify.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        userRepository.save(admin);
        log.info("✓ Created ADMIN user: {}", admin.getEmail());

        // Committee User
        User committee = User.builder()
                .name("FYP Committee Head")
                .email("committee@fypify.com")
                .password(passwordEncoder.encode("committee123"))
                .role(Role.COMMITTEE)
                .isActive(true)
                .build();
        userRepository.save(committee);
        log.info("✓ Created COMMITTEE user: {}", committee.getEmail());

        // Supervisor User
        User supervisor = User.builder()
                .name("Dr. John Supervisor")
                .email("supervisor@fypify.com")
                .password(passwordEncoder.encode("supervisor123"))
                .role(Role.SUPERVISOR)
                .isActive(true)
                .build();
        userRepository.save(supervisor);
        log.info("✓ Created SUPERVISOR user: {}", supervisor.getEmail());

        // Evaluator User
        User evaluator = User.builder()
                .name("Dr. Jane Evaluator")
                .email("evaluator@fypify.com")
                .password(passwordEncoder.encode("evaluator123"))
                .role(Role.EVALUATOR)
                .isActive(true)
                .build();
        userRepository.save(evaluator);
        log.info("✓ Created EVALUATOR user: {}", evaluator.getEmail());

        // Student User
        User student = User.builder()
                .name("Ali Student")
                .email("student@fypify.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.STUDENT)
                .isActive(true)
                .build();
        userRepository.save(student);
        log.info("✓ Created STUDENT user: {}", student.getEmail());
    }

    /**
     * Log user statistics for monitoring
     * Single Responsibility: Only logging statistics
     */
    private void logUserStatistics(UserRepository userRepository) {
        log.info("📊 User Statistics:");
        for (Role role : Role.values()) {
            long count = userRepository.countByRole(role);
            log.info("   {} users: {}", role.name(), count);
        }
    }
}
