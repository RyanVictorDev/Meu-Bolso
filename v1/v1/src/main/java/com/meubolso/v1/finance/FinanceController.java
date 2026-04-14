package com.meubolso.v1.finance;

import com.meubolso.v1.auth.AuthenticatedUser;
import com.meubolso.v1.finance.dto.AddCategoryRequest;
import com.meubolso.v1.finance.dto.AddTransactionRequest;
import com.meubolso.v1.finance.dto.BudgetDto;
import com.meubolso.v1.finance.dto.CategoryDto;
import com.meubolso.v1.finance.dto.DashboardResponse;
import com.meubolso.v1.finance.dto.FinanceDataResponse;
import com.meubolso.v1.finance.dto.SetBudgetLimitRequest;
import com.meubolso.v1.finance.dto.TransactionDto;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FinanceController {
    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/finance")
    public FinanceDataResponse load(@AuthenticationPrincipal AuthenticatedUser user) {
        return financeService.load(user.id());
    }

    @PostMapping("/finance/reset")
    public FinanceDataResponse reset(@AuthenticationPrincipal AuthenticatedUser user) {
        return financeService.resetToSeed(user.id());
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories(@AuthenticationPrincipal AuthenticatedUser user) {
        return financeService.load(user.id()).categories();
    }

    @PostMapping("/categories")
    public CategoryDto addCategory(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody AddCategoryRequest request) {
        return financeService.addCategory(user.id(), request);
    }

    @GetMapping("/transactions")
    public List<TransactionDto> transactions(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(required = false) String month) {
        return financeService.getTransactions(user.id(), month);
    }

    @PostMapping("/transactions")
    public TransactionDto addTransaction(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody AddTransactionRequest request) {
        return financeService.addTransaction(user.id(), request);
    }

    @PutMapping("/budgets/limit")
    public BudgetDto setBudgetLimit(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody SetBudgetLimitRequest request) {
        return financeService.setBudgetLimit(user.id(), request);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam String month) {
        return financeService.dashboard(user.id(), month);
    }
}
