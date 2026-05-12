package com.meubolso.v1.goal;

import com.meubolso.v1.auth.AuthenticatedUser;
import com.meubolso.v1.goal.dto.AddGoalContributionRequest;
import com.meubolso.v1.goal.dto.AddGoalRequest;
import com.meubolso.v1.goal.dto.GoalDto;
import com.meubolso.v1.goal.dto.UpdateGoalRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public List<GoalDto> list(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(required = false) UUID environmentId) {
        return goalService.list(user.id(), environmentId);
    }

    @PostMapping
    public GoalDto create(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @Valid @RequestBody AddGoalRequest request
    ) {
        return goalService.create(user.id(), environmentId, request);
    }

    @PutMapping("/{goalId}")
    public GoalDto update(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @PathVariable UUID goalId,
        @Valid @RequestBody UpdateGoalRequest request
    ) {
        return goalService.update(user.id(), environmentId, goalId, request);
    }

    @DeleteMapping("/{goalId}")
    public void delete(@AuthenticationPrincipal AuthenticatedUser user, @RequestParam(required = false) UUID environmentId, @PathVariable UUID goalId) {
        goalService.delete(user.id(), environmentId, goalId);
    }

    @PostMapping("/{goalId}/contributions")
    public GoalDto addContribution(
        @AuthenticationPrincipal AuthenticatedUser user,
        @RequestParam(required = false) UUID environmentId,
        @PathVariable UUID goalId,
        @Valid @RequestBody AddGoalContributionRequest request
    ) {
        return goalService.addContribution(user.id(), environmentId, goalId, request);
    }
}
