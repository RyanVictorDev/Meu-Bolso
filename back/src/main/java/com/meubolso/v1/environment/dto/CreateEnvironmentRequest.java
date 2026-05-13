package com.meubolso.v1.environment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEnvironmentRequest(@NotBlank @Size(max = 120) String name, @Size(max = 280) String description) {}
