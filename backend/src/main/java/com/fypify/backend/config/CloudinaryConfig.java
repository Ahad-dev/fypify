package com.fypify.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary configuration for file storage.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. SINGLETON PATTERN (Creational) - via Spring @Bean
 *    - Cloudinary instance is created once and reused across the application.
 *    - Thread-safe singleton managed by Spring container.
 * 
 * 2. FACTORY METHOD PATTERN (Creational) - @Bean method
 *    - cloudinary() method acts as factory method for Cloudinary instance creation.
 *    - Encapsulates configuration logic and validation.
 * 
 * ===========================================================================================
 */
@Slf4j
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Creates and configures the Cloudinary instance.
     * 
     * @return Configured Cloudinary instance
     */
    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isBlank() ||
            apiKey == null || apiKey.isBlank() ||
            apiSecret == null || apiSecret.isBlank()) {
            log.warn("Cloudinary credentials not configured. File uploads will fail.");
        }

        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));

        log.info("Cloudinary configured with cloud name: {}", cloudName);
        return cloudinary;
    }
}


