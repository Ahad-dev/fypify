package com.fypify.backend.modules.admin.service;

import com.fypify.backend.common.exception.ResourceNotFoundException;
import com.fypify.backend.modules.admin.dto.SystemSettingDto;
import com.fypify.backend.modules.admin.entity.AuditLog;
import com.fypify.backend.modules.admin.entity.SystemSetting;
import com.fypify.backend.modules.admin.repository.SystemSettingRepository;
import com.fypify.backend.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for SystemSetting operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final AuditLogService auditLogService;

    /**
     * Get all system settings.
     */
    public List<SystemSettingDto> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a setting by key.
     */
    public SystemSettingDto getByKey(String key) {
        return toDto(findByKey(key));
    }

    /**
     * Get raw setting value by key.
     */
    public Map<String, Object> getSettingValue(String key) {
        return findByKey(key).getValue();
    }

    /**
     * Get a specific setting value or default.
     */
    @SuppressWarnings("unchecked")
    public <T> T getSettingValueOrDefault(String key, T defaultValue) {
        try {
            Map<String, Object> valueMap = getSettingValue(key);
            if (valueMap != null && valueMap.containsKey("value")) {
                return (T) valueMap.get("value");
            }
            return defaultValue;
        } catch (ResourceNotFoundException e) {
            return defaultValue;
        }
    }

    /**
     * Find setting by key.
     */
    public SystemSetting findByKey(String key) {
        return systemSettingRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
    }

    /**
     * Update or create a system setting.
     */
    @Transactional
    public SystemSettingDto updateSetting(String key, Map<String, Object> value, User actor) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .map(existing -> {
                    Map<String, Object> oldValue = existing.getValue();
                    existing.setValue(value);
                    
                    // Audit log for update
                    Map<String, Object> details = new HashMap<>();
                    details.put("before", oldValue);
                    details.put("after", value);
                    auditLogService.log(actor, AuditLog.ACTION_UPDATE, "SystemSetting", null, details, null);
                    
                    return systemSettingRepository.save(existing);
                })
                .orElseGet(() -> {
                    SystemSetting newSetting = SystemSetting.builder()
                            .key(key)
                            .value(value)
                            .build();
                    
                    // Audit log for create
                    Map<String, Object> details = new HashMap<>();
                    details.put("created", value);
                    auditLogService.log(actor, AuditLog.ACTION_CREATE, "SystemSetting", null, details, null);
                    
                    return systemSettingRepository.save(newSetting);
                });

        log.info("System setting updated: {} by user {}", key, actor.getEmail());
        return toDto(setting);
    }

    /**
     * Delete a system setting.
     */
    @Transactional
    public void deleteSetting(String key, User actor) {
        SystemSetting setting = findByKey(key);
        
        // Audit log
        Map<String, Object> details = new HashMap<>();
        details.put("deleted", setting.getValue());
        auditLogService.log(actor, AuditLog.ACTION_DELETE, "SystemSetting", null, details, null);
        
        systemSettingRepository.delete(setting);
        log.info("System setting deleted: {} by user {}", key, actor.getEmail());
    }

    // Convenience methods for common settings

    /**
     * Get minimum group size.
     */
    public int getGroupMinSize() {
        return getSettingValueOrDefault(SystemSetting.KEY_GROUP_MIN_SIZE, 1);
    }

    /**
     * Get maximum group size.
     */
    public int getGroupMaxSize() {
        return getSettingValueOrDefault(SystemSetting.KEY_GROUP_MAX_SIZE, 4);
    }

    /**
     * Get current semester.
     */
    public String getCurrentSemester() {
        return getSettingValueOrDefault(SystemSetting.KEY_CURRENT_SEMESTER, "Unknown");
    }

    /**
     * Check if submissions are enabled.
     */
    public boolean isSubmissionEnabled() {
        return getSettingValueOrDefault(SystemSetting.KEY_SUBMISSION_ENABLED, false);
    }

    /**
     * Check if proposals are visible.
     */
    public boolean areProposalsVisible() {
        return getSettingValueOrDefault(SystemSetting.KEY_PROPOSALS_VISIBLE, false);
    }

    /**
     * Check if results are released.
     */
    public boolean areResultsReleased() {
        return getSettingValueOrDefault(SystemSetting.KEY_RESULTS_RELEASED, false);
    }

    /**
     * Convert to DTO.
     */
    private SystemSettingDto toDto(SystemSetting setting) {
        return SystemSettingDto.builder()
                .key(setting.getKey())
                .value(setting.getValue())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
