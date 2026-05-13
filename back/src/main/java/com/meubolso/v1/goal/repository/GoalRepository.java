package com.meubolso.v1.goal.repository;

import com.meubolso.v1.goal.entity.GoalEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<GoalEntity, UUID> {
    List<GoalEntity> findByEnvironmentIdOrderByCreatedAtDesc(UUID environmentId);

    Optional<GoalEntity> findByIdAndEnvironmentId(UUID id, UUID environmentId);
}
