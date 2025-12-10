package com.fypify.backend.modules.user.repository;

import com.fypify.backend.modules.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Role entity.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    /**
     * Find a role by its name.
     */
    Optional<Role> findByName(String name);

    /**
     * Check if a role exists by name.
     */
    boolean existsByName(String name);
}
