package com.fypify.backend.modules.admin.service;

import com.fypify.backend.common.exception.BusinessRuleException;
import com.fypify.backend.common.exception.ConflictException;
import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.dto.CreateDocumentTypeRequest;
import com.fypify.backend.modules.admin.dto.DocumentTypeDto;
import com.fypify.backend.modules.admin.dto.UpdateDocumentTypeRequest;
import com.fypify.backend.modules.admin.entity.AuditLog;
import com.fypify.backend.modules.admin.entity.DocumentType;
import com.fypify.backend.modules.admin.repository.DocumentTypeRepository;
import com.fypify.backend.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for DocumentType operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentTypeService {

    private final DocumentTypeRepository documentTypeRepository;
    private final AuditLogService auditLogService;

    /**
     * Get all document types.
     */
    public List<DocumentTypeDto> getAllDocumentTypes() {
        return documentTypeRepository.findAllOrdered().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all active document types.
     */
    public List<DocumentTypeDto> getActiveDocumentTypes() {
        return documentTypeRepository.findAllActiveOrdered().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get document type by ID.
     */
    public DocumentTypeDto getById(UUID id) {
        return toDto(findById(id));
    }

    /**
     * Get document type by code.
     */
    public DocumentTypeDto getByCode(String code) {
        return toDto(findByCode(code));
    }

    /**
     * Find document type entity by ID.
     */
    public DocumentType findById(UUID id) {
        return documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentType", "id", id));
    }

    /**
     * Find document type entity by code.
     */
    public DocumentType findByCode(String code) {
        return documentTypeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentType", "code", code));
    }

    /**
     * Create a new document type.
     */
    @Transactional
    public DocumentTypeDto createDocumentType(CreateDocumentTypeRequest request, User actor) {
        // Validate weights sum to 100
        validateWeightsSum(request.getWeightSupervisor(), request.getWeightCommittee());

        // Check code uniqueness
        if (documentTypeRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Document type with code '" + request.getCode() + "' already exists");
        }

        DocumentType documentType = DocumentType.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .weightSupervisor(request.getWeightSupervisor())
                .weightCommittee(request.getWeightCommittee())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(true)
                .build();

        DocumentType saved = documentTypeRepository.save(documentType);

        // Audit log
        auditLogService.logCreate(actor, "DocumentType", saved.getId(), toDto(saved));

        log.info("Document type created: {} by user {}", saved.getCode(), actor.getEmail());
        return toDto(saved);
    }

    /**
     * Update an existing document type.
     */
    @Transactional
    public DocumentTypeDto updateDocumentType(UUID id, UpdateDocumentTypeRequest request, User actor) {
        DocumentType documentType = findById(id);
        DocumentTypeDto oldState = toDto(documentType);

        // If updating weights, validate they sum to 100
        Integer newSupervisorWeight = request.getWeightSupervisor() != null 
                ? request.getWeightSupervisor() : documentType.getWeightSupervisor();
        Integer newCommitteeWeight = request.getWeightCommittee() != null 
                ? request.getWeightCommittee() : documentType.getWeightCommittee();
        validateWeightsSum(newSupervisorWeight, newCommitteeWeight);

        // Check code uniqueness if changing
        if (request.getCode() != null && !request.getCode().equals(documentType.getCode())) {
            if (documentTypeRepository.existsByCodeAndIdNot(request.getCode(), id)) {
                throw new ConflictException("Document type with code '" + request.getCode() + "' already exists");
            }
            documentType.setCode(request.getCode());
        }

        // Update fields if provided
        if (request.getTitle() != null) {
            documentType.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            documentType.setDescription(request.getDescription());
        }
        if (request.getWeightSupervisor() != null) {
            documentType.setWeightSupervisor(request.getWeightSupervisor());
        }
        if (request.getWeightCommittee() != null) {
            documentType.setWeightCommittee(request.getWeightCommittee());
        }
        if (request.getDisplayOrder() != null) {
            documentType.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            documentType.setIsActive(request.getIsActive());
        }

        DocumentType saved = documentTypeRepository.save(documentType);
        DocumentTypeDto newState = toDto(saved);

        // Audit log
        auditLogService.logUpdate(actor, "DocumentType", saved.getId(), oldState, newState);

        log.info("Document type updated: {} by user {}", saved.getCode(), actor.getEmail());
        return newState;
    }

    /**
     * Delete a document type (soft delete by deactivating).
     */
    @Transactional
    public void deleteDocumentType(UUID id, User actor) {
        DocumentType documentType = findById(id);
        DocumentTypeDto deletedState = toDto(documentType);
        
        documentType.setIsActive(false);
        documentTypeRepository.save(documentType);

        // Audit log
        Map<String, Object> details = new HashMap<>();
        details.put("deactivated", deletedState);
        auditLogService.log(actor, AuditLog.ACTION_DELETE, "DocumentType", id, details, null);

        log.info("Document type deactivated: {} by user {}", documentType.getCode(), actor.getEmail());
    }

    /**
     * Hard delete a document type.
     */
    @Transactional
    public void hardDeleteDocumentType(UUID id, User actor) {
        DocumentType documentType = findById(id);
        DocumentTypeDto deletedState = toDto(documentType);

        documentTypeRepository.delete(documentType);

        // Audit log
        auditLogService.logDelete(actor, "DocumentType", id, deletedState);

        log.info("Document type permanently deleted: {} by user {}", documentType.getCode(), actor.getEmail());
    }

    /**
     * Validate that supervisor and committee weights sum to 100.
     */
    private void validateWeightsSum(Integer supervisorWeight, Integer committeeWeight) {
        if (supervisorWeight + committeeWeight != 100) {
            throw BusinessRuleException.invalidWeights();
        }
    }

    /**
     * Convert DocumentType entity to DTO.
     */
    public DocumentTypeDto toDto(DocumentType documentType) {
        return DocumentTypeDto.builder()
                .id(documentType.getId())
                .code(documentType.getCode())
                .title(documentType.getTitle())
                .description(documentType.getDescription())
                .weightSupervisor(documentType.getWeightSupervisor())
                .weightCommittee(documentType.getWeightCommittee())
                .displayOrder(documentType.getDisplayOrder())
                .isActive(documentType.getIsActive())
                .createdAt(documentType.getCreatedAt())
                .build();
    }
}
