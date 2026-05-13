package com.meubolso.v1.finance.service;

import com.meubolso.v1.finance.entity.BudgetEntity;
import com.meubolso.v1.finance.entity.CategoryEntity;
import com.meubolso.v1.finance.entity.TransactionEntity;
import com.meubolso.v1.finance.enums.TransactionType;
import com.meubolso.v1.finance.repository.BudgetRepository;
import com.meubolso.v1.finance.repository.CategoryRepository;
import com.meubolso.v1.finance.repository.TransactionRepository;
import com.meubolso.v1.user.repository.UserAccountRepository;
import com.meubolso.v1.common.exceptions.ApiException;
import com.meubolso.v1.environment.entity.EnvironmentEntity;
import com.meubolso.v1.environment.service.EnvironmentService;
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
import com.meubolso.v1.finance.dto.UpdateCategoryRequest;
import com.meubolso.v1.finance.dto.UpdateTransactionRequest;
import com.meubolso.v1.finance.dto.UserSummaryDto;
import com.meubolso.v1.goal.service.GoalService;
import com.meubolso.v1.user.entity.UserAccount;
import java.text.Normalizer;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinanceService {
    private final UserAccountRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final EnvironmentService environmentService;
    private final DefaultFinanceSeedService seedService;
    private final GoalService goalService;
    private final Clock clock;

    public FinanceService(
        UserAccountRepository userRepository,
        CategoryRepository categoryRepository,
        TransactionRepository transactionRepository,
        BudgetRepository budgetRepository,
        EnvironmentService environmentService,
        DefaultFinanceSeedService seedService,
        GoalService goalService,
        Clock clock
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.environmentService = environmentService;
        this.seedService = seedService;
        this.goalService = goalService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public FinanceDataResponse load(UUID userId) {
        return load(userId, null);
    }

    @Transactional
    public FinanceDataResponse load(UUID userId, UUID environmentId) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        List<CategoryDto> categories = categoryRepository.findByEnvironmentIdOrderByNameAsc(environment.getId()).stream().map(this::toCategoryDto).toList();
        if (categories.isEmpty()) {
            seedService.ensureDefaultCategories(environment, requiredUser(userId));
            categories = categoryRepository.findByEnvironmentIdOrderByNameAsc(environment.getId()).stream().map(this::toCategoryDto).toList();
        }
        List<BudgetDto> budgets = budgetRepository
            .findByEnvironmentIdOrderByMonthDesc(environment.getId())
            .stream()
            .sorted(Comparator.comparing(BudgetEntity::getMonth).reversed())
            .map(this::toBudgetDto)
            .toList();
        return new FinanceDataResponse(categories, List.of(), budgets, goalService.list(userId, environment.getId()));
    }

    @Transactional
    public CategoryDto addCategory(UUID userId, AddCategoryRequest request) {
        return addCategory(userId, null, request);
    }

    @Transactional
    public CategoryDto addCategory(UUID userId, UUID environmentId, AddCategoryRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        UserAccount user = requiredUser(userId);
        String name = request.name().trim();
        String normalizedName = name.toLowerCase(Locale.ROOT);
        return categoryRepository
            .findByEnvironmentIdAndTypeAndNormalizedName(environment.getId(), request.type(), normalizedName)
            .map(this::toCategoryDto)
            .orElseGet(() -> {
                CategoryEntity created = categoryRepository.save(
                    CategoryEntity
                        .builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .environment(environment)
                        .name(name)
                        .normalizedName(normalizedName)
                        .type(request.type())
                        .emoji(normalizeEmoji(request.emoji()))
                        .createdAt(clock.instant())
                        .build()
                );
                if (request.type() == TransactionType.DESPESA) {
                    String currentMonth = YearMonth.now(clock).toString();
                    budgetRepository
                        .findByEnvironmentIdAndMonthAndCategoryId(environment.getId(), currentMonth, created.getId())
                        .orElseGet(() ->
                            budgetRepository.save(
                                BudgetEntity
                                    .builder()
                                    .id(UUID.randomUUID())
                                    .user(user)
                                    .environment(environment)
                                    .month(currentMonth)
                                    .category(created)
                                    .limitCents(0)
                                    .createdAt(clock.instant())
                                    .build()
                            )
                        );
                }
                return toCategoryDto(created);
            });
    }

    @Transactional
    public CategoryDto updateCategory(UUID userId, UUID environmentId, UUID categoryId, UpdateCategoryRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        CategoryEntity category = categoryRepository
            .findByIdAndEnvironmentId(categoryId, environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
        String name = request.name().trim();
        String normalizedName = name.toLowerCase(Locale.ROOT);
        categoryRepository
            .findByEnvironmentIdAndTypeAndNormalizedName(environment.getId(), category.getType(), normalizedName)
            .filter(c -> !c.getId().equals(categoryId))
            .ifPresent(c -> {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Já existe uma categoria com este nome");
            });
        category.setName(name);
        category.setNormalizedName(normalizedName);
        category.setEmoji(normalizeEmoji(request.emoji()));
        return toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID userId, UUID environmentId, UUID categoryId) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        CategoryEntity category = categoryRepository
            .findByIdAndEnvironmentId(categoryId, environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
        long txCount = transactionRepository.countByCategory_Id(categoryId);
        if (txCount > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Não é possível excluir: existem transações nesta categoria.");
        }
        budgetRepository.deleteByCategory_Id(categoryId);
        categoryRepository.delete(category);
    }

    @Transactional
    public TransactionDto addTransaction(UUID userId, AddTransactionRequest request) {
        return addTransaction(userId, null, request);
    }

    @Transactional
    public TransactionDto addTransaction(UUID userId, UUID environmentId, AddTransactionRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        UserAccount user = requiredUser(userId);
        CategoryEntity category = categoryRepository
            .findByIdAndEnvironmentId(request.categoryId(), environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid category"));
        if (category.getType() != request.type()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction type must match category type");
        }
        LocalDate occurredOn = parseTransactionDate(request.occurredOn());
        TransactionEntity tx = transactionRepository.save(
            TransactionEntity
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                        .environment(environment)
                        .createdByUser(user)
                .type(request.type())
                .category(category)
                .description(normalizeDescription(request.description()))
                .amountCents(request.amountCents())
                .occurredOn(occurredOn)
                .createdAt(clock.instant())
                .build()
        );
        return toTransactionDto(tx);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactions(UUID userId, String month) {
        return getTransactions(userId, null, month);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactions(UUID userId, UUID environmentId, String month) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        DateRange range = resolveDateRange(month, null, null);
        return transactionRepository
            .findByEnvironmentIdAndOccurredOnBetweenOrderByOccurredOnDesc(environment.getId(), range.start(), range.end())
            .stream()
            .map(this::toTransactionDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public TransactionPageResponse getTransactionsPage(
        UUID userId,
        UUID environmentId,
        String month,
        String dateFrom,
        String dateTo,
        String search,
        int page,
        int size
    ) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        DateRange range = resolveDateRange(month, dateFrom, dateTo);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        String normalizedSearch = normalizeSearch(search);
        Long amountCents = parseSearchAmountCents(normalizedSearch);
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "occurredOn").and(Sort.by(Sort.Direction.DESC, "createdAt")));
        Page<TransactionEntity> txPage = normalizedSearch == null
            ? transactionRepository.findByEnvironmentIdAndOccurredOnBetween(environment.getId(), range.start(), range.end(), pageRequest)
            : amountCents == null
            ? transactionRepository.searchByEnvironmentAndPeriod(environment.getId(), range.start(), range.end(), normalizedSearch, pageRequest)
            : transactionRepository.searchByEnvironmentAndPeriodAndAmount(
                environment.getId(),
                range.start(),
                range.end(),
                normalizedSearch,
                amountCents,
                pageRequest
            );
        return new TransactionPageResponse(
            txPage.getContent().stream().map(this::toTransactionDto).toList(),
            txPage.getNumber(),
            txPage.getSize(),
            txPage.getTotalElements(),
            txPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public TransactionSummaryResponse transactionsSummary(UUID userId, UUID environmentId, String month, String dateFrom, String dateTo) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        DateRange range = resolveDateRange(month, dateFrom, dateTo);
        List<TransactionEntity> transactions = transactionRepository.findByEnvironmentIdAndOccurredOnBetweenOrderByOccurredOnDesc(
            environment.getId(),
            range.start(),
            range.end()
        );
        long receitas = transactions.stream().filter(t -> t.getType() == TransactionType.RECEITA).mapToLong(TransactionEntity::getAmountCents).sum();
        long despesas = transactions.stream().filter(t -> t.getType() == TransactionType.DESPESA).mapToLong(TransactionEntity::getAmountCents).sum();
        Map<String, Long> byCategory = transactions
            .stream()
            .filter(t -> t.getType() == TransactionType.DESPESA)
            .collect(Collectors.groupingBy(t -> t.getCategory().getName(), Collectors.summingLong(TransactionEntity::getAmountCents)));
        List<TransactionSummaryResponse.CategoryExpenseItem> items = byCategory
            .entrySet()
            .stream()
            .map(entry -> new TransactionSummaryResponse.CategoryExpenseItem(entry.getKey(), entry.getValue()))
            .sorted(Comparator.comparingLong(TransactionSummaryResponse.CategoryExpenseItem::amountCents).reversed())
            .toList();
        return new TransactionSummaryResponse(receitas, despesas, transactions.size(), items);
    }

    @Transactional(readOnly = true)
    public TransactionDto getTransaction(UUID userId, UUID environmentId, UUID transactionId) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        return transactionRepository
            .findByIdAndEnvironmentId(transactionId, environment.getId())
            .map(this::toTransactionDto)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transação não encontrada"));
    }

    @Transactional
    public TransactionDto updateTransaction(UUID userId, UUID environmentId, UUID transactionId, UpdateTransactionRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        TransactionEntity transaction = transactionRepository
            .findByIdAndEnvironmentId(transactionId, environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transação não encontrada"));
        CategoryEntity category = categoryRepository
            .findByIdAndEnvironmentId(request.categoryId(), environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid category"));
        if (category.getType() != request.type()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction type must match category type");
        }
        transaction.setType(request.type());
        transaction.setCategory(category);
        transaction.setDescription(normalizeDescription(request.description()));
        transaction.setAmountCents(request.amountCents());
        transaction.setOccurredOn(parseTransactionDate(request.occurredOn()));
        return toTransactionDto(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(UUID userId, UUID environmentId, UUID transactionId) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        TransactionEntity transaction = transactionRepository
            .findByIdAndEnvironmentId(transactionId, environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Transação não encontrada"));
        transactionRepository.delete(transaction);
    }

    @Transactional
    public BudgetDto setBudgetLimit(UUID userId, SetBudgetLimitRequest request) {
        return setBudgetLimit(userId, null, request);
    }

    @Transactional
    public BudgetDto setBudgetLimit(UUID userId, UUID environmentId, SetBudgetLimitRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        UserAccount user = requiredUser(userId);
        YearMonth month = parseMonth(request.month());
        CategoryEntity category = categoryRepository
            .findByIdAndEnvironmentId(request.categoryId(), environment.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid category"));
        if (category.getType() != TransactionType.DESPESA) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Budget only allowed for DESPESA categories");
        }

        BudgetEntity budget = budgetRepository
            .findByEnvironmentIdAndMonthAndCategoryId(environment.getId(), month.toString(), category.getId())
            .map(existing -> {
                existing.setLimitCents(Math.max(0, request.limitCents()));
                return existing;
            })
            .orElseGet(() ->
                BudgetEntity
                    .builder()
                    .id(UUID.randomUUID())
                    .user(user)
                    .environment(environment)
                    .month(month.toString())
                    .category(category)
                    .limitCents(Math.max(0, request.limitCents()))
                    .createdAt(clock.instant())
                    .build()
            );

        return toBudgetDto(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(UUID userId, String monthRaw) {
        return dashboard(userId, null, monthRaw);
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(UUID userId, UUID environmentId, String monthRaw) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        YearMonth month = parseMonth(monthRaw);
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<TransactionEntity> monthTx = transactionRepository.findByEnvironmentIdAndOccurredOnBetweenOrderByOccurredOnDesc(environment.getId(), start, end);
        long receitas = monthTx.stream().filter(t -> t.getType() == TransactionType.RECEITA).mapToLong(TransactionEntity::getAmountCents).sum();
        long despesas = monthTx.stream().filter(t -> t.getType() == TransactionType.DESPESA).mapToLong(TransactionEntity::getAmountCents).sum();

        YearMonth previousMonth = month.minusMonths(1);
        List<TransactionEntity> previousTx = transactionRepository.findByEnvironmentIdAndOccurredOnBetweenOrderByOccurredOnDesc(
            environment.getId(),
            previousMonth.atDay(1),
            previousMonth.atEndOfMonth()
        );
        long previousDespesas = previousTx.stream().filter(t -> t.getType() == TransactionType.DESPESA).mapToLong(TransactionEntity::getAmountCents).sum();

        List<BudgetEntity> budgets = budgetRepository.findByEnvironmentIdAndMonthOrderByCategoryNameAsc(environment.getId(), month.toString());
        long budgetTotal = budgets.stream().mapToLong(BudgetEntity::getLimitCents).sum();

        Map<UUID, Long> byCategory = monthTx
            .stream()
            .filter(t -> t.getType() == TransactionType.DESPESA)
            .collect(Collectors.groupingBy(t -> t.getCategory().getId(), Collectors.summingLong(TransactionEntity::getAmountCents)));
        List<DashboardResponse.CategoryExpenseItem> items = new ArrayList<>();
        byCategory.forEach((categoryId, amount) -> {
            String categoryName = monthTx
                .stream()
                .map(TransactionEntity::getCategory)
                .filter(c -> c.getId().equals(categoryId))
                .findFirst()
                .map(CategoryEntity::getName)
                .orElse("Categoria");
            items.add(new DashboardResponse.CategoryExpenseItem(categoryName, amount));
        });
        items.sort(Comparator.comparingLong(DashboardResponse.CategoryExpenseItem::amountCents).reversed());

        return new DashboardResponse(
            month.toString(),
            receitas,
            despesas,
            receitas - despesas,
            budgetTotal,
            budgetTotal > 0 && despesas <= budgetTotal,
            previousDespesas,
            despesas - previousDespesas,
            items
        );
    }

    @Transactional
    public FinanceDataResponse resetToSeed(UUID userId) {
        return resetToSeed(userId, null);
    }

    @Transactional
    public FinanceDataResponse resetToSeed(UUID userId, UUID environmentId) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        UserAccount user = requiredUser(userId);
        transactionRepository.deleteAllByEnvironmentId(environment.getId());
        budgetRepository.deleteAllByEnvironmentId(environment.getId());
        categoryRepository.deleteAllByEnvironmentId(environment.getId());
        seedService.ensureDefaultCategories(environment, user);
        return load(userId, environment.getId());
    }

    private UserAccount requiredUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private YearMonth parseMonth(String month) {
        try {
            return YearMonth.parse(month.trim());
        } catch (DateTimeParseException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid month format. Use YYYY-MM");
        }
    }

    private DateRange resolveDateRange(String month, String dateFrom, String dateTo) {
        if (month != null && !month.isBlank()) {
            YearMonth ym = parseMonth(month);
            return new DateRange(ym.atDay(1), ym.atEndOfMonth());
        }

        LocalDate start = dateFrom == null || dateFrom.isBlank() ? LocalDate.of(2000, 1, 1) : parseTransactionDate(dateFrom);
        LocalDate end = dateTo == null || dateTo.isBlank() ? LocalDate.of(2200, 12, 31) : parseTransactionDate(dateTo);
        if (start.isAfter(end)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "dateFrom must be before or equal to dateTo");
        }
        return new DateRange(start, end);
    }

    private LocalDate parseDate(String dateRaw) {
        try {
            return LocalDate.parse(dateRaw.trim());
        } catch (DateTimeParseException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid occurredOn format. Use YYYY-MM-DD");
        }
    }

    private LocalDate parseTransactionDate(String dateRaw) {
        LocalDate date = parseDate(dateRaw);
        if (date.isBefore(LocalDate.of(2000, 1, 1)) || date.isAfter(LocalDate.of(2200, 12, 31))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction date must be between 2000-01-01 and 2200-12-31");
        }
        return date;
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizeEmoji(String emoji) {
        if (emoji == null) {
            return null;
        }
        String trimmed = emoji.trim();
        if (trimmed.isBlank()) {
            return null;
        }
        return trimmed.length() > 16 ? trimmed.substring(0, 16) : trimmed;
    }

    private CategoryDto toCategoryDto(CategoryEntity entity) {
        return new CategoryDto(entity.getId(), entity.getName(), entity.getType(), entity.getEmoji());
    }

    private TransactionDto toTransactionDto(TransactionEntity entity) {
        return new TransactionDto(
            entity.getId(),
            entity.getType(),
            entity.getCategory().getId(),
            entity.getDescription(),
            entity.getAmountCents(),
            entity.getOccurredOn(),
            entity.getCreatedAt(),
            toUserSummary(entity.getCreatedByUser() != null ? entity.getCreatedByUser() : entity.getUser())
        );
    }

    private BudgetDto toBudgetDto(BudgetEntity entity) {
        return new BudgetDto(entity.getId(), entity.getMonth(), entity.getCategory().getId(), entity.getLimitCents(), entity.getCreatedAt());
    }

    private UserSummaryDto toUserSummary(UserAccount user) {
        if (user == null) return null;
        return new UserSummaryDto(user.getId(), user.getName(), user.getEmail());
    }

    private String normalizeSearch(String search) {
        if (search == null) return null;
        String trimmed = search.trim();
        if (trimmed.isBlank()) return null;
        return Normalizer.normalize(trimmed, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    private Long parseSearchAmountCents(String search) {
        if (search == null) return null;
        String normalized = search.replaceAll("[^0-9,.-]", "").replace(".", "").replace(",", ".");
        if (normalized.isBlank() || normalized.equals("-") || normalized.equals(".")) return null;
        try {
            double value = Double.parseDouble(normalized);
            if (!Double.isFinite(value) || value < 0) return null;
            return Math.round(value * 100);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private record DateRange(LocalDate start, LocalDate end) {}
}
