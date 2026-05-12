package com.meubolso.v1.goal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddGoalRequest(
    @NotBlank @Size(max = 120) String name,
    @Size(max = 280) String description,
    @Min(1) @Max(99999999999999L) long targetCents,
    @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String dueOn
) {}
