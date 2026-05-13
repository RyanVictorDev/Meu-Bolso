package com.meubolso.v1.finance.dto;

import com.meubolso.v1.finance.enums.TransactionType;
import java.util.UUID;

public record CategoryDto(UUID id, String name, TransactionType type, String emoji) {}
