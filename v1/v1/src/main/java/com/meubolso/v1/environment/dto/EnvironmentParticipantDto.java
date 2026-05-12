package com.meubolso.v1.environment.dto;

import com.meubolso.v1.environment.EnvironmentRole;
import java.util.UUID;

public record EnvironmentParticipantDto(UUID userId, String name, String email, EnvironmentRole role) {}
