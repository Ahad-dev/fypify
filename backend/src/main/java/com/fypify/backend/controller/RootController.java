package com.fypify.backend.controller;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Root Controller
 * Redirects root URL to Swagger UI for developer convenience
 * 
 * Design Pattern: Convenience Pattern
 * - Provides better developer experience
 * - No need to remember Swagger UI path
 */
@RestController
@Hidden  // Hide from OpenAPI docs
public class RootController {

    /**
     * Redirect root URL to Swagger UI
     * 
     * @param response HTTP response
     * @throws IOException if redirect fails
     */
    @GetMapping("/")
    public void redirectToSwagger(HttpServletResponse response) throws IOException {
        response.sendRedirect("/swagger-ui.html");
    }
}
