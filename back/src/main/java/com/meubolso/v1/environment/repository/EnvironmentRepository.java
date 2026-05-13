package com.meubolso.v1.environment.repository;

import com.meubolso.v1.environment.entity.EnvironmentEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentRepository extends JpaRepository<EnvironmentEntity, UUID> {}
