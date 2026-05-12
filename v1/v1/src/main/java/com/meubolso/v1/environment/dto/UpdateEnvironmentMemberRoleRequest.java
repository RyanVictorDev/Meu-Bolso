package com.meubolso.v1.environment.dto;

import com.meubolso.v1.environment.EnvironmentRole;
import jakarta.validation.constraints.NotNull;

public record UpdateEnvironmentMemberRoleRequest(@NotNull EnvironmentRole role) {}
