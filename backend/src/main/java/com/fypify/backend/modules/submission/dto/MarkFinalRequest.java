package com.fypify.backend.modules.submission.dto;

import lombok.*;

/**
 * DTO for marking a submission as final.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkFinalRequest {
    
    /**
     * Optional confirmation flag (for extra safety).
     */
    private Boolean confirm;
}

