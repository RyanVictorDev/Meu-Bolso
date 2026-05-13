package com.meubolso.v1.goal.repository;

import com.meubolso.v1.goal.entity.GoalContributionEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalContributionRepository extends JpaRepository<GoalContributionEntity, UUID> {
    List<GoalContributionEntity> findByGoalIdOrderByContributedOnDesc(UUID goalId);

    List<GoalContributionEntity> findByGoalIdInOrderByContributedOnDesc(List<UUID> goalIds);
}
