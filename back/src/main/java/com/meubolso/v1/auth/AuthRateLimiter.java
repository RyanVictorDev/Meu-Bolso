package com.meubolso.v1.auth;

import com.meubolso.v1.common.exceptions.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class AuthRateLimiter {
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long BLOCK_MINUTES = 15;

    private final Clock clock;
    private final ConcurrentHashMap<String, AttemptState> attempts = new ConcurrentHashMap<>();

    public AuthRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void checkAllowed(String key) {
        AttemptState state = attempts.get(key);
        if (state == null || state.blockedUntil == null || state.blockedUntil.isBefore(clock.instant())) {
            return;
        }
        throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas de login. Tente novamente mais tarde.");
    }

    public void recordFailure(String key) {
        Instant now = clock.instant();
        attempts.compute(key, (ignored, current) -> {
            int failures = current == null || current.blockedUntil != null && current.blockedUntil.isBefore(now) ? 1 : current.failures + 1;
            Instant blockedUntil = failures >= MAX_FAILED_ATTEMPTS ? now.plus(BLOCK_MINUTES, ChronoUnit.MINUTES) : null;
            return new AttemptState(failures, blockedUntil);
        });
    }

    public void reset(String key) {
        attempts.remove(key);
    }

    private record AttemptState(int failures, Instant blockedUntil) {}
}
