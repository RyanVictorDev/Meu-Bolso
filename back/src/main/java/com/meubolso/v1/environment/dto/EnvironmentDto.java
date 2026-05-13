package com.meubolso.v1.environment.dto;

import com.meubolso.v1.environment.enums.EnvironmentRole;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EnvironmentDto(
    UUID id,
    String name,
    String description,
    UUID ownerUserId,
    EnvironmentRole role,
    boolean createdByMe,
    Instant createdAt,
    List<EnvironmentParticipantDto> participants
) {}
