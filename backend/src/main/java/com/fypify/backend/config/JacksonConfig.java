package com.fypify.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jackson Configuration
 * 
 * SOLID Principles:
 * 1. Single Responsibility Principle (SRP):
 *    - Only configures JSON serialization/deserialization
 * 
 * Purpose:
 * - Configure ObjectMapper bean for JSON operations
 * - Handle Java 8 date/time types
 * - Configure serialization settings
 */
@Configuration
public class JacksonConfig {

    /**
     * ObjectMapper bean for JSON serialization/deserialization
     * 
     * @return configured ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register Java 8 date/time module
        mapper.registerModule(new JavaTimeModule());
        
        // Write dates as ISO-8601 strings (not timestamps)
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return mapper;
    }
}
