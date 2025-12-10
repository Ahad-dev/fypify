package com.fypify.backend.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Role entity representing user roles in the system.
 * Maps to the 'roles' table.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 40)
    private String name;

    @Column(name = "description")
    private String description;

    // Role name constants for easy reference
    public static final String ADMIN = "ADMIN";
    public static final String STUDENT = "STUDENT";
    public static final String SUPERVISOR = "SUPERVISOR";
    public static final String FYP_COMMITTEE = "FYP_COMMITTEE";
    public static final String EVALUATION_COMMITTEE = "EVALUATION_COMMITTEE";
}
