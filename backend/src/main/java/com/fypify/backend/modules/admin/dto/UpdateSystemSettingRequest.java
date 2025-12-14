package com.fypify.backend.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request for updating a system setting.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSystemSettingRequest {

    @NotBlank(message = "Setting key is required")
    private String key;

    @NotNull(message = "Value is required")
    private Map<String, Object> value;
}
