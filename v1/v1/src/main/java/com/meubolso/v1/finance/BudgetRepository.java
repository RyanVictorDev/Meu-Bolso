package com.meubolso.v1.finance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<BudgetEntity, UUID> {
    List<BudgetEntity> findByUserIdAndMonthOrderByCategoryNameAsc(UUID userId, String month);

    List<BudgetEntity> findByUserIdOrderByMonthDesc(UUID userId);

    Optional<BudgetEntity> findByUserIdAndMonthAndCategoryId(UUID userId, String month, UUID categoryId);
}
