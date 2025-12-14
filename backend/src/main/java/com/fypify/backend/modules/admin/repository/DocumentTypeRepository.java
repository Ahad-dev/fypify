package com.fypify.backend.modules.admin.repository;

import com.fypify.backend.modules.admin.entity.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for DocumentType entity.
 */
@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, UUID> {

    /**
     * Find document type by code.
     */
    Optional<DocumentType> findByCode(String code);

    /**
     * Check if a document type exists by code.
     */
    boolean existsByCode(String code);

    /**
     * Find all active document types ordered by display order.
     */
    @Query("SELECT dt FROM DocumentType dt WHERE dt.isActive = true ORDER BY dt.displayOrder ASC, dt.code ASC")
    List<DocumentType> findAllActiveOrdered();

    /**
     * Find all document types ordered by display order.
     */
    @Query("SELECT dt FROM DocumentType dt ORDER BY dt.displayOrder ASC, dt.code ASC")
    List<DocumentType> findAllOrdered();

    /**
     * Check if code exists for another document type (for updates).
     */
    @Query("SELECT COUNT(dt) > 0 FROM DocumentType dt WHERE dt.code = :code AND dt.id != :id")
    boolean existsByCodeAndIdNot(String code, UUID id);
}
