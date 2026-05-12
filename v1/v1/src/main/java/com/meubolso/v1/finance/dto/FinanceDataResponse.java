package com.meubolso.v1.finance.dto;

import com.meubolso.v1.goal.dto.GoalDto;
import java.util.List;

public record FinanceDataResponse(List<CategoryDto> categories, List<TransactionDto> transactions, List<BudgetDto> budgets, List<GoalDto> goals) {}
