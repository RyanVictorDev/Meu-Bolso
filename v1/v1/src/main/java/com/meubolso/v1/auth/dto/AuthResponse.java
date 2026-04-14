package com.meubolso.v1.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    Instant accessTokenExpiresAt,
    UserMeResponse user
) {
    public record UserMeResponse(UUID id, String name, String email) {}
}
