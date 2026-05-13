package com.meubolso.v1.auth;

import com.meubolso.v1.common.exceptions.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuthRateLimiterTest {
    private final AuthRateLimiter limiter = new AuthRateLimiter(Clock.fixed(Instant.parse("2026-05-12T00:00:00Z"), ZoneOffset.UTC));

    @Test
    void shouldBlockAfterTooManyFailures() {
        String key = "user@test.com";

        for (int i = 0; i < 5; i++) {
            limiter.recordFailure(key);
        }

        ApiException ex = assertThrows(ApiException.class, () -> limiter.checkAllowed(key));
        assertEquals(429, ex.getStatus().value());
    }

    @Test
    void shouldResetFailuresAfterSuccessfulLogin() {
        String key = "user@test.com";
        limiter.recordFailure(key);
        limiter.reset(key);

        assertDoesNotThrow(() -> limiter.checkAllowed(key));
    }
}
