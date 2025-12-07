package com.fypify.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI Configuration for FYPIFY API Documentation
 * 
 * This configuration class sets up Swagger UI and OpenAPI documentation for the FYPIFY backend.
 * It defines API metadata, security schemes, and server configurations.
 * 
 * Design Pattern: Configuration Pattern
 * - Centralizes all API documentation configuration
 * - Provides a single source of truth for API metadata
 * 
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Only responsible for API documentation configuration
 * - Open/Closed Principle (OCP): Can be extended with additional annotations without modification
 * 
 * Access Points:
 * - Swagger UI: http://localhost:8080/swagger-ui.html
 * - OpenAPI JSON: http://localhost:8080/v3/api-docs
 * - OpenAPI YAML: http://localhost:8080/v3/api-docs.yaml
 * 
 * Integration with Bump.sh:
 * The generated openapi.yaml will be automatically committed to GitHub and synced with Bump.sh
 * for live API documentation hosting.
 * 
 * @author FYPIFY Team
 * @version 1.0
 * @since Phase 1.3
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "FYPIFY API",
        version = "1.0.0",
        description = """
            ## Final Year Project Management System API
            
            FYPIFY is a comprehensive platform for managing Final Year Projects (FYP) in academic institutions.
            
            ### Features
            - **Authentication**: JWT-based authentication with access and refresh tokens
            - **User Management**: Multi-role support (Admin, Committee, Supervisor, Evaluator, Student)
            - **Project Management**: Create, track, and evaluate FYP projects
            - **Evaluation System**: Comprehensive evaluation and grading workflows
            - **Communication**: Messaging and notification system
            
            ### Authentication
            All protected endpoints require a Bearer token in the Authorization header:
            ```
            Authorization: Bearer {access_token}
            ```
            
            ### Token Information
            - **Access Token**: 15 minutes expiration
            - **Refresh Token**: 7 days expiration
            
            ### User Roles
            - **ADMIN**: Full system access
            - **COMMITTEE**: Project oversight and evaluation
            - **SUPERVISOR**: Supervise and guide students
            - **EVALUATOR**: Evaluate project submissions
            - **STUDENT**: Submit and manage projects
            
            ### Test Credentials
            - admin@fypify.com / admin123
            - committee@fypify.com / committee123
            - supervisor@fypify.com / supervisor123
            - evaluator@fypify.com / evaluator123
            - student@fypify.com / student123
            """,
        contact = @Contact(
            name = "FYPIFY Support",
            email = "support@fypify.com",
            url = "https://github.com/your-org/fypify"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(
            description = "Local Development Server",
            url = "http://localhost:8080"
        ),
        @Server(
            description = "Production Server",
            url = "https://api.fypify.com"
        )
    },
    security = {
        @SecurityRequirement(name = "bearerAuth")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    description = "JWT Bearer Token Authentication. Login to get an access token, then use it in the Authorization header.",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
    
    /**
     * Configuration is handled via annotations on the class level.
     * No additional bean configuration is required as Springdoc
     * auto-configures based on the annotations.
     * 
     * The @OpenAPIDefinition annotation provides:
     * - API title, version, and description
     * - Contact information
     * - License information
     * - Server configurations
     * - Global security requirements
     * 
     * The @SecurityScheme annotation configures:
     * - JWT Bearer token authentication
     * - Authorization header format
     * - Security scheme for Swagger UI
     */
}
