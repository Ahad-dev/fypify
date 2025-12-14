package com.fypify.backend.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fypify.backend.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Entry point for handling unauthorized requests.
 * Returns JSON error response instead of HTML.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String origin = request.getHeader("Origin");
        
        log.error("Unauthorized access attempt: {} {} from origin: {}", method, path, origin);
        log.error("Error details: {}", authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiResponse<Void> apiResponse = ApiResponse.error("UNAUTHORIZED", "Authentication required");

        objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}
