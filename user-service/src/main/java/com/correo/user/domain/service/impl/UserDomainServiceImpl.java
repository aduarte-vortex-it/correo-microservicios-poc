package com.correo.user.domain.service.impl;

import com.correo.user.domain.aggregate.UserAggregate;
import com.correo.user.domain.repository.IUserRepository;
import com.correo.user.domain.service.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDomainServiceImpl implements UserDomainService {
    private final IUserRepository userRepository;

    @Override
    public UserAggregate createUser(UserAggregate user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        return userRepository.save(user);
    }

    @Override
    public List<UserAggregate> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<UserAggregate> getUserById(UUID id) {
        return userRepository.findById(id);
    }
} 