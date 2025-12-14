package com.fypify.backend.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * DTO for SystemSetting responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDto {

    private String key;
    private Map<String, Object> value;
    private Instant updatedAt;
}
