package com.meubolso.v1.environment.dto;

import com.meubolso.v1.environment.enums.EnvironmentRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddEnvironmentMemberRequest(@NotBlank @Email @Size(max = 180) String email, @NotNull EnvironmentRole role) {}
