package com.meubolso.v1.finance.dto;

import java.time.Instant;
import java.util.UUID;

public record BudgetDto(UUID id, String month, UUID categoryId, long limitCents, Instant createdAt) {}
