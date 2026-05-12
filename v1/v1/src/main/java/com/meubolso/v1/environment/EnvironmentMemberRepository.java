package com.meubolso.v1.environment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentMemberRepository extends JpaRepository<EnvironmentMemberEntity, UUID> {
    List<EnvironmentMemberEntity> findByUserId(UUID userId);

    List<EnvironmentMemberEntity> findByEnvironmentId(UUID environmentId);

    Optional<EnvironmentMemberEntity> findByEnvironmentIdAndUserId(UUID environmentId, UUID userId);
}
