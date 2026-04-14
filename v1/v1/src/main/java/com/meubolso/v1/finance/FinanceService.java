package com.meubolso.v1.finance;

import com.meubolso.v1.common.ApiException;
import com.meubolso.v1.finance.dto.AddCategoryRequest;
import com.meubolso.v1.finance.dto.AddTransactionRequest;
import com.meubolso.v1.finance.dto.BudgetDto;
import com.meubolso.v1.finance.dto.CategoryDto;
import com.meubolso.v1.finance.dto.DashboardResponse;
import com.meubolso.v1.finance.dto.FinanceDataResponse;
import com.meubolso.v1.finance.dto.SetBudgetLimitRequest;
import com.meubolso.v1.finance.dto.TransactionDto;
import com.meubolso.v1.user.UserAccount;
import com.meubolso.v1.user.UserAccountRepository;
import java.time.Clock;
import java.time.Instant;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinanceService {
    private static final List<String> SEED_EXPENSES = List.of(
        "Moradia",
        "Alimentação",
        "Transporte",
        "Saúde",
        "Lazer",
        "Educação",
        "Contas",
        "Outros"
    );
    private static final List<String> SEED_REVENUES = List.of("Salário", "Freelance");

    private final UserAccountRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final Clock clock;

    public FinanceService(
        UserAccountRepository userRepository,
        CategoryRepository categoryRepository,
        TransactionRepository transactionRepository,
        BudgetRepository budgetRepository,
        Clock clock
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public FinanceDataResponse load(UUID userId) {
        List<CategoryDto> categories = categoryRepository.findByUserIdOrderByNameAsc(userId).stream().map(this::toCategoryDto).toList();
        List<TransactionDto> transactions = getTransactions(userId, null);
        List<BudgetDto> budgets = budgetRepository
            .findByUserIdOrderByMonthDesc(userId)
            .stream()
            .sorted(Comparator.comparing(BudgetEntity::getMonth).reversed())
            .map(this::toBudgetDto)
            .toList();
        return new FinanceDataResponse(categories, transactions, budgets);
    }

    @Transactional
    public CategoryDto addCategory(UUID userId, AddCategoryRequest request) {
        UserAccount user = requiredUser(userId);
        String name = request.name().trim();
        String normalizedName = name.toLowerCase(Locale.ROOT);
        return categoryRepository
            .findByUserIdAndTypeAndNormalizedName(userId, request.type(), normalizedName)
            .map(this::toCategoryDto)
            .orElseGet(() -> {
                CategoryEntity created = categoryRepository.save(
                    CategoryEntity
                        .builder()
                        .id(UUID.randomUUID())
                        .user(user)
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
                        .findByUserIdAndMonthAndCategoryId(userId, currentMonth, created.getId())
                        .orElseGet(() ->
                            budgetRepository.save(
                                BudgetEntity
                                    .builder()
                                    .id(UUID.randomUUID())
                                    .user(user)
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
    public TransactionDto addTransaction(UUID userId, AddTransactionRequest request) {
        UserAccount user = requiredUser(userId);
        CategoryEntity category = categoryRepository
            .findByIdAndUserId(request.categoryId(), userId)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid category"));
        if (category.getType() != request.type()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Transaction type must match category type");
        }
        LocalDate occurredOn = parseDate(request.occurredOn());
        TransactionEntity tx = transactionRepository.save(
            TransactionEntity
                .builder()
                .id(UUID.randomUUID())
                .user(user)
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
        if (month == null || month.isBlank()) {
            LocalDate start = LocalDate.of(2000, 1, 1);
            LocalDate end = LocalDate.of(2200, 12, 31);
            return transactionRepository
                .findByUserIdAndOccurredOnBetweenOrderByOccurredOnDesc(userId, start, end)
                .stream()
                .map(this::toTransactionDto)
                .toList();
        }
        YearMonth ym = parseMonth(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return transactionRepository
            .findByUserIdAndOccurredOnBetweenOrderByOccurredOnDesc(userId, start, end)
            .stream()
            .map(this::toTransactionDto)
            .toList();
    }

    @Transactional
    public BudgetDto setBudgetLimit(UUID userId, SetBudgetLimitRequest request) {
        UserAccount user = requiredUser(userId);
        YearMonth month = parseMonth(request.month());
        CategoryEntity category = categoryRepository
            .findByIdAndUserId(request.categoryId(), userId)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid category"));
        if (category.getType() != TransactionType.DESPESA) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Budget only allowed for DESPESA categories");
        }

        BudgetEntity budget = budgetRepository
            .findByUserIdAndMonthAndCategoryId(userId, month.toString(), category.getId())
            .map(existing -> {
                existing.setLimitCents(Math.max(0, request.limitCents()));
                return existing;
            })
            .orElseGet(() ->
                BudgetEntity
                    .builder()
                    .id(UUID.randomUUID())
                    .user(user)
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
        YearMonth month = parseMonth(monthRaw);
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<TransactionEntity> monthTx = transactionRepository.findByUserIdAndOccurredOnBetweenOrderByOccurredOnDesc(userId, start, end);
        long receitas = monthTx.stream().filter(t -> t.getType() == TransactionType.RECEITA).mapToLong(TransactionEntity::getAmountCents).sum();
        long despesas = monthTx.stream().filter(t -> t.getType() == TransactionType.DESPESA).mapToLong(TransactionEntity::getAmountCents).sum();

        List<BudgetEntity> budgets = budgetRepository.findByUserIdAndMonthOrderByCategoryNameAsc(userId, month.toString());
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
            items
        );
    }

    @Transactional
    public FinanceDataResponse resetToSeed(UUID userId) {
        UserAccount user = requiredUser(userId);
        LocalDate start = LocalDate.of(2000, 1, 1);
        LocalDate end = LocalDate.of(2200, 12, 31);
        List<TransactionEntity> transactions = transactionRepository.findByUserIdAndOccurredOnBetweenOrderByOccurredOnDesc(userId, start, end);
        transactionRepository.deleteAll(transactions);
        budgetRepository.deleteAll(budgetRepository.findByUserIdOrderByMonthDesc(userId));
        categoryRepository.deleteAll(categoryRepository.findByUserIdOrderByNameAsc(userId));

        Instant now = clock.instant();
        String month = YearMonth.now(clock).toString();
        List<CategoryEntity> categories = new ArrayList<>();
        for (String name : SEED_EXPENSES) {
            categories.add(
                categoryRepository.save(
                    CategoryEntity
                        .builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .name(name)
                        .normalizedName(name.toLowerCase(Locale.ROOT))
                        .type(TransactionType.DESPESA)
                        .createdAt(now)
                        .build()
                )
            );
        }
        for (String name : SEED_REVENUES) {
            categories.add(
                categoryRepository.save(
                    CategoryEntity
                        .builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .name(name)
                        .normalizedName(name.toLowerCase(Locale.ROOT))
                        .type(TransactionType.RECEITA)
                        .createdAt(now)
                        .build()
                )
            );
        }

        categories
            .stream()
            .filter(c -> c.getType() == TransactionType.DESPESA)
            .forEach(c ->
                budgetRepository.save(
                    BudgetEntity.builder().id(UUID.randomUUID()).user(user).month(month).category(c).limitCents(0).createdAt(now).build()
                )
            );

        CategoryEntity receita = categories.stream().filter(c -> c.getType() == TransactionType.RECEITA).findFirst().orElseThrow();
        CategoryEntity despesa = categories.stream().filter(c -> c.getType() == TransactionType.DESPESA).findFirst().orElseThrow();
        transactionRepository.save(
            TransactionEntity
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                .type(TransactionType.RECEITA)
                .category(receita)
                .description("Seed receita")
                .amountCents(500_000)
                .occurredOn(YearMonth.now(clock).atDay(5))
                .createdAt(now)
                .build()
        );
        transactionRepository.save(
            TransactionEntity
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                .type(TransactionType.DESPESA)
                .category(despesa)
                .description("Seed despesa")
                .amountCents(120_000)
                .occurredOn(YearMonth.now(clock).atDay(7))
                .createdAt(now)
                .build()
        );

        return load(userId);
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

    private LocalDate parseDate(String dateRaw) {
        try {
            return LocalDate.parse(dateRaw.trim());
        } catch (DateTimeParseException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid occurredOn format. Use YYYY-MM-DD");
        }
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
            entity.getCreatedAt()
        );
    }

    private BudgetDto toBudgetDto(BudgetEntity entity) {
        return new BudgetDto(entity.getId(), entity.getMonth(), entity.getCategory().getId(), entity.getLimitCents(), entity.getCreatedAt());
    }
}
