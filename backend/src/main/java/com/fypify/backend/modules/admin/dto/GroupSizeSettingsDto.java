package com.fypify.backend.modules.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating group size settings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupSizeSettingsDto {
    
    @NotNull(message = "Minimum size is required")
    @Min(value = 1, message = "Minimum size must be at least 1")
    @Max(value = 10, message = "Minimum size cannot exceed 10")
    private Integer minSize;
    
    @NotNull(message = "Maximum size is required")
    @Min(value = 1, message = "Maximum size must be at least 1")
    @Max(value = 10, message = "Maximum size cannot exceed 10")
    private Integer maxSize;
}
