package com.meubolso.v1.finance.dto;

import java.util.UUID;

public record UserSummaryDto(UUID id, String name, String email) {}
