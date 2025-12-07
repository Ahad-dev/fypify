package com.fypify.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Configuration
 * 
 * SOLID Principle: Single Responsibility Principle
 * - This configuration class has ONE responsibility: Enable JPA auditing
 * 
 * Best Practice:
 * - Separate configuration classes for different concerns
 * - @EnableJpaAuditing enables automatic timestamp management in BaseEntity
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // JPA Auditing is now enabled
    // BaseEntity's @CreatedDate and @LastModifiedDate will work automatically
}
