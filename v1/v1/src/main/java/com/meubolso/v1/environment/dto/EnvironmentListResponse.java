package com.meubolso.v1.environment.dto;

import java.util.List;

public record EnvironmentListResponse(List<EnvironmentDto> createdByMe, List<EnvironmentDto> sharedWithMe) {}
