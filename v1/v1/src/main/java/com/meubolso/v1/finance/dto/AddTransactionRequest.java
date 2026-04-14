package com.meubolso.v1.finance.dto;

import com.meubolso.v1.finance.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AddTransactionRequest(
    @NotNull TransactionType type,
    @NotNull UUID categoryId,
    @Size(max = 240) String description,
    @Min(1) long amountCents,
    @NotBlank String occurredOn
) {}
