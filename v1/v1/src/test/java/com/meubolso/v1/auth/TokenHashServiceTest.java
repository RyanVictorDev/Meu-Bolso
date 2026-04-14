package com.meubolso.v1.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class TokenHashServiceTest {

    private final TokenHashService tokenHashService = new TokenHashService();

    @Test
    void hashShouldBeDeterministic() {
        String first = tokenHashService.hash("refresh-token-value");
        String second = tokenHashService.hash("refresh-token-value");
        assertEquals(first, second);
    }

    @Test
    void hashShouldChangeWithInput() {
        String first = tokenHashService.hash("token-a");
        String second = tokenHashService.hash("token-b");
        assertNotEquals(first, second);
    }
}
