package com.fypify.backend.modules.file.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing the response after a successful file upload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {
    
    private UUID id;
    private String publicId;
    private String secureUrl;
    private String originalFilename;
    private String resourceType;
    private String format;
    private Long bytes;
    private String fileSizeFormatted;
    private Integer width;
    private Integer height;
    private UUID uploadedById;
    private String uploadedByName;
    private Instant createdAt;
}


