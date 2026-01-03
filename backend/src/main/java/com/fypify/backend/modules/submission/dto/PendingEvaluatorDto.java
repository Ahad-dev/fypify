package com.fypify.backend.modules.submission.dto;

import lombok.*;

import java.util.UUID;

/**
 * DTO for evaluators who haven't yet evaluated a submission.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingEvaluatorDto {
    
    private UUID id;
    private String fullName;
    private String email;
}
