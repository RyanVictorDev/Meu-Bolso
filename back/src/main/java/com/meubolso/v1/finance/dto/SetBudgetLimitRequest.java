package com.meubolso.v1.finance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

public record SetBudgetLimitRequest(
    @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}") String month,
    @NotNull UUID categoryId,
    @Min(0) @Max(99999999999999L) long limitCents
) {}
