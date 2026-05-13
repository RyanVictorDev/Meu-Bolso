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
import com.meubolso.v1.finance.dto.TransactionPageResponse;
import com.meubolso.v1.finance.dto.TransactionSummaryResponse;
import com.meubolso.v1.finance.dto.UpdateTransactionRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    public FinanceDataResponse load(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(required = false) UUID environmentId) {
        return financeService.load(user.id(), environmentId);
    }

    @PostMapping("/finance/reset")
    public FinanceDataResponse reset(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(required = false) UUID environmentId) {
        return financeService.resetToSeed(user.id(), environmentId);
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(required = false) UUID environmentId) {
        return financeService.load(user.id(), environmentId).categories();
    }

    @PostMapping("/categories")
    public CategoryDto addCategory(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @Valid @RequestBody AddCategoryRequest request
    ) {
        return financeService.addCategory(user.id(), environmentId, request);
    }

    @GetMapping("/transactions")
    public TransactionPageResponse transactions(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @RequestParam(required = false) String month,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return financeService.getTransactionsPage(user.id(), environmentId, month, dateFrom, dateTo, search, page, size);
    }

    @GetMapping("/transactions/summary")
    public TransactionSummaryResponse transactionsSummary(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @RequestParam(required = false) String month,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo
    ) {
        return financeService.transactionsSummary(user.id(), environmentId, month, dateFrom, dateTo);
    }

    @PostMapping("/transactions")
    public TransactionDto addTransaction(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @Valid @RequestBody AddTransactionRequest request
    ) {
        return financeService.addTransaction(user.id(), environmentId, request);
    }

    @GetMapping("/transactions/{transactionId}")
    public TransactionDto transaction(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @PathVariable UUID transactionId
    ) {
        return financeService.getTransaction(user.id(), environmentId, transactionId);
    }

    @PutMapping("/transactions/{transactionId}")
    public TransactionDto updateTransaction(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @PathVariable UUID transactionId,
        @Valid @RequestBody UpdateTransactionRequest request
    ) {
        return financeService.updateTransaction(user.id(), environmentId, transactionId, request);
    }

    @DeleteMapping("/transactions/{transactionId}")
    public void deleteTransaction(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @PathVariable UUID transactionId
    ) {
        financeService.deleteTransaction(user.id(), environmentId, transactionId);
    }

    @PutMapping("/budgets/limit")
    public BudgetDto setBudgetLimit(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @Valid @RequestBody SetBudgetLimitRequest request
    ) {
        return financeService.setBudgetLimit(user.id(), environmentId, request);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @RequestParam String month
    ) {
        return financeService.dashboard(user.id(), environmentId, month);
    }
}
