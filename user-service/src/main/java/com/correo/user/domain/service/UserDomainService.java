package com.correo.user.domain.service;

import com.correo.user.domain.aggregate.UserAggregate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserDomainService {
    List<UserAggregate> findAll();
    Optional<UserAggregate> findById(UUID id);
    UserAggregate save(UserAggregate user);
} 