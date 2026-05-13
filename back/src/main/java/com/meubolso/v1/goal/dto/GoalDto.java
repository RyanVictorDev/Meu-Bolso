package com.meubolso.v1.goal.dto;

import com.meubolso.v1.finance.dto.UserSummaryDto;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record GoalDto(
    UUID id,
    String name,
    String description,
    long targetCents,
    long currentCents,
    LocalDate dueOn,
    boolean archived,
    Instant createdAt,
    UserSummaryDto createdBy,
    List<GoalContributionDto> contributions
) {}
