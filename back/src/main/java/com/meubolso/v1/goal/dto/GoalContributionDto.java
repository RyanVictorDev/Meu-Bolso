package com.meubolso.v1.goal.dto;

import com.meubolso.v1.finance.dto.UserSummaryDto;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GoalContributionDto(
    UUID id,
    UUID goalId,
    long amountCents,
    LocalDate contributedOn,
    String note,
    Instant createdAt,
    UserSummaryDto createdBy
) {}
