package com.fypify.backend.config;

import com.fypify.backend.modules.admin.entity.DocumentType;
import com.fypify.backend.modules.admin.entity.SystemSetting;
import com.fypify.backend.modules.admin.repository.DocumentTypeRepository;
import com.fypify.backend.modules.admin.repository.SystemSettingRepository;
import com.fypify.backend.modules.user.entity.Role;
import com.fypify.backend.modules.user.entity.User;
import com.fypify.backend.modules.user.repository.RoleRepository;
import com.fypify.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data seeder that runs on application startup.
 * Seeds required system data like admin user and default document types.
 * Only seeds if data doesn't already exist (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@fypify.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting data seeder...");
        
        seedRoles();
        seedAdminUser();
        seedDocumentTypes();
        seedSystemSettings();
        
        log.info("Data seeding completed.");
    }

    /**
     * Seed default roles.
     */
    private void seedRoles() {
        List<String[]> roles = List.of(
                new String[]{Role.ADMIN, "System administrator with full access"},
                new String[]{Role.STUDENT, "Student user who can submit projects and documents"},
                new String[]{Role.SUPERVISOR, "Faculty member who supervises student projects"},
                new String[]{Role.FYP_COMMITTEE, "FYP committee member who oversees all projects"},
                new String[]{Role.EVALUATION_COMMITTEE, "Evaluation committee member who grades projects"}
        );

        for (String[] roleData : roles) {
            if (roleRepository.findByName(roleData[0]).isEmpty()) {
                Role role = Role.builder()
                        .name(roleData[0])
                        .description(roleData[1])
                        .build();
                roleRepository.save(role);
                log.info("Created role: {}", roleData[0]);
            }
        }
    }

    /**
     * Seed admin user if not exists.
     */
    private void seedAdminUser() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role adminRole = roleRepository.findByName(Role.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = User.builder()
                    .fullName(adminName)
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(adminRole)
                    .isActive(true)
                    .build();

            userRepository.save(admin);
            log.info("Created admin user: {}", adminEmail);
        } else {
            log.info("Admin user already exists: {}", adminEmail);
        }
    }

    /**
     * Seed default document types.
     * Standard FYP deliverables with weights that sum to 100.
     */
    private void seedDocumentTypes() {
        // Define document types: code, title, description, supervisorWeight, committeeWeight, order
        List<Object[]> documentTypes = List.of(
                new Object[]{"PROPOSAL", "Project Proposal", "Initial project proposal document", 30, 70, 1},
                new Object[]{"SRS", "Software Requirements Specification", "Detailed software requirements document", 40, 60, 2},
                new Object[]{"DESIGN", "Design Document", "System design and architecture document", 40, 60, 3},
                new Object[]{"THESIS", "Final Thesis", "Complete thesis document with all chapters", 30, 70, 4},
                new Object[]{"PRESENTATION", "Final Presentation", "Presentation slides and demo", 50, 50, 5}
        );

        for (Object[] data : documentTypes) {
            String code = (String) data[0];
            if (!documentTypeRepository.existsByCode(code)) {
                DocumentType docType = DocumentType.builder()
                        .code(code)
                        .title((String) data[1])
                        .description((String) data[2])
                        .weightSupervisor((Integer) data[3])
                        .weightCommittee((Integer) data[4])
                        .displayOrder((Integer) data[5])
                        .isActive(true)
                        .build();
                documentTypeRepository.save(docType);
                log.info("Created document type: {}", code);
            }
        }
    }

    /**
     * Seed default system settings.
     */
    private void seedSystemSettings() {
        Map<String, Object> defaultSettings = new HashMap<>();
        defaultSettings.put(SystemSetting.KEY_GROUP_MIN_SIZE, 1);
        defaultSettings.put(SystemSetting.KEY_GROUP_MAX_SIZE, 4);
        defaultSettings.put(SystemSetting.KEY_CURRENT_SEMESTER, "Fall 2024");
        defaultSettings.put(SystemSetting.KEY_SUBMISSION_ENABLED, true);
        defaultSettings.put(SystemSetting.KEY_PROPOSALS_VISIBLE, true);
        defaultSettings.put(SystemSetting.KEY_RESULTS_RELEASED, false);

        for (Map.Entry<String, Object> entry : defaultSettings.entrySet()) {
            if (systemSettingRepository.findById(entry.getKey()).isEmpty()) {
                Map<String, Object> valueMap = new HashMap<>();
                valueMap.put("value", entry.getValue());
                
                SystemSetting setting = SystemSetting.builder()
                        .key(entry.getKey())
                        .value(valueMap)
                        .build();
                systemSettingRepository.save(setting);
                log.info("Created system setting: {}", entry.getKey());
            }
        }
    }
}
