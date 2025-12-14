package com.fypify.backend.modules.admin.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new document type.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDocumentTypeRequest {

    @NotBlank(message = "Code is required")
    @Size(min = 2, max = 50, message = "Code must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "Code must be uppercase, start with a letter, and contain only letters, numbers, and underscores")
    private String code;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Supervisor weight is required")
    @Min(value = 0, message = "Supervisor weight must be at least 0")
    @Max(value = 100, message = "Supervisor weight must not exceed 100")
    private Integer weightSupervisor;

    @NotNull(message = "Committee weight is required")
    @Min(value = 0, message = "Committee weight must be at least 0")
    @Max(value = 100, message = "Committee weight must not exceed 100")
    private Integer weightCommittee;

    @Min(value = 0, message = "Display order must be at least 0")
    private Integer displayOrder;
}
