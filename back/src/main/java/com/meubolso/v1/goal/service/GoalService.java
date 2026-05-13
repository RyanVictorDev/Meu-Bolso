package com.meubolso.v1.goal.service;

import com.meubolso.v1.goal.entity.GoalContributionEntity;
import com.meubolso.v1.goal.entity.GoalEntity;
import com.meubolso.v1.goal.repository.GoalContributionRepository;
import com.meubolso.v1.goal.repository.GoalRepository;
import com.meubolso.v1.user.repository.UserAccountRepository;
import com.meubolso.v1.common.exceptions.ApiException;
import com.meubolso.v1.environment.entity.EnvironmentEntity;
import com.meubolso.v1.environment.service.EnvironmentService;
import com.meubolso.v1.finance.dto.UserSummaryDto;
import com.meubolso.v1.goal.dto.AddGoalContributionRequest;
import com.meubolso.v1.goal.dto.AddGoalRequest;
import com.meubolso.v1.goal.dto.GoalContributionDto;
import com.meubolso.v1.goal.dto.GoalDto;
import com.meubolso.v1.goal.dto.UpdateGoalRequest;
import com.meubolso.v1.user.entity.UserAccount;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {
    private final GoalRepository goalRepository;
    private final GoalContributionRepository contributionRepository;
    private final EnvironmentService environmentService;
    private final UserAccountRepository userRepository;
    private final Clock clock;

    public GoalService(
        GoalRepository goalRepository,
        GoalContributionRepository contributionRepository,
        EnvironmentService environmentService,
        UserAccountRepository userRepository,
        Clock clock
    ) {
        this.goalRepository = goalRepository;
        this.contributionRepository = contributionRepository;
        this.environmentService = environmentService;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<GoalDto> list(UUID userId, UUID environmentId) {
        EnvironmentEntity environment = environmentService.requireAccess(userId, environmentId).getEnvironment();
        List<GoalEntity> goals = goalRepository.findByEnvironmentIdOrderByCreatedAtDesc(environment.getId());
        if (goals.isEmpty()) {
            return List.of();
        }

        Map<UUID, List<GoalContributionEntity>> contributionsByGoal = contributionRepository
            .findByGoalIdInOrderByContributedOnDesc(goals.stream().map(GoalEntity::getId).toList())
            .stream()
            .collect(Collectors.groupingBy(contribution -> contribution.getGoal().getId()));

        return goals.stream().map(goal -> toDtoFromEntities(goal, contributionsByGoal.getOrDefault(goal.getId(), List.of()))).toList();
    }

    @Transactional
    public GoalDto create(UUID userId, UUID environmentId, AddGoalRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        UserAccount user = requiredUser(userId);
        GoalEntity goal = goalRepository.save(
            GoalEntity
                .builder()
                .id(UUID.randomUUID())
                .environment(environment)
                .createdByUser(user)
                .name(request.name().trim())
                .description(normalizeText(request.description()))
                .targetCents(request.targetCents())
                .dueOn(parseGoalDueOn(request.dueOn()))
                .archived(false)
                .createdAt(clock.instant())
                .build()
        );
        return toDto(goal);
    }

    @Transactional
    public GoalDto update(UUID userId, UUID environmentId, UUID goalId, UpdateGoalRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        GoalEntity goal = requireGoal(goalId, environment.getId());
        goal.setName(request.name().trim());
        goal.setDescription(normalizeText(request.description()));
        goal.setTargetCents(request.targetCents());
        goal.setDueOn(parseGoalDueOn(request.dueOn()));
        goal.setArchived(request.archived());
        return toDto(goalRepository.save(goal));
    }

    @Transactional
    public void delete(UUID userId, UUID environmentId, UUID goalId) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        goalRepository.delete(requireGoal(goalId, environment.getId()));
    }

    @Transactional
    public GoalDto addContribution(UUID userId, UUID environmentId, UUID goalId, AddGoalContributionRequest request) {
        EnvironmentEntity environment = environmentService.requireEditor(userId, environmentId).getEnvironment();
        GoalEntity goal = requireGoal(goalId, environment.getId());
        UserAccount user = requiredUser(userId);
        if (goal.isArchived()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Não é possível aportar em uma meta arquivada");
        }
        contributionRepository.save(
            GoalContributionEntity
                .builder()
                .id(UUID.randomUUID())
                .goal(goal)
                .createdByUser(user)
                .amountCents(request.amountCents())
                .contributedOn(parseContributionDate(goal, request.contributedOn()))
                .note(normalizeText(request.note()))
                .createdAt(clock.instant())
                .build()
        );
        return toDto(goal);
    }

    private GoalEntity requireGoal(UUID goalId, UUID environmentId) {
        return goalRepository
            .findByIdAndEnvironmentId(goalId, environmentId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Meta não encontrada"));
    }

    private GoalDto toDto(GoalEntity goal) {
        List<GoalContributionDto> contributions = contributionRepository
            .findByGoalIdOrderByContributedOnDesc(goal.getId())
            .stream()
            .map(this::toContributionDto)
            .toList();
        return toDto(goal, contributions);
    }

    private GoalDto toDtoFromEntities(GoalEntity goal, List<GoalContributionEntity> contributions) {
        return toDto(goal, contributions.stream().map(this::toContributionDto).toList());
    }

    private GoalDto toDto(GoalEntity goal, List<GoalContributionDto> contributions) {
        long current = contributions.stream().mapToLong(GoalContributionDto::amountCents).sum();
        return new GoalDto(
            goal.getId(),
            goal.getName(),
            goal.getDescription(),
            goal.getTargetCents(),
            current,
            goal.getDueOn(),
            goal.isArchived(),
            goal.getCreatedAt(),
            toUserSummary(goal.getCreatedByUser()),
            contributions
        );
    }

    private GoalContributionDto toContributionDto(GoalContributionEntity contribution) {
        return new GoalContributionDto(
            contribution.getId(),
            contribution.getGoal().getId(),
            contribution.getAmountCents(),
            contribution.getContributedOn(),
            contribution.getNote(),
            contribution.getCreatedAt(),
            toUserSummary(contribution.getCreatedByUser())
        );
    }

    private UserSummaryDto toUserSummary(UserAccount user) {
        return new UserSummaryDto(user.getId(), user.getName(), user.getEmail());
    }

    private UserAccount requiredUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private LocalDate parseGoalDueOn(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Informe o prazo da meta");
        }
        LocalDate dueOn = parseDate(raw);
        if (dueOn.isBefore(LocalDate.now(clock))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "O prazo da meta não pode ser no passado");
        }
        return dueOn;
    }

    private LocalDate parseDate(String raw) {
        try {
            return LocalDate.parse(raw.trim());
        } catch (DateTimeParseException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid date format. Use YYYY-MM-DD");
        }
    }

    private LocalDate parseContributionDate(GoalEntity goal, String raw) {
        LocalDate contributedOn = parseDate(raw);
        if (contributedOn.isAfter(LocalDate.now(clock))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A data do aporte não pode ser no futuro");
        }
        if (goal.getDueOn() != null && contributedOn.isAfter(goal.getDueOn())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A data do aporte não pode passar do prazo da meta");
        }
        return contributedOn;
    }

    private String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
