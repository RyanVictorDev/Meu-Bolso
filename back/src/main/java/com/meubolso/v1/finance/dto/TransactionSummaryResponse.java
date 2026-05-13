package com.meubolso.v1.finance.dto;

import java.util.List;

public record TransactionSummaryResponse(long receitasCents, long despesasCents, long count, List<CategoryExpenseItem> expensesByCategory) {
    public record CategoryExpenseItem(String categoryName, long amountCents) {}
}
