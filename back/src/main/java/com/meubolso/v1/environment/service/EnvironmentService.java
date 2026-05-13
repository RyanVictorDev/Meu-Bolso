package com.meubolso.v1.environment.service;

import com.meubolso.v1.environment.entity.EnvironmentEntity;
import com.meubolso.v1.environment.entity.EnvironmentMemberEntity;
import com.meubolso.v1.environment.enums.EnvironmentRole;
import com.meubolso.v1.environment.repository.EnvironmentMemberRepository;
import com.meubolso.v1.environment.repository.EnvironmentRepository;
import com.meubolso.v1.user.repository.UserAccountRepository;
import com.meubolso.v1.common.exceptions.ApiException;
import com.meubolso.v1.environment.dto.AddEnvironmentMemberRequest;
import com.meubolso.v1.environment.dto.CreateEnvironmentRequest;
import com.meubolso.v1.environment.dto.EnvironmentDto;
import com.meubolso.v1.environment.dto.EnvironmentListResponse;
import com.meubolso.v1.environment.dto.EnvironmentParticipantDto;
import com.meubolso.v1.environment.dto.UpdateEnvironmentMemberRoleRequest;
import com.meubolso.v1.environment.dto.UpdateEnvironmentRequest;
import com.meubolso.v1.finance.service.DefaultFinanceSeedService;
import com.meubolso.v1.user.entity.UserAccount;
import java.time.Clock;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EnvironmentService {
    private final EnvironmentRepository environmentRepository;
    private final EnvironmentMemberRepository memberRepository;
    private final UserAccountRepository userRepository;
    private final DefaultFinanceSeedService seedService;
    private final Clock clock;

    public EnvironmentService(
        EnvironmentRepository environmentRepository,
        EnvironmentMemberRepository memberRepository,
        UserAccountRepository userRepository,
        DefaultFinanceSeedService seedService,
        Clock clock
    ) {
        this.environmentRepository = environmentRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.seedService = seedService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public EnvironmentListResponse list(UUID userId) {
        List<EnvironmentDto> all = memberRepository
            .findByUserId(userId)
            .stream()
            .sorted(Comparator.comparing(member -> member.getEnvironment().getCreatedAt()))
            .map(member -> toDto(member.getEnvironment(), member.getRole(), userId))
            .toList();
        return new EnvironmentListResponse(
            all.stream().filter(EnvironmentDto::createdByMe).toList(),
            all.stream().filter(environment -> !environment.createdByMe()).toList()
        );
    }

    @Transactional
    public EnvironmentDto create(UUID userId, CreateEnvironmentRequest request) {
        UserAccount owner = requiredUser(userId);
        EnvironmentEntity environment = environmentRepository.save(
            EnvironmentEntity
                .builder()
                .id(UUID.randomUUID())
                .owner(owner)
                .name(request.name().trim())
                .description(normalizeDescription(request.description()))
                .createdAt(clock.instant())
                .build()
        );
        memberRepository.save(
            EnvironmentMemberEntity
                .builder()
                .id(UUID.randomUUID())
                .environment(environment)
                .user(owner)
                .role(EnvironmentRole.ADMIN)
                .createdAt(clock.instant())
                .build()
        );
        seedService.ensureDefaultCategories(environment, owner);
        return toDto(environment, EnvironmentRole.ADMIN, userId);
    }

    @Transactional
    public EnvironmentEntity createDefaultForUser(UserAccount owner) {
        return createDefaultForUser(owner, true);
    }

    @Transactional
    public EnvironmentEntity createDefaultForUser(UserAccount owner, boolean seedFinance) {
        EnvironmentEntity environment = environmentRepository.save(
            EnvironmentEntity
                .builder()
                .id(UUID.randomUUID())
                .owner(owner)
                .name("Meu ambiente")
                .description("Ambiente padrão")
                .createdAt(clock.instant())
                .build()
        );
        memberRepository.save(
            EnvironmentMemberEntity
                .builder()
                .id(UUID.randomUUID())
                .environment(environment)
                .user(owner)
                .role(EnvironmentRole.ADMIN)
                .createdAt(clock.instant())
                .build()
        );
        if (seedFinance) {
            seedService.ensureDefaultCategories(environment, owner);
        }
        return environment;
    }

    @Transactional(readOnly = true)
    public EnvironmentDto detail(UUID userId, UUID environmentId) {
        EnvironmentMemberEntity member = requireMembership(userId, environmentId);
        return toDto(member.getEnvironment(), member.getRole(), userId);
    }

    @Transactional
    public EnvironmentDto update(UUID userId, UUID environmentId, UpdateEnvironmentRequest request) {
        EnvironmentMemberEntity member = requireAdminMembership(userId, environmentId);
        EnvironmentEntity environment = member.getEnvironment();
        environment.setName(request.name().trim());
        environment.setDescription(normalizeDescription(request.description()));
        return toDto(environmentRepository.save(environment), member.getRole(), userId);
    }

    @Transactional
    public EnvironmentDto addMember(UUID userId, UUID environmentId, AddEnvironmentMemberRequest request) {
        EnvironmentMemberEntity admin = requireAdminMembership(userId, environmentId);
        UserAccount target = userRepository
            .findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        EnvironmentRole role = target.getId().equals(admin.getEnvironment().getOwner().getId()) ? EnvironmentRole.ADMIN : request.role();
        memberRepository
            .findByEnvironmentIdAndUserId(environmentId, target.getId())
            .map(existing -> {
                existing.setRole(role);
                return existing;
            })
            .orElseGet(() ->
                memberRepository.save(
                    EnvironmentMemberEntity
                        .builder()
                        .id(UUID.randomUUID())
                        .environment(admin.getEnvironment())
                        .user(target)
                        .role(role)
                        .createdAt(clock.instant())
                        .build()
                )
            );
        return toDto(admin.getEnvironment(), admin.getRole(), userId);
    }

    @Transactional
    public EnvironmentDto updateMemberRole(UUID userId, UUID environmentId, UUID targetUserId, UpdateEnvironmentMemberRoleRequest request) {
        EnvironmentMemberEntity admin = requireAdminMembership(userId, environmentId);
        EnvironmentMemberEntity target = memberRepository
            .findByEnvironmentIdAndUserId(environmentId, targetUserId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
        if (target.getUser().getId().equals(admin.getEnvironment().getOwner().getId())) {
            target.setRole(EnvironmentRole.ADMIN);
        } else {
            target.setRole(request.role());
        }
        return toDto(admin.getEnvironment(), admin.getRole(), userId);
    }

    @Transactional
    public EnvironmentDto removeMember(UUID userId, UUID environmentId, UUID targetUserId) {
        EnvironmentMemberEntity admin = requireAdminMembership(userId, environmentId);
        if (targetUserId.equals(admin.getEnvironment().getOwner().getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "O criador do ambiente não pode ser removido");
        }
        EnvironmentMemberEntity target = memberRepository
            .findByEnvironmentIdAndUserId(environmentId, targetUserId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Membro não encontrado"));
        memberRepository.delete(target);
        return toDto(admin.getEnvironment(), admin.getRole(), userId);
    }

    @Transactional
    public EnvironmentMemberEntity requireAccess(UUID userId, UUID environmentId) {
        return resolveMembership(userId, environmentId);
    }

    @Transactional
    public EnvironmentMemberEntity requireEditor(UUID userId, UUID environmentId) {
        EnvironmentMemberEntity member = resolveMembership(userId, environmentId);
        if (rank(member.getRole()) < rank(EnvironmentRole.EDITOR)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você não tem permissão para editar este ambiente");
        }
        return member;
    }

    @Transactional
    public EnvironmentMemberEntity requireAdmin(UUID userId, UUID environmentId) {
        return requireAdminMembership(userId, environmentId);
    }

    private EnvironmentMemberEntity resolveMembership(UUID userId, UUID environmentId) {
        if (environmentId != null) {
            return requireMembership(userId, environmentId);
        }
        List<EnvironmentMemberEntity> memberships = memberRepository.findByUserId(userId);
        if (!memberships.isEmpty()) {
            return memberships
                .stream()
                .min(Comparator.comparing(member -> member.getEnvironment().getCreatedAt()))
                .orElseThrow();
        }
        UserAccount user = requiredUser(userId);
        EnvironmentEntity environment = createDefaultForUser(user, true);
        return memberRepository.findByEnvironmentIdAndUserId(environment.getId(), userId).orElseThrow();
    }

    private EnvironmentMemberEntity requireMembership(UUID userId, UUID environmentId) {
        return memberRepository
            .findByEnvironmentIdAndUserId(environmentId, userId)
            .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Acesso ao ambiente negado"));
    }

    private EnvironmentMemberEntity requireAdminMembership(UUID userId, UUID environmentId) {
        EnvironmentMemberEntity member = requireMembership(userId, environmentId);
        if (member.getRole() != EnvironmentRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Apenas admins podem alterar este ambiente");
        }
        return member;
    }

    private EnvironmentDto toDto(EnvironmentEntity environment, EnvironmentRole role, UUID viewerId) {
        List<EnvironmentParticipantDto> participants = memberRepository
            .findByEnvironmentId(environment.getId())
            .stream()
            .sorted(Comparator.comparing(member -> member.getUser().getName()))
            .map(member ->
                new EnvironmentParticipantDto(
                    member.getUser().getId(),
                    member.getUser().getName(),
                    member.getUser().getEmail(),
                    member.getRole()
                )
            )
            .toList();
        return new EnvironmentDto(
            environment.getId(),
            environment.getName(),
            environment.getDescription(),
            environment.getOwner().getId(),
            role,
            environment.getOwner().getId().equals(viewerId),
            environment.getCreatedAt(),
            participants
        );
    }

    private int rank(EnvironmentRole role) {
        return switch (role) {
            case VIEWER -> 1;
            case EDITOR -> 2;
            case ADMIN -> 3;
        };
    }

    private UserAccount requiredUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String normalizeDescription(String description) {
        if (description == null) return null;
        String trimmed = description.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
