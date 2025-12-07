package com.fypify.backend.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fypify.backend.dto.ErrorResponse;
import com.fypify.backend.dto.ApiResponse;
import com.fypify.backend.entity.User;
import com.fypify.backend.exception.InvalidTokenException;
import com.fypify.backend.service.AuthenticationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter
 * 
 * SOLID Principles Applied:
 * 1. Single Responsibility Principle (SRP):
 *    - ONLY handles JWT token validation in requests
 *    - Extracts token, validates, sets authentication
 * 
 * 2. Open/Closed Principle (OCP):
 *    - Extends OncePerRequestFilter (open for extension)
 *    - Can add more security logic without modifying existing code
 * 
 * 3. Dependency Inversion Principle (DIP):
 *    - Depends on AuthenticationService (abstraction)
 *    - Depends on JwtUtil (abstraction)
 * 
 * Design Pattern: Chain of Responsibility
 * - Part of Spring Security's filter chain
 * - Each filter processes request and passes to next filter
 * - This filter:
 *   1. Checks for JWT token
 *   2. Validates token
 *   3. Sets authentication
 *   4. Passes to next filter
 * 
 * Filter Chain Flow:
 * Request → CORS Filter → JWT Filter → Security Filter → Controller
 * 
 * Benefits:
 * - Automatic authentication on every request
 * - Centralized JWT validation
 * - No need to manually check tokens in controllers
 * - Integrates seamlessly with Spring Security
 * 
 * Best Practices:
 * - OncePerRequestFilter ensures filter runs once per request
 * - Skip filter for public endpoints (/auth/login, /auth/refresh)
 * - Proper error handling with JSON responses
 * - Clear logging for debugging
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AuthenticationService authenticationService;
    private final ObjectMapper objectMapper;

    /**
     * Constructor Injection (DIP)
     */
    public JwtAuthenticationFilter(JwtUtil jwtUtil, 
                                   AuthenticationService authenticationService,
                                   ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.authenticationService = authenticationService;
        this.objectMapper = objectMapper;
    }

    /**
     * Main filter method - Chain of Responsibility
     * 
     * Process:
     * 1. Extract JWT token from Authorization header
     * 2. Validate token
     * 3. Set authentication in SecurityContext
     * 4. Continue filter chain
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain filter chain
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        log.debug("Processing request: {} {}", request.getMethod(), requestPath);

        try {
            // 1. Extract JWT token from Authorization header
            String jwt = extractJwtFromRequest(request);

            if (jwt == null) {
                log.debug("No JWT token found in request");
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Validate token and get user
            User user = authenticationService.validateAccessToken(jwt);

            // 3. Create authentication object
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    user.getEmail(),
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

            // Set request details
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 4. Set authentication in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("User authenticated successfully: {} with role: {}", user.getEmail(), user.getRole());

            // 5. Continue filter chain
            filterChain.doFilter(request, response);

        } catch (InvalidTokenException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            handleAuthenticationException(response, e.getMessage());
        } catch (Exception e) {
            log.error("Error in JWT authentication filter: {}", e.getMessage());
            handleAuthenticationException(response, "Authentication failed");
        }
    }

    /**
     * Extract JWT token from Authorization header
     * 
     * Expected format: "Bearer {token}"
     * 
     * @param request HTTP request
     * @return JWT token or null
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7); // Remove "Bearer " prefix
            log.debug("JWT token extracted from request");
            return token;
        }

        return null;
    }

    /**
     * Handle authentication exceptions
     * Send JSON error response
     * 
     * @param response HTTP response
     * @param message error message
     */
    private void handleAuthenticationException(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        ApiResponse<Object> errorResponse = ApiResponse.error("AUTHENTICATION_ERROR", message);

        String json = objectMapper.writeValueAsString(errorResponse);

        response.getWriter().write(json);
    }

    /**
     * Skip filter for public endpoints
     * Optimization: don't process JWT for public URLs
     * 
     * @param request HTTP request
     * @return true if filter should not run
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip filter for authentication endpoints
        boolean shouldSkip = path.startsWith("/api/auth/login") || 
                            path.startsWith("/api/auth/refresh") ||
                            path.startsWith("/api/health");

        if (shouldSkip) {
            log.debug("Skipping JWT filter for public endpoint: {}", path);
        }

        return shouldSkip;
    }
}
