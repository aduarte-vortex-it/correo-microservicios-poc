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
    public UserAggregate updateUser(UserAggregate user) {
        if (!userRepository.existsById(user.getId())) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }
        
        // Verificar si el email ya existe en otro usuario
        Optional<UserAggregate> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
            throw new IllegalArgumentException("El email ya está registrado en otro usuario");
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