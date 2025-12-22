package com.fypify.backend.security.jwt;

import com.fypify.backend.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * JWT Authentication filter that validates tokens on every request.
 * 
 * ===========================================================================================
 *                              GANG OF FOUR (GoF) DESIGN PATTERNS USED
 * ===========================================================================================
 * 
 * 1. CHAIN OF RESPONSIBILITY PATTERN (Behavioral)
 *    - Part of Spring Security's filter chain.
 *    - Processes JWT token and either authenticates user or passes to next filter.
 *    - Calls filterChain.doFilter() to pass request to next handler in chain.
 * 
 * 2. TEMPLATE METHOD PATTERN (Behavioral) - OncePerRequestFilter
 *    - Extends OncePerRequestFilter which provides template method pattern.
 *    - doFilterInternal() is the hook method we override.
 *    - Parent class handles: request tracking, single execution per request.
 * 
 * 3. STRATEGY PATTERN (Behavioral) - JwtTokenProvider
 *    - Token validation is delegated to JwtTokenProvider (strategy).
 *    - Could swap to different token validation strategies (OAuth2, SAML).
 * 
 * 4. SINGLETON PATTERN (Creational) - via Spring @Component
 *    - Single filter instance processes all requests.
 * 
 * ===========================================================================================
 *                              PATTERNS THAT COULD BE APPLIED HERE
 * ===========================================================================================
 * 
 * 1. DECORATOR PATTERN (Structural) - Suggested for Filter Enhancement
 *    - Wrap this filter with decorators: LoggingFilterDecorator, MetricsFilterDecorator
 *    - Add cross-cutting concerns without modifying core logic.
 * 
 * ===========================================================================================
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        log.debug("JWT Filter processing: {} {}", method, path);
        
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                log.debug("JWT token found in request");
                if (tokenProvider.validateToken(jwt)) {
                    UUID userId = tokenProvider.getUserIdFromJwt(jwt);
                    UserDetails userDetails = customUserDetailsService.loadUserById(userId);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("User authenticated: {}", userDetails.getUsername());
                } else {
                    log.debug("Invalid JWT token");
                }
            } else {
                log.debug("No JWT token found for: {} {}", method, path);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
