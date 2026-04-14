package com.meubolso.v1.finance.dto;

import java.util.List;

public record FinanceDataResponse(List<CategoryDto> categories, List<TransactionDto> transactions, List<BudgetDto> budgets) {}
