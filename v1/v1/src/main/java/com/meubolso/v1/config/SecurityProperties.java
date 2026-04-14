package com.meubolso.v1.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
public record SecurityProperties(String secret, long accessTokenMinutes, long refreshTokenDays) {}
