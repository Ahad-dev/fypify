package com.fypify.backend.modules.admin.controller;

import com.fypify.backend.common.response.ApiResponse;
import com.fypify.backend.modules.admin.dto.CreateDocumentTypeRequest;
import com.fypify.backend.modules.admin.dto.DocumentTypeDto;
import com.fypify.backend.modules.admin.dto.UpdateDocumentTypeRequest;
import com.fypify.backend.modules.admin.service.DocumentTypeService;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for Document Type management.
 * Admin-only endpoints for configuring document types and their weights.
 */
@RestController
@RequestMapping("/api/v1/admin/document-types")
@RequiredArgsConstructor
@Tag(name = "Document Types", description = "Document type configuration (Admin only)")
public class DocumentTypeController {

    private final DocumentTypeService documentTypeService;
    private final UserService userService;

    /**
     * Get all document types.
     * GET /api/v1/admin/document-types
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all document types", description = "Get all document types including inactive ones")
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> getAllDocumentTypes() {
        List<DocumentTypeDto> documentTypes = documentTypeService.getAllDocumentTypes();
        return ResponseEntity.ok(ApiResponse.success(documentTypes));
    }

    /**
     * Get active document types only.
     * GET /api/v1/admin/document-types/active
     */
    @GetMapping("/active")
    @Operation(summary = "Get active document types", description = "Get only active document types")
    public ResponseEntity<ApiResponse<List<DocumentTypeDto>>> getActiveDocumentTypes() {
        List<DocumentTypeDto> documentTypes = documentTypeService.getActiveDocumentTypes();
        return ResponseEntity.ok(ApiResponse.success(documentTypes));
    }

    /**
     * Get document type by ID.
     * GET /api/v1/admin/document-types/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get document type by ID", description = "Get document type details by ID")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> getDocumentTypeById(@PathVariable UUID id) {
        DocumentTypeDto documentType = documentTypeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(documentType));
    }

    /**
     * Get document type by code.
     * GET /api/v1/admin/document-types/code/{code}
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get document type by code", description = "Get document type details by code")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> getDocumentTypeByCode(@PathVariable String code) {
        DocumentTypeDto documentType = documentTypeService.getByCode(code);
        return ResponseEntity.ok(ApiResponse.success(documentType));
    }

    /**
     * Create a new document type.
     * POST /api/v1/admin/document-types
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create document type", description = "Create a new document type. Weights must sum to 100.")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> createDocumentType(
            @Valid @RequestBody CreateDocumentTypeRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        DocumentTypeDto documentType = documentTypeService.createDocumentType(request, actor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(documentType, "Document type created successfully"));
    }

    /**
     * Update document type.
     * PUT /api/v1/admin/document-types/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update document type", description = "Update document type. Weights must sum to 100.")
    public ResponseEntity<ApiResponse<DocumentTypeDto>> updateDocumentType(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDocumentTypeRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        DocumentTypeDto documentType = documentTypeService.updateDocumentType(id, request, actor);
        return ResponseEntity.ok(ApiResponse.success(documentType, "Document type updated successfully"));
    }

    /**
     * Delete document type (soft delete).
     * DELETE /api/v1/admin/document-types/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete document type", description = "Soft delete (deactivate) a document type")
    public ResponseEntity<ApiResponse<Void>> deleteDocumentType(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        documentTypeService.deleteDocumentType(id, actor);
        return ResponseEntity.ok(ApiResponse.success("Document type deleted successfully"));
    }

    /**
     * Permanently delete document type.
     * DELETE /api/v1/admin/document-types/{id}/permanent
     */
    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete document type", description = "Hard delete a document type (cannot be undone)")
    public ResponseEntity<ApiResponse<Void>> permanentlyDeleteDocumentType(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User actor = userService.getByEmail(userDetails.getUsername());
        documentTypeService.hardDeleteDocumentType(id, actor);
        return ResponseEntity.ok(ApiResponse.success("Document type permanently deleted"));
    }
}
