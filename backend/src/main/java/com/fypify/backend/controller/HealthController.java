package com.fypify.backend.controller;

import com.fypify.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Tests basic API functionality and provides system status information
 */
@RestController
@RequestMapping("/api")
@Tag(
    name = "Health Check",
    description = "System health and status endpoints. These are public endpoints used for monitoring and diagnostics."
)
public class HealthController {

    @GetMapping("/health")
    @Operation(
        summary = "Health Check",
        description = "Check if the FYPIFY backend service is running and healthy. Returns system status, timestamp, and version information."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Service is healthy and running",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "Service is running",
                          "data": {
                            "status": "UP",
                            "timestamp": "2025-12-07T15:30:00",
                            "service": "FYPIFY Backend",
                            "version": "1.0.0"
                          },
                          "error": null
                        }
                        """
                )
            )
        )
    })
    public ApiResponse<Map<String, Object>> healthCheck() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("service", "FYPIFY Backend");
        healthData.put("version", "1.0.0");
        
        return ApiResponse.success("Service is running", healthData);
    }

    @GetMapping("/ping")
    @Operation(
        summary = "Ping",
        description = "Simple ping endpoint to test connectivity. Returns a 'pong' response."
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Pong response",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "Pong! FYPIFY is alive",
                          "data": "pong",
                          "error": null
                        }
                        """
                )
            )
        )
    })
    public ApiResponse<String> ping() {
        return ApiResponse.success("Pong! FYPIFY is alive", "pong");
    }
}

