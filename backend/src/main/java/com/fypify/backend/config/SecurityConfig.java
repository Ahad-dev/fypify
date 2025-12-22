package com.fypify.backend.config;

import com.fypify.backend.security.CustomUserDetailsService;
import com.fypify.backend.security.jwt.JwtAuthenticationEntryPoint;
import com.fypify.backend.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for the application.
 * Configures JWT authentication, CORS, and authorization rules.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. CHAIN OF RESPONSIBILITY PATTERN (Behavioral) - Spring Security Filter Chain
 *    - The SecurityFilterChain is a classic implementation of Chain of Responsibility.
 *    - Each filter in the chain (JwtAuthenticationFilter, etc.) processes the request
 *      and decides whether to handle it or pass to the next filter.
 *    - Filters: CORS → CSRF → Authentication → Authorization → JwtFilter → Controller
 *    - If any filter rejects the request, the chain is broken and error returned.
 * 
 * 2. BUILDER PATTERN (Creational) - HttpSecurity Configuration
 *    - HttpSecurity uses a fluent Builder pattern for configuration.
 *    - Methods like .cors(), .csrf(), .authorizeHttpRequests() return the builder
 *      allowing method chaining for readable configuration.
 *    - Final .build() call creates the immutable SecurityFilterChain.
 * 
 * 3. SINGLETON PATTERN (Creational) - Spring @Bean and @Configuration
 *    - @Configuration classes are singleton by default.
 *    - @Bean methods return singleton instances cached by Spring.
 *    - SecurityFilterChain, PasswordEncoder, AuthenticationManager are singletons.
 * 
 * 4. STRATEGY PATTERN (Behavioral) - AuthenticationProvider
 *    - AuthenticationProvider interface defines a strategy for authentication.
 *    - DaoAuthenticationProvider is a concrete strategy for database auth.
 *    - Could easily swap to OAuth2, LDAP, or custom provider strategies.
 * 
 * 5. FACTORY METHOD PATTERN (Creational) - @Bean Methods
 *    - Each @Bean method acts as a Factory Method.
 *    - Spring calls these methods to create instances.
 *    - Encapsulates object creation logic (e.g., BCryptPasswordEncoder configuration).
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. DECORATOR PATTERN (Structural) - Suggested for Enhanced Filters
 *    - Create decorators around filters for logging, metrics, etc.
 *    - Example: LoggingFilter wrapping JwtAuthenticationFilter
 * 
 * 2. ABSTRACT FACTORY PATTERN (Creational) - Suggested for Multi-Environment Config
 *    - Create SecurityConfigFactory for different environments (dev, prod, test).
 *    - Each factory produces different SecurityFilterChain configurations.
 * 
 * ===========================================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF (using JWT)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Enable CORS - MUST be first
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                
                // Session management (stateless for JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Authorization rules - ORDER MATTERS!
                .authorizeHttpRequests(auth -> auth
                        // Allow OPTIONS for CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Auth endpoints - public
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()
                        
                        // Health and monitoring
                        .requestMatchers("/api/v1/health", "/actuator/**").permitAll()
                        
                        // Swagger/OpenAPI
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                
                // Authentication provider
                .authenticationProvider(authenticationProvider())
                
                // Add JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow frontend URL from env and localhost for development
        configuration.setAllowedOriginPatterns(List.of(frontendUrl, "http://localhost:3000", "https://fypify.vercel.app"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
