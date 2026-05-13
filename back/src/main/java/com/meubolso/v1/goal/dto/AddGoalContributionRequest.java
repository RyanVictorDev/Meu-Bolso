package com.meubolso.v1.goal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddGoalContributionRequest(
    @Min(1) @Max(99999999999999L) long amountCents,
    @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String contributedOn,
    @Size(max = 180) String note
) {}
