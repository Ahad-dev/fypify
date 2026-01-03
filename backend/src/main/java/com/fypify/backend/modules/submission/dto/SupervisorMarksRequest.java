package com.fypify.backend.modules.submission.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for supervisor to submit marks on a locked submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorMarksRequest {
    
    @NotNull(message = "Score is required")
    @DecimalMin(value = "0", message = "Score cannot be less than 0")
    @DecimalMax(value = "100", message = "Score cannot be more than 100")
    private BigDecimal score;
}
