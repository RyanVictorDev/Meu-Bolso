package com.meubolso.v1.auth;

import com.meubolso.v1.config.SecurityProperties;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtServiceTest {

    @Test
    void shouldGenerateAndValidateAccessToken() {
        SecurityProperties properties = new SecurityProperties(
            "test-secret-key-that-must-be-long-enough-for-signature-123456789",
            30,
            14
        );
        Clock fixedClock = Clock.fixed(Instant.now().minus(1, ChronoUnit.MINUTES), ZoneOffset.UTC);
        JwtService jwtService = new JwtService(properties, fixedClock);

        UUID userId = UUID.randomUUID();
        String token = jwtService.generateAccessToken(userId, "user@test.com");
        UUID extracted = jwtService.validateAndGetUserId(token);

        assertEquals(userId, extracted);
    }
}
