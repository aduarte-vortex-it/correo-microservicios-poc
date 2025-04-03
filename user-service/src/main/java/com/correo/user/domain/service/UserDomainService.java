package com.correo.user.domain.service;

import com.correo.user.domain.aggregate.UserAggregate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserDomainService {
    UserAggregate createUser(UserAggregate user);
    UserAggregate updateUser(UserAggregate user);
    List<UserAggregate> getAllUsers();
    Optional<UserAggregate> getUserById(UUID id);
    void deleteUser(UUID id);
} 