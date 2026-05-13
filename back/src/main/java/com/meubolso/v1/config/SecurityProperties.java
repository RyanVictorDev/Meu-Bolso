package com.meubolso.v1.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "security.jwt")
public record SecurityProperties(
    @NotBlank @Size(min = 64) String secret,
    @Min(1) long accessTokenMinutes,
    @Min(1) long refreshTokenDays
) {}
