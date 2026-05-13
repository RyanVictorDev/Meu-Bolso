package com.meubolso.v1.finance.dto;

import java.util.List;

public record TransactionPageResponse(List<TransactionDto> content, int page, int size, long totalElements, int totalPages) {}
