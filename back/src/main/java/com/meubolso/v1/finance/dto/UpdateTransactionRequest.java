package com.meubolso.v1.finance.dto;

import com.meubolso.v1.finance.enums.TransactionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record UpdateTransactionRequest(
    @NotNull TransactionType type,
    @NotNull UUID categoryId,
    @Size(max = 240) String description,
    @Min(1) @Max(99999999999999L) long amountCents,
    @NotBlank @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}") String occurredOn
) {}
