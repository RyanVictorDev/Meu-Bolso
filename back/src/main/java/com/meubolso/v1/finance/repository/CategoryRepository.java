package com.meubolso.v1.finance.repository;

import com.meubolso.v1.finance.entity.CategoryEntity;
import com.meubolso.v1.finance.enums.TransactionType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findByUserIdOrderByNameAsc(UUID userId);

    List<CategoryEntity> findByEnvironmentIdOrderByNameAsc(UUID environmentId);

    Optional<CategoryEntity> findByIdAndUserId(UUID categoryId, UUID userId);

    Optional<CategoryEntity> findByIdAndEnvironmentId(UUID categoryId, UUID environmentId);

    Optional<CategoryEntity> findByEnvironmentIdAndTypeAndNormalizedName(UUID environmentId, TransactionType type, String normalizedName);

    @Modifying
    @Query("delete from CategoryEntity c where c.environment.id = :environmentId")
    void deleteAllByEnvironmentId(@Param("environmentId") UUID environmentId);
}
