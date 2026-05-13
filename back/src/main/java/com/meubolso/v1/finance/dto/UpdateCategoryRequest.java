package com.meubolso.v1.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
    @NotBlank @Size(min = 2, max = 80) String name,
    @Size(max = 16) String emoji
) {}
