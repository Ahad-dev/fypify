package com.fypify.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Base Entity with Audit Fields
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles only audit fields
 * - Open/Closed: Open for extension (inheritance), closed for modification
 * 
 * Design Pattern: Template Method Pattern
 * - Provides common audit fields for all entities
 * - Child entities extend and add specific fields
 * 
 * Best Practice:
 * - JPA auditing for automatic timestamps
 * - @MappedSuperclass for inheritance without table
 */
@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Hook method for child classes to perform actions before persist
     * Template Method Pattern
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    /**
     * Hook method for child classes to perform actions before update
     * Template Method Pattern
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
