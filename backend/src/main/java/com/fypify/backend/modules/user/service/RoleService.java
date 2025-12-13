package com.fypify.backend.modules.user.service;

import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.user.dto.RoleDto;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for Role operations.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;

    /**
     * Get all roles.
     */
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get role by ID.
     */
    public RoleDto getById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return toDto(role);
    }

    /**
     * Get role by name.
     */
    public RoleDto getByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", name));
        return toDto(role);
    }

    /**
     * Find role entity by name.
     */
    public Role findByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", name));
    }

    /**
     * Check if role exists by name.
     */
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }

    /**
     * Convert Role entity to DTO.
     */
    public RoleDto toDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .build();
    }
}
