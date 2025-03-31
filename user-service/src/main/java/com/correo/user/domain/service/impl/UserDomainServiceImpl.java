package com.correo.user.domain.service.impl;

import com.correo.user.domain.aggregate.UserAggregate;
import com.correo.user.domain.service.UserDomainService;
import com.correo.user.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDomainServiceImpl implements UserDomainService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserAggregate> findAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserAggregate> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional
    public UserAggregate save(UserAggregate user) {
        return userRepository.save(user);
    }
} 