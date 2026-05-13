package com.meubolso.v1.finance;

import com.meubolso.v1.environment.EnvironmentEntity;
import com.meubolso.v1.user.UserAccount;
import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DefaultFinanceSeedService {
    private static final List<SeedCategory> SEED_EXPENSES = List.of(
        new SeedCategory("Moradia", ""),
        new SeedCategory("Alimentação", ""),
        new SeedCategory("Transporte", ""),
        new SeedCategory("Saúde", ""),
        new SeedCategory("Lazer", ""),
        new SeedCategory("Educação", ""),
        new SeedCategory("Contas", ""),
        new SeedCategory("Mercado", ""),
        new SeedCategory("Assinaturas", ""),
        new SeedCategory("Outros", "")
    );
    private static final List<SeedCategory> SEED_REVENUES = List.of(new SeedCategory("Salário", ""), new SeedCategory("Freelance", ""));

    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final Clock clock;

    public DefaultFinanceSeedService(CategoryRepository categoryRepository, BudgetRepository budgetRepository, Clock clock) {
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
        this.clock = clock;
    }

    public void ensureDefaultCategories(EnvironmentEntity environment, UserAccount actor) {
        Instant now = clock.instant();
        String month = YearMonth.now(clock).toString();
        for (SeedCategory seed : SEED_EXPENSES) {
            CategoryEntity category = categoryRepository
                .findByEnvironmentIdAndTypeAndNormalizedName(environment.getId(), TransactionType.DESPESA, normalize(seed.name()))
                .orElseGet(() ->
                    categoryRepository.save(
                        CategoryEntity
                            .builder()
                            .id(UUID.randomUUID())
                            .user(actor)
                            .environment(environment)
                            .name(seed.name())
                            .normalizedName(normalize(seed.name()))
                            .type(TransactionType.DESPESA)
                            .emoji(seed.emoji())
                            .createdAt(now)
                            .build()
                    )
                );
            budgetRepository
                .findByEnvironmentIdAndMonthAndCategoryId(environment.getId(), month, category.getId())
                .orElseGet(() ->
                    budgetRepository.save(
                        BudgetEntity
                            .builder()
                            .id(UUID.randomUUID())
                            .user(actor)
                            .environment(environment)
                            .month(month)
                            .category(category)
                            .limitCents(0)
                            .createdAt(now)
                            .build()
                    )
                );
        }
        for (SeedCategory seed : SEED_REVENUES) {
            categoryRepository
                .findByEnvironmentIdAndTypeAndNormalizedName(environment.getId(), TransactionType.RECEITA, normalize(seed.name()))
                .orElseGet(() ->
                    categoryRepository.save(
                        CategoryEntity
                            .builder()
                            .id(UUID.randomUUID())
                            .user(actor)
                            .environment(environment)
                            .name(seed.name())
                            .normalizedName(normalize(seed.name()))
                            .type(TransactionType.RECEITA)
                            .emoji(seed.emoji())
                            .createdAt(now)
                            .build()
                    )
                );
        }
    }

    private String normalize(String value) {
        return value.toLowerCase(Locale.ROOT);
    }

    private record SeedCategory(String name, String emoji) {}
}
