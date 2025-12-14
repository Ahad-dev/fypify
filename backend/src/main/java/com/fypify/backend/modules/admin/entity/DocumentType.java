package com.fypify.backend.modules.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * DocumentType entity representing configurable document types in the system.
 * Maps to the 'document_types' table.
 * 
 * Each document type has weights for supervisor and committee evaluation
 * that must sum to 100.
 */
@Entity
@Table(name = "document_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "weight_supervisor", nullable = false)
    @Builder.Default
    private Integer weightSupervisor = 20;

    @Column(name = "weight_committee", nullable = false)
    @Builder.Default
    private Integer weightCommittee = 80;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    /**
     * Validate that weights sum to 100.
     */
    @PrePersist
    @PreUpdate
    public void validateWeights() {
        if (weightSupervisor + weightCommittee != 100) {
            throw new IllegalStateException("Document type weights must sum to 100");
        }
    }
}
