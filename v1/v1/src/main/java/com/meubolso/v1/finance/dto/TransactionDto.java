package com.meubolso.v1.finance.dto;

import com.meubolso.v1.finance.TransactionType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionDto(
    UUID id,
    TransactionType type,
    UUID categoryId,
    String description,
    long amountCents,
    LocalDate occurredOn,
    Instant createdAt
) {}
