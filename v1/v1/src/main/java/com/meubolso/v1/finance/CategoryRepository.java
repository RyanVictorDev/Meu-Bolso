package com.meubolso.v1.finance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findByUserIdOrderByNameAsc(UUID userId);

    Optional<CategoryEntity> findByIdAndUserId(UUID categoryId, UUID userId);

    Optional<CategoryEntity> findByUserIdAndTypeAndNormalizedName(UUID userId, TransactionType type, String normalizedName);
}
