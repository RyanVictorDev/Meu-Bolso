package com.meubolso.v1.finance;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {
    List<TransactionEntity> findByUserIdAndOccurredOnBetweenOrderByOccurredOnDesc(UUID userId, LocalDate start, LocalDate end);

    List<TransactionEntity> findByUserIdAndOccurredOnBetweenAndTypeOrderByOccurredOnDesc(
        UUID userId,
        LocalDate start,
        LocalDate end,
        TransactionType type
    );
}
