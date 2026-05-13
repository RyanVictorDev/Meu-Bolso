package com.meubolso.v1.finance;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {
    List<TransactionEntity> findByUserIdAndOccurredOnBetweenOrderByOccurredOnDesc(UUID userId, LocalDate start, LocalDate end);

    List<TransactionEntity> findByEnvironmentIdAndOccurredOnBetweenOrderByOccurredOnDesc(UUID environmentId, LocalDate start, LocalDate end);

    Page<TransactionEntity> findByEnvironmentIdAndOccurredOnBetween(UUID environmentId, LocalDate start, LocalDate end, Pageable pageable);

    @Query(
        """
        select t
        from TransactionEntity t
        left join t.category c
        left join t.createdByUser u
        where t.environment.id = :environmentId
          and t.occurredOn between :start and :end
          and (
            :search is null
            or lower(coalesce(t.description, '')) like lower(concat('%', :search, '%'))
            or lower(c.name) like lower(concat('%', :search, '%'))
            or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%'))
            or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
          )
        """
    )
    Page<TransactionEntity> searchByEnvironmentAndPeriod(
        @Param("environmentId") UUID environmentId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("search") String search,
        Pageable pageable
    );

    @Query(
        """
        select t
        from TransactionEntity t
        left join t.category c
        left join t.createdByUser u
        where t.environment.id = :environmentId
          and t.occurredOn between :start and :end
          and (
            :search is null
            or t.amountCents = :amountCents
            or lower(coalesce(t.description, '')) like lower(concat('%', :search, '%'))
            or lower(c.name) like lower(concat('%', :search, '%'))
            or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%'))
            or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
          )
        """
    )
    Page<TransactionEntity> searchByEnvironmentAndPeriodAndAmount(
        @Param("environmentId") UUID environmentId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("search") String search,
        @Param("amountCents") long amountCents,
        Pageable pageable
    );

    List<TransactionEntity> findByUserIdAndOccurredOnBetweenAndTypeOrderByOccurredOnDesc(
        UUID userId,
        LocalDate start,
        LocalDate end,
        TransactionType type
    );

    Optional<TransactionEntity> findByIdAndEnvironmentId(UUID id, UUID environmentId);

    @Modifying
    @Query("delete from TransactionEntity t where t.environment.id = :environmentId")
    void deleteAllByEnvironmentId(@Param("environmentId") UUID environmentId);
}
