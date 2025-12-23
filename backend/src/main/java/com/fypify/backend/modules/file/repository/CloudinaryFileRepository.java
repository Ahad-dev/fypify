package com.fypify.backend.modules.file.repository;

import com.fypify.backend.modules.file.entity.CloudinaryFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for CloudinaryFile entity operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. REPOSITORY PATTERN (DDD/Enterprise Pattern)
 *    - Abstracts data access layer from business logic.
 *    - Spring Data JPA provides implementation at runtime.
 * 
 * ===========================================================================================
 */
@Repository
public interface CloudinaryFileRepository extends JpaRepository<CloudinaryFile, UUID> {

    /**
     * Find file by Cloudinary public ID.
     */
    Optional<CloudinaryFile> findByPublicId(String publicId);

    /**
     * Check if file exists by public ID.
     */
    boolean existsByPublicId(String publicId);

    /**
     * Find files uploaded by a user.
     */
    Page<CloudinaryFile> findByUploadedById(UUID userId, Pageable pageable);

    /**
     * Delete file by public ID.
     */
    void deleteByPublicId(String publicId);
}


