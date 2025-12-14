package com.fypify.backend.modules.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

/**
 * SystemSetting entity for storing configurable system settings.
 * Maps to the 'system_settings' table.
 */
@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @Column(name = "key", length = 100)
    private String key;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "value", columnDefinition = "jsonb")
    private Map<String, Object> value;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Common setting keys
    public static final String KEY_GROUP_MIN_SIZE = "group_min_size";
    public static final String KEY_GROUP_MAX_SIZE = "group_max_size";
    public static final String KEY_MAX_PROPOSALS_PER_GROUP = "max_proposals_per_group";
    public static final String KEY_PROPOSAL_DEADLINE = "proposal_deadline";
    public static final String KEY_CURRENT_SEMESTER = "current_semester";
    public static final String KEY_SUBMISSION_ENABLED = "submission_enabled";
    public static final String KEY_PROPOSALS_VISIBLE = "proposals_visible";
    public static final String KEY_RESULTS_RELEASED = "results_released";

    // Helper methods to get typed values

    /**
     * Get the value as an Integer.
     */
    public Integer getValueAsInteger() {
        if (value == null || !value.containsKey("value")) {
            return null;
        }
        Object v = value.get("value");
        if (v instanceof Number) {
            return ((Number) v).intValue();
        }
        if (v instanceof String) {
            try {
                return Integer.parseInt((String) v);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Get the value as a String.
     */
    public String getValueAsString() {
        if (value == null || !value.containsKey("value")) {
            return null;
        }
        Object v = value.get("value");
        return v != null ? v.toString() : null;
    }

    /**
     * Get the value as a Boolean.
     */
    public Boolean getValueAsBoolean() {
        if (value == null || !value.containsKey("value")) {
            return null;
        }
        Object v = value.get("value");
        if (v instanceof Boolean) {
            return (Boolean) v;
        }
        if (v instanceof String) {
            return Boolean.parseBoolean((String) v);
        }
        return null;
    }

    /**
     * Set a simple value (wraps in a map with "value" key).
     */
    public void setSimpleValue(Object simpleValue) {
        this.value = Map.of("value", simpleValue);
    }
}
