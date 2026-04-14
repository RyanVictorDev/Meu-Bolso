package com.meubolso.v1.auth;

import java.security.Principal;
import java.util.UUID;

public record AuthenticatedUser(UUID id) implements Principal {
    @Override
    public String getName() {
        return id.toString();
    }
}
