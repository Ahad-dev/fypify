package com.fypify.backend.modules.committee.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Request DTO for creating a deadline batch with deadlines.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeadlineBatchRequest {

    @NotBlank(message = "Batch name is required")
    @Size(max = 200, message = "Batch name must not exceed 200 characters")
    private String name;

    private String description;

    @NotNull(message = "Applies from date is required")
    private Instant appliesFrom;

    private Instant appliesUntil;

    @NotEmpty(message = "At least one deadline is required")
    @Valid
    private List<DeadlineItem> deadlines;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeadlineItem {
        @NotNull(message = "Document type ID is required")
        private UUID documentTypeId;

        @NotNull(message = "Deadline date is required")
        private Instant deadlineDate;

        private Integer sortOrder;
    }
}
