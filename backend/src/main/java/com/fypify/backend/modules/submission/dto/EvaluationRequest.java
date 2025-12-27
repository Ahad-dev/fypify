package com.fypify.backend.modules.submission.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request DTO for submitting or updating evaluation marks.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationRequest {

    /**
     * Score given by evaluator (0-100 scale).
     */
    @NotNull(message = "Score is required")
    @DecimalMin(value = "0", message = "Score must be at least 0")
    @DecimalMax(value = "100", message = "Score must be at most 100")
    private BigDecimal score;

    /**
     * Optional comments from evaluator.
     */
    @Size(max = 2000, message = "Comments must be at most 2000 characters")
    private String comments;

    /**
     * Whether to finalize evaluation on submit.
     * Once finalized, marks cannot be changed.
     */
    @Builder.Default
    private Boolean isFinal = false;
}
