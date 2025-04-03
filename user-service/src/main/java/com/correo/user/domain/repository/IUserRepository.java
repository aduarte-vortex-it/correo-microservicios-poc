package com.correo.user.domain.repository;

import com.correo.user.domain.aggregate.UserAggregate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IUserRepository {
    UserAggregate save(UserAggregate user);
    Optional<UserAggregate> findById(UUID id);
    List<UserAggregate> findAll();
    boolean existsByEmail(String email);
    boolean existsById(UUID id);
    Optional<UserAggregate> findByEmail(String email);
    void deleteById(UUID id);
} 