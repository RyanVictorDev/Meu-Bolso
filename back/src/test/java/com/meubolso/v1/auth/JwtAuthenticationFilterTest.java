package com.meubolso.v1.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.meubolso.v1.config.SecurityProperties;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtAuthenticationFilterTest {
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final JwtService jwtService = new JwtService(
        new SecurityProperties("test-secret-key-that-must-be-long-enough-for-signature-123456789", 30, 14),
        Clock.fixed(Instant.parse("2026-05-12T00:00:00Z"), ZoneOffset.UTC)
    );
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService);

    @Test
    void shouldReturnJsonErrorWhenBearerTokenIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/finance");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        Map<?, ?> body = objectMapper.readValue(response.getContentAsString(), Map.class);
        assertEquals(401, response.getStatus());
        assertEquals("Missing bearer token", body.get("message"));
        assertEquals("/api/finance", body.get("path"));
    }

    @Test
    void shouldReturnJsonErrorWhenBearerTokenIsInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/finance");
        request.addHeader("Authorization", "Bearer invalid");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        Map<?, ?> body = objectMapper.readValue(response.getContentAsString(), Map.class);
        assertEquals(401, response.getStatus());
        assertEquals("Invalid token", body.get("message"));
        assertEquals("/api/finance", body.get("path"));
    }
}
