package com.meubolso.v1.finance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SetBudgetLimitRequest(@NotBlank String month, @NotNull UUID categoryId, @Min(0) long limitCents) {}
