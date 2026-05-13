package com.meubolso.v1.finance.dto;

import com.meubolso.v1.finance.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddCategoryRequest(
    @NotBlank @Size(min = 2, max = 80) String name,
    @NotNull TransactionType type,
    @Size(max = 16) String emoji
) {}
