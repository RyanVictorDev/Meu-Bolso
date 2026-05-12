package com.meubolso.v1.finance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<BudgetEntity, UUID> {
    List<BudgetEntity> findByUserIdAndMonthOrderByCategoryNameAsc(UUID userId, String month);

    List<BudgetEntity> findByEnvironmentIdAndMonthOrderByCategoryNameAsc(UUID environmentId, String month);

    List<BudgetEntity> findByUserIdOrderByMonthDesc(UUID userId);

    List<BudgetEntity> findByEnvironmentIdOrderByMonthDesc(UUID environmentId);

    Optional<BudgetEntity> findByEnvironmentIdAndMonthAndCategoryId(UUID environmentId, String month, UUID categoryId);
}
