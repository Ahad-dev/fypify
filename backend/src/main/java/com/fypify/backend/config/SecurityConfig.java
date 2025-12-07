package com.fypify.backend.config;

import com.fypify.backend.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security Configuration
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY configures Spring Security
 *    - No business logic
 * 
 * 2. Dependency Inversion Principle (DIP):
 *    - Depends on JwtAuthenticationFilter (abstraction)
 *    - Returns PasswordEncoder interface (abstraction)
 * 
 * 3. Open/Closed Principle (OCP):
 *    - Can add more filters without modifying existing configuration
 * 
 * Design Patterns Applied:
 * 1. Strategy Pattern:
 *    - PasswordEncoder is a strategy interface
 *    - BCryptPasswordEncoder is one implementation
 *    - Can swap with different encoder (Argon2, SCrypt, etc.)
 * 
 * 2. Chain of Responsibility:
 *    - Security filter chain processes requests sequentially
 *    - Each filter handles specific security aspect
 *    - Order: CORS → JWT Filter → Security Filter → Controller
 * 
 * Security Architecture:
 * - Stateless session (no server-side sessions)
 * - JWT-based authentication
 * - Role-based access control (RBAC)
 * - Public endpoints: /api/auth/*, /api/health
 * - Protected endpoints: All others require authentication
 * 
 * Best Practices:
 * - CSRF disabled (stateless JWT)
 * - CORS enabled (separate frontend)
 * - Method-level security with @PreAuthorize
 * - Proper exception handling
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize, @Secured, etc.
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Constructor Injection (DIP)
     * Using @Lazy to break circular dependency
     */
    public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Security Filter Chain
     * 
     * Chain of Responsibility Pattern:
     * Request → CORS Filter → JWT Filter → UsernamePasswordAuthenticationFilter → Controller
     * 
     * Configuration:
     * 1. Disable CSRF (not needed for stateless JWT)
     * 2. Configure public endpoints
     * 3. Require authentication for all other endpoints
     * 4. Stateless session management
     * 5. Add JWT filter before UsernamePasswordAuthenticationFilter
     * 
     * @param http HttpSecurity
     * @return SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless JWT)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable CORS with default settings (uses CorsFilter bean)
            .cors(cors -> cors.configure(http))
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers(
                    // Root redirect to Swagger
                    "/",
                    // Authentication endpoints
                    "/api/auth/**",
                    "/api/health",
                    "/api/ping",
                    // Swagger UI and OpenAPI endpoints
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/configuration/**",
                    "/swagger-ui/index.html"
                ).permitAll()
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            
            // Stateless session management (no server-side sessions)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Add JWT filter before UsernamePasswordAuthenticationFilter
            // This ensures JWT validation happens before Spring Security's default authentication
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Password encoder bean
     * 
     * Strategy Pattern:
     * - PasswordEncoder is a strategy interface
     * - BCryptPasswordEncoder is one strategy implementation
     * 
     * BCrypt advantages:
     * - Adaptive hashing (can increase strength over time)
     * - Automatic salt generation
     * - Resistant to rainbow table attacks
     * 
     * @return BCryptPasswordEncoder with strength 12
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Authentication Manager bean
     * 
     * Used by services that need to authenticate programmatically
     * (e.g., login service)
     * 
     * @param authConfig authentication configuration
     * @return AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}

