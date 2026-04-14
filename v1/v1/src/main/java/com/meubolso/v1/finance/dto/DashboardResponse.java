package com.meubolso.v1.finance.dto;

import java.util.List;

public record DashboardResponse(
    String month,
    long receitasCents,
    long despesasCents,
    long saldoCents,
    long budgetTotalCents,
    boolean withinBudget,
    List<CategoryExpenseItem> expensesByCategory
) {
    public record CategoryExpenseItem(String categoryName, long amountCents) {}
}
