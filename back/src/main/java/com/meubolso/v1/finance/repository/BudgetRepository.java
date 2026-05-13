package com.meubolso.v1.finance.repository;

import com.meubolso.v1.finance.entity.BudgetEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BudgetRepository extends JpaRepository<BudgetEntity, UUID> {
    List<BudgetEntity> findByUserIdAndMonthOrderByCategoryNameAsc(UUID userId, String month);

    List<BudgetEntity> findByEnvironmentIdAndMonthOrderByCategoryNameAsc(UUID environmentId, String month);

    List<BudgetEntity> findByUserIdOrderByMonthDesc(UUID userId);

    List<BudgetEntity> findByEnvironmentIdOrderByMonthDesc(UUID environmentId);

    Optional<BudgetEntity> findByEnvironmentIdAndMonthAndCategoryId(UUID environmentId, String month, UUID categoryId);

    @Modifying
    @Query("delete from BudgetEntity b where b.environment.id = :environmentId")
    void deleteAllByEnvironmentId(@Param("environmentId") UUID environmentId);

    @Modifying
    @Query("delete from BudgetEntity b where b.category.id = :categoryId")
    void deleteByCategory_Id(@Param("categoryId") UUID categoryId);
}
