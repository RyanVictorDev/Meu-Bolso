package com.meubolso.v1.auth;

import com.meubolso.v1.auth.dto.AuthResponse;
import com.meubolso.v1.auth.dto.LoginRequest;
import com.meubolso.v1.auth.dto.RefreshRequest;
import com.meubolso.v1.auth.dto.RegisterRequest;
import com.meubolso.v1.common.ApiException;
import com.meubolso.v1.config.SecurityProperties;
import com.meubolso.v1.environment.EnvironmentService;
import com.meubolso.v1.user.UserAccount;
import com.meubolso.v1.user.UserAccountRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserAccountRepository userAccountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenHashService tokenHashService;
    private final AuthRateLimiter authRateLimiter;
    private final SecurityProperties securityProperties;
    private final EnvironmentService environmentService;
    private final Clock clock;

    public AuthService(
        UserAccountRepository userAccountRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        TokenHashService tokenHashService,
        AuthRateLimiter authRateLimiter,
        SecurityProperties securityProperties,
        EnvironmentService environmentService,
        Clock clock
    ) {
        this.userAccountRepository = userAccountRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenHashService = tokenHashService;
        this.authRateLimiter = authRateLimiter;
        this.securityProperties = securityProperties;
        this.environmentService = environmentService;
        this.clock = clock;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userAccountRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        UserAccount user = userAccountRepository.save(
            UserAccount
                .builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .createdAt(clock.instant())
                .build()
        );
        environmentService.createDefaultForUser(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        authRateLimiter.checkAllowed(email);
        UserAccount user = userAccountRepository.findByEmail(email).orElse(null);
        if (user == null) {
            authRateLimiter.recordFailure(email);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            authRateLimiter.recordFailure(email);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        authRateLimiter.reset(email);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String refreshToken = request.refreshToken().trim();
        String tokenHash = tokenHashService.hash(refreshToken);
        RefreshTokenEntity existing = refreshTokenRepository
            .findByTokenHash(tokenHash)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (existing.isRevoked() || existing.getExpiresAt().isBefore(clock.instant())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);
        return issueTokens(existing.getUser());
    }

    public AuthResponse.UserMeResponse getMe(UUID userId) {
        UserAccount user = userAccountRepository
            .findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return new AuthResponse.UserMeResponse(user.getId(), user.getName(), user.getEmail());
    }

    private AuthResponse issueTokens(UserAccount user) {
        Instant now = clock.instant();
        Instant accessTokenExpiresAt = now.plus(securityProperties.accessTokenMinutes(), ChronoUnit.MINUTES);
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());

        String refreshToken = UUID.randomUUID() + "." + UUID.randomUUID();
        RefreshTokenEntity refreshEntity = RefreshTokenEntity
            .builder()
            .id(UUID.randomUUID())
            .user(user)
            .tokenHash(tokenHashService.hash(refreshToken))
            .expiresAt(now.plus(securityProperties.refreshTokenDays(), ChronoUnit.DAYS))
            .revoked(false)
            .createdAt(now)
            .build();
        refreshTokenRepository.save(refreshEntity);

        return new AuthResponse(
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            new AuthResponse.UserMeResponse(user.getId(), user.getName(), user.getEmail())
        );
    }

    private String normalizeEmail(String rawEmail) {
        return rawEmail.trim().toLowerCase(Locale.ROOT);
    }
}
