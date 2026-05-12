package com.meubolso.v1.environment;

import com.meubolso.v1.auth.AuthenticatedUser;
import com.meubolso.v1.environment.dto.AddEnvironmentMemberRequest;
import com.meubolso.v1.environment.dto.CreateEnvironmentRequest;
import com.meubolso.v1.environment.dto.EnvironmentDto;
import com.meubolso.v1.environment.dto.EnvironmentListResponse;
import com.meubolso.v1.environment.dto.UpdateEnvironmentMemberRoleRequest;
import com.meubolso.v1.environment.dto.UpdateEnvironmentRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/environments")
public class EnvironmentController {
    private final EnvironmentService environmentService;

    public EnvironmentController(EnvironmentService environmentService) {
        this.environmentService = environmentService;
    }

    @GetMapping
    public EnvironmentListResponse list(@AuthenticationPrincipal AuthenticatedUser user) {
        return environmentService.list(user.id());
    }

    @PostMapping
    public EnvironmentDto create(@AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody CreateEnvironmentRequest request) {
        return environmentService.create(user.id(), request);
    }

    @GetMapping("/{environmentId}")
    public EnvironmentDto detail(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID environmentId) {
        return environmentService.detail(user.id(), environmentId);
    }

    @PutMapping("/{environmentId}")
    public EnvironmentDto update(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable UUID environmentId,
        @Valid @RequestBody UpdateEnvironmentRequest request
    ) {
        return environmentService.update(user.id(), environmentId, request);
    }

    @PostMapping("/{environmentId}/members")
    public EnvironmentDto addMember(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable UUID environmentId,
        @Valid @RequestBody AddEnvironmentMemberRequest request
    ) {
        return environmentService.addMember(user.id(), environmentId, request);
    }

    @PutMapping("/{environmentId}/members/{targetUserId}")
    public EnvironmentDto updateMemberRole(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable UUID environmentId,
        @PathVariable UUID targetUserId,
        @Valid @RequestBody UpdateEnvironmentMemberRoleRequest request
    ) {
        return environmentService.updateMemberRole(user.id(), environmentId, targetUserId, request);
    }

    @DeleteMapping("/{environmentId}/members/{targetUserId}")
    public EnvironmentDto removeMember(
        @AuthenticationPrincipal AuthenticatedUser user,
        @PathVariable UUID environmentId,
        @PathVariable UUID targetUserId
    ) {
        return environmentService.removeMember(user.id(), environmentId, targetUserId);
    }
}
