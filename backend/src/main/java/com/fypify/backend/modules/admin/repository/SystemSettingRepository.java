package com.fypify.backend.modules.admin.repository;

import com.fypify.backend.modules.admin.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for SystemSetting entity.
 */
@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
}
