package com.fypify.backend.modules.file.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.file.dto.FileUploadResponse;
import com.fypify.backend.modules.file.service.FileUploadService;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Controller for file upload operations.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. FACADE PATTERN (Structural) - Controller as thin facade
 *    - Delegates all business logic to FileUploadService.
 *    - Handles HTTP concerns only (multipart parsing, response wrapping).
 * 
 * 2. SINGLETON PATTERN (Creational) - via Spring @RestController
 *    - Single instance handles all file upload requests.
 * 
 * ===========================================================================================
 */
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload and management")
public class FileController {

    private final FileUploadService fileUploadService;
    private final UserService userService;

    /**
     * Upload a file to Cloudinary.
     * POST /api/v1/files/upload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload file", description = "Upload a file to Cloudinary storage")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User uploader = userService.getByEmail(userDetails.getUsername());
        FileUploadResponse response = fileUploadService.uploadFile(file, uploader, folder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "File uploaded successfully"));
    }

    /**
     * Get file by ID.
     * GET /api/v1/files/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get file", description = "Get file metadata by ID")
    public ResponseEntity<ApiResponse<FileUploadResponse>> getFile(@PathVariable UUID id) {
        FileUploadResponse response = fileUploadService.getFileById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Delete a file.
     * DELETE /api/v1/files/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete file", description = "Delete a file from storage")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        fileUploadService.deleteFile(id, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted successfully"));
    }
}

