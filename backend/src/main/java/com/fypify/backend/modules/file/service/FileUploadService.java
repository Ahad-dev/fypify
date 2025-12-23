package com.fypify.backend.modules.file.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.file.dto.FileUploadResponse;
import com.fypify.backend.modules.file.entity.CloudinaryFile;
import com.fypify.backend.modules.file.repository.CloudinaryFileRepository;
import com.fypify.backend.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Service for file upload operations using Cloudinary.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural)
 *    - Provides simplified interface over Cloudinary SDK complexity.
 *    - Hides upload configuration, error handling, and metadata extraction.
 * 
 * 2. ADAPTER PATTERN (Structural)
 *    - Adapts Cloudinary API responses to our CloudinaryFile entity.
 *    - Converts external Map<String, Object> responses to domain objects.
 * 
 * 3. SINGLETON PATTERN (Creational) - via Spring @Service
 *    - Single instance handles all file operations.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. STRATEGY PATTERN (Behavioral) - Suggested for Multiple Storage Providers
 *    - Interface: FileStorageStrategy { upload(), delete(), getUrl() }
 *    - Implementations: CloudinaryStrategy, S3Strategy, LocalFileStrategy
 *    - Benefit: Swap storage providers without changing business logic.
 * 
 * ===========================================================================================
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FileUploadService {

    private final Cloudinary cloudinary;
    private final CloudinaryFileRepository fileRepository;

    // Allowed file types and max size
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final String[] ALLOWED_CONTENT_TYPES = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "image/jpeg",
            "image/png",
            "image/gif"
    };

    /**
     * Upload a file to Cloudinary and store metadata.
     *
     * @param file     The multipart file to upload
     * @param uploader The user uploading the file
     * @param folder   Optional folder path in Cloudinary (e.g., "submissions/proposals")
     * @return FileUploadResponse with file metadata
     */
    @Transactional
    public FileUploadResponse uploadFile(MultipartFile file, User uploader, String folder) {
        // Validate file
        validateFile(file);

        try {
            // Prepare upload options
            Map<String, Object> uploadOptions = ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", folder != null ? "fypify/" + folder : "fypify/uploads",
                    "use_filename", true,
                    "unique_filename", true
            );

            // Upload to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);

            // Extract metadata from response
            String publicId = (String) uploadResult.get("public_id");
            String secureUrl = (String) uploadResult.get("secure_url");
            String resourceType = (String) uploadResult.get("resource_type");
            String format = (String) uploadResult.get("format");
            Long bytes = uploadResult.get("bytes") != null ? ((Number) uploadResult.get("bytes")).longValue() : null;
            Integer width = uploadResult.get("width") != null ? ((Number) uploadResult.get("width")).intValue() : null;
            Integer height = uploadResult.get("height") != null ? ((Number) uploadResult.get("height")).intValue() : null;

            // Create and save entity
            CloudinaryFile cloudinaryFile = CloudinaryFile.builder()
                    .publicId(publicId)
                    .secureUrl(secureUrl)
                    .originalFilename(file.getOriginalFilename())
                    .resourceType(resourceType)
                    .format(format)
                    .bytes(bytes)
                    .width(width)
                    .height(height)
                    .uploadedBy(uploader)
                    .build();

            cloudinaryFile = fileRepository.save(cloudinaryFile);

            log.info("File uploaded successfully: publicId={}, uploadedBy={}", publicId, uploader.getId());

            return toDto(cloudinaryFile);

        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new BusinessRuleException("FILE_UPLOAD_FAILED", "Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Get file by ID.
     */
    public FileUploadResponse getFileById(UUID fileId) {
        CloudinaryFile file = findById(fileId);
        return toDto(file);
    }

    /**
     * Find file entity by ID.
     */
    public CloudinaryFile findById(UUID fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));
    }

    /**
     * Find file entity by public ID.
     */
    public CloudinaryFile findByPublicId(String publicId) {
        return fileRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "publicId", publicId));
    }

    /**
     * Delete a file from Cloudinary and database.
     */
    @Transactional
    public void deleteFile(UUID fileId, User actor) {
        CloudinaryFile file = findById(fileId);

        // Only uploader or admin can delete
        if (!file.getUploadedBy().getId().equals(actor.getId()) && !actor.isAdmin()) {
            throw new BusinessRuleException("PERMISSION_DENIED", "You don't have permission to delete this file");
        }

        try {
            // Delete from Cloudinary
            cloudinary.uploader().destroy(file.getPublicId(), ObjectUtils.asMap(
                    "resource_type", file.getResourceType() != null ? file.getResourceType() : "raw"
            ));

            // Delete from database
            fileRepository.delete(file);

            log.info("File deleted: publicId={}, deletedBy={}", file.getPublicId(), actor.getId());

        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary: {}", e.getMessage(), e);
            throw new BusinessRuleException("FILE_DELETE_FAILED", "Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Validate file before upload.
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("FILE_EMPTY", "File is empty or not provided");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessRuleException("FILE_TOO_LARGE", 
                    "File size exceeds maximum allowed size of " + (MAX_FILE_SIZE / (1024 * 1024)) + "MB");
        }

        String contentType = file.getContentType();
        boolean isAllowed = false;
        for (String allowed : ALLOWED_CONTENT_TYPES) {
            if (allowed.equals(contentType)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", 
                    "File type '" + contentType + "' is not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, JPEG, PNG, GIF");
        }
    }

    /**
     * Convert entity to DTO.
     */
    public FileUploadResponse toDto(CloudinaryFile file) {
        return FileUploadResponse.builder()
                .id(file.getId())
                .publicId(file.getPublicId())
                .secureUrl(file.getSecureUrl())
                .originalFilename(file.getOriginalFilename())
                .resourceType(file.getResourceType())
                .format(file.getFormat())
                .bytes(file.getBytes())
                .fileSizeFormatted(file.getFileSizeFormatted())
                .width(file.getWidth())
                .height(file.getHeight())
                .uploadedById(file.getUploadedBy() != null ? file.getUploadedBy().getId() : null)
                .uploadedByName(file.getUploadedBy() != null ? file.getUploadedBy().getFullName() : null)
                .createdAt(file.getCreatedAt())
                .build();
    }
}

