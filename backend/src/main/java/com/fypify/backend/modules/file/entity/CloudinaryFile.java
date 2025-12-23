package com.fypify.backend.modules.file.entity;

import com.fypify.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * CloudinaryFile entity representing uploaded file metadata.
 * Maps to the 'cloudinary_files' table.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. BUILDER PATTERN (Creational) - via Lombok @Builder
 *    - Enables fluent construction: CloudinaryFile.builder().publicId(...).build()
 * 
 * 2. VALUE OBJECT PATTERN (DDD, related to GoF)
 *    - File metadata is immutable after creation (no updates expected)
 * 
 * ===========================================================================================
 */
@Entity
@Table(name = "cloudinary_files",
    indexes = {
        @Index(name = "idx_cloudinary_publicid", columnList = "public_id"),
        @Index(name = "idx_cloudinary_uploaded_by", columnList = "uploaded_by")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudinaryFile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "public_id", nullable = false)
    private String publicId;

    @Column(name = "secure_url", nullable = false, length = 2048)
    private String secureUrl;

    @Column(name = "original_filename", length = 500)
    private String originalFilename;

    @Column(name = "resource_type", length = 50)
    private String resourceType;

    @Column(name = "format", length = 20)
    private String format;

    @Column(name = "bytes")
    private Long bytes;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    /**
     * Get file size in human readable format.
     */
    public String getFileSizeFormatted() {
        if (bytes == null) return "Unknown";
        
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }
}


