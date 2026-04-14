package com.meubolso.v1.config;

import com.meubolso.v1.user.UserAccount;
import com.meubolso.v1.user.UserAccountRepository;
import java.time.Clock;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeedRunner implements CommandLineRunner {
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeedRunner(
        UserAccountRepository userAccountRepository,
        PasswordEncoder passwordEncoder,
        Clock clock,
        @Value("${app.seed.admin.name:Administrador}") String adminName,
        @Value("${app.seed.admin.email:admin@gggg.com}") String adminEmail,
        @Value("${app.seed.admin.password:admin@gggg.com}") String adminPassword
    ) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        if (userAccountRepository.findByEmail(normalizedEmail).isPresent()) {
            return;
        }

        UserAccount admin = UserAccount
            .builder()
            .id(UUID.randomUUID())
            .name(adminName.trim().isBlank() ? "Administrador" : adminName.trim())
            .email(normalizedEmail)
            .passwordHash(passwordEncoder.encode(adminPassword))
            .createdAt(clock.instant())
            .build();
        userAccountRepository.save(admin);
    }
}
